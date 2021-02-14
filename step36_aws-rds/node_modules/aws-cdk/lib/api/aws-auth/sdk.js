"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
const AWS = require("aws-sdk");
const logging_1 = require("../../logging");
const functions_1 = require("../../util/functions");
const account_cache_1 = require("./account-cache");
/**
 * Base functionality of SDK without credential fetching
 */
class SDK {
    constructor(_credentials, region, httpOptions = {}, sdkOptions = {}) {
        this._credentials = _credentials;
        this.sdkOptions = sdkOptions;
        /**
         * Default retry options for SDK clients.
         */
        this.retryOptions = { maxRetries: 6, retryDelayOptions: { base: 300 } };
        /**
         * The more generous retry policy for CloudFormation, which has a 1 TPM limit on certain APIs,
         * which are abundantly used for deployment tracking, ...
         *
         * So we're allowing way more retries, but waiting a bit more.
         */
        this.cloudFormationRetryOptions = { maxRetries: 10, retryDelayOptions: { base: 1000 } };
        this.config = {
            ...httpOptions,
            ...this.retryOptions,
            credentials: _credentials,
            region,
            logger: { log: (...messages) => messages.forEach(m => logging_1.trace('%s', m)) },
        };
        this.currentRegion = region;
    }
    cloudFormation() {
        return this.wrapServiceErrorHandling(new AWS.CloudFormation({
            ...this.config,
            ...this.cloudFormationRetryOptions,
        }));
    }
    ec2() {
        return this.wrapServiceErrorHandling(new AWS.EC2(this.config));
    }
    ssm() {
        return this.wrapServiceErrorHandling(new AWS.SSM(this.config));
    }
    s3() {
        return this.wrapServiceErrorHandling(new AWS.S3(this.config));
    }
    route53() {
        return this.wrapServiceErrorHandling(new AWS.Route53(this.config));
    }
    ecr() {
        return this.wrapServiceErrorHandling(new AWS.ECR(this.config));
    }
    elbv2() {
        return this.wrapServiceErrorHandling(new AWS.ELBv2(this.config));
    }
    async currentAccount() {
        // Get/refresh if necessary before we can access `accessKeyId`
        await this.forceCredentialRetrieval();
        return functions_1.cached(this, CURRENT_ACCOUNT_KEY, () => SDK.accountCache.fetch(this._credentials.accessKeyId, async () => {
            // if we don't have one, resolve from STS and store in cache.
            logging_1.debug('Looking up default account ID from STS');
            const result = await new AWS.STS(this.config).getCallerIdentity().promise();
            const accountId = result.Account;
            const partition = result.Arn.split(':')[1];
            if (!accountId) {
                throw new Error('STS didn\'t return an account ID');
            }
            logging_1.debug('Default account ID:', accountId);
            return { accountId, partition };
        }));
    }
    /**
     * Return the current credentials
     *
     * Don't use -- only used to write tests around assuming roles.
     */
    async currentCredentials() {
        await this.forceCredentialRetrieval();
        return this._credentials;
    }
    /**
     * Force retrieval of the current credentials
     *
     * Relevant if the current credentials are AssumeRole credentials -- do the actual
     * lookup, and translate any error into a useful error message (taking into
     * account credential provenance).
     */
    async forceCredentialRetrieval() {
        try {
            await this._credentials.getPromise();
        }
        catch (e) {
            logging_1.debug(`Assuming role failed: ${e.message}`);
            throw new Error([
                'Could not assume role in target account',
                ...this.sdkOptions.assumeRoleCredentialsSourceDescription
                    ? [`using ${this.sdkOptions.assumeRoleCredentialsSourceDescription}`]
                    : [],
                '(did you bootstrap the environment with the right \'--trust\'s?):',
                e.message,
            ].join(' '));
        }
    }
    /**
     * Return a wrapping object for the underlying service object
     *
     * Responds to failures in the underlying service calls, in two different
     * ways:
     *
     * - When errors are encountered, log the failing call and the error that
     *   it triggered (at debug level). This is necessary because the lack of
     *   stack traces in NodeJS otherwise makes it very hard to suss out where
     *   a certain AWS error occurred.
     * - The JS SDK has a funny business of wrapping any credential-based error
     *   in a super-generic (and in our case wrong) exception. If we then use a
     *   'ChainableTemporaryCredentials' and the target role doesn't exist,
     *   the error message that shows up by default is super misleading
     *   (https://github.com/aws/aws-sdk-js/issues/3272). We can fix this because
     *   the exception contains the "inner exception", so we unwrap and throw
     *   the correct error ("cannot assume role").
     *
     * The wrapping business below is slightly more complicated than you'd think
     * because we must hook into the `promise()` method of the object that's being
     * returned from the methods of the object that we wrap, so there's two
     * levels of wrapping going on, and also some exceptions to the wrapping magic.
     */
    wrapServiceErrorHandling(serviceObject) {
        const classObject = serviceObject.constructor.prototype;
        const self = this;
        return new Proxy(serviceObject, {
            get(obj, prop) {
                const real = obj[prop];
                // Things we don't want to intercept:
                // - Anything that's not a function.
                // - 'constructor', s3.upload() will use this to do some magic and we need the underlying constructor.
                // - Any method that's not on the service class (do not intercept 'makeRequest' and other helpers).
                if (prop === 'constructor' || !classObject.hasOwnProperty(prop) || !isFunction(real)) {
                    return real;
                }
                // NOTE: This must be a function() and not an () => {
                // because I need 'this' to be dynamically bound and not statically bound.
                // If your linter complains don't listen to it!
                return function () {
                    // Call the underlying function. If it returns an object with a promise()
                    // method on it, wrap that 'promise' method.
                    const args = [].slice.call(arguments, 0);
                    const response = real.apply(this, args);
                    // Don't intercept unless the return value is an object with a '.promise()' method.
                    if (typeof response !== 'object' || !response) {
                        return response;
                    }
                    if (!('promise' in response)) {
                        return response;
                    }
                    // Return an object with the promise method replaced with a wrapper which will
                    // do additional things to errors.
                    return Object.assign(Object.create(response), {
                        promise() {
                            return response.promise().catch((e) => {
                                e = self.makeDetailedException(e);
                                logging_1.debug(`Call failed: ${prop}(${JSON.stringify(args[0])}) => ${e.message}`);
                                return Promise.reject(e); // Re-'throw' the new error
                            });
                        },
                    });
                };
            },
        });
    }
    /**
     * Extract a more detailed error out of a generic error if we can
     *
     * If this is an error about Assuming Roles, add in the context showing the
     * chain of credentials we used to try to assume the role.
     */
    makeDetailedException(e) {
        // This is the super-generic "something's wrong" error that the JS SDK wraps other errors in.
        // https://github.com/aws/aws-sdk-js/blob/f0ac2e53457c7512883d0677013eacaad6cd8a19/lib/event_listeners.js#L84
        if (typeof e.message === 'string' && e.message.startsWith('Missing credentials in config')) {
            const original = e.originalError;
            if (original) {
                // When the SDK does a 'util.copy', they lose the Error-ness of the inner error
                // (they copy the Error's properties into a plain object) so make it an Error object again.
                e = Object.assign(new Error(), original);
            }
        }
        // At this point, the error might still be a generic "ChainableTemporaryCredentials failed"
        // error which wraps the REAL error (AssumeRole failed). We're going to replace the error
        // message with one that's more likely to help users, and tell them the most probable
        // fix (bootstrapping). The underlying service call failure will be appended below.
        if (e.message === 'Could not load credentials from ChainableTemporaryCredentials') {
            e.message = [
                'Could not assume role in target account',
                ...this.sdkOptions.assumeRoleCredentialsSourceDescription
                    ? [`using ${this.sdkOptions.assumeRoleCredentialsSourceDescription}`]
                    : [],
                '(did you bootstrap the environment with the right \'--trust\'s?)',
            ].join(' ');
        }
        // Replace the message on this error with a concatenation of all inner error messages.
        // Must more clear what's going on that way.
        e.message = allChainedExceptionMessages(e);
        return e;
    }
}
exports.SDK = SDK;
SDK.accountCache = new account_cache_1.AccountAccessKeyCache();
const CURRENT_ACCOUNT_KEY = Symbol('current_account_key');
function isFunction(x) {
    return x && {}.toString.call(x) === '[object Function]';
}
/**
 * Return the concatenated message of all exceptions in the AWS exception chain
 */
function allChainedExceptionMessages(e) {
    const ret = new Array();
    while (e) {
        ret.push(e.message);
        e = e.originalError;
    }
    return ret.join(': ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2RrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUErQjtBQUUvQiwyQ0FBNkM7QUFDN0Msb0RBQThDO0FBQzlDLG1EQUF3RDtBQTBDeEQ7O0dBRUc7QUFDSCxNQUFhLEdBQUc7SUFvQmQsWUFDbUIsWUFBNkIsRUFDOUMsTUFBYyxFQUNkLGNBQW9DLEVBQUUsRUFDckIsYUFBeUIsRUFBRTtRQUgzQixpQkFBWSxHQUFaLFlBQVksQ0FBaUI7UUFHN0IsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFqQjlDOztXQUVHO1FBQ2MsaUJBQVksR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUVwRjs7Ozs7V0FLRztRQUNjLCtCQUEwQixHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFLLEVBQUUsRUFBRSxDQUFDO1FBUW5HLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixHQUFHLFdBQVc7WUFDZCxHQUFHLElBQUksQ0FBQyxZQUFZO1lBQ3BCLFdBQVcsRUFBRSxZQUFZO1lBQ3pCLE1BQU07WUFDTixNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtTQUN4RSxDQUFDO1FBQ0YsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7SUFDOUIsQ0FBQztJQUVNLGNBQWM7UUFDbkIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDO1lBQzFELEdBQUcsSUFBSSxDQUFDLE1BQU07WUFDZCxHQUFHLElBQUksQ0FB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XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYXRpb25PcHRpb25zIH0gZnJvbSAnYXdzLXNkay9saWIvY29uZmlnLWJhc2UnO1xuaW1wb3J0IHsgZGVidWcsIHRyYWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQgeyBjYWNoZWQgfSBmcm9tICcuLi8uLi91dGlsL2Z1bmN0aW9ucyc7XG5pbXBvcnQgeyBBY2NvdW50QWNjZXNzS2V5Q2FjaGUgfSBmcm9tICcuL2FjY291bnQtY2FjaGUnO1xuaW1wb3J0IHsgQWNjb3VudCB9IGZyb20gJy4vc2RrLXByb3ZpZGVyJztcblxuLyoqIEBleHBlcmltZW50YWwgKi9cbmV4cG9ydCBpbnRlcmZhY2UgSVNESyB7XG4gIC8qKlxuICAgKiBUaGUgcmVnaW9uIHRoaXMgU0RLIGhhcyBiZWVuIGluc3RhbnRpYXRlZCBmb3JcbiAgICpcbiAgICogKEFzIGRpc3RpbmN0IGZyb20gdGhlIGBkZWZhdWx0UmVnaW9uKClgIG9uIFNka1Byb3ZpZGVyIHdoaWNoXG4gICAqIHJlcHJlc2VudHMgdGhlIHJlZ2lvbiBjb25maWd1cmVkIGluIHRoZSBkZWZhdWx0IGNvbmZpZykuXG4gICAqL1xuICByZWFkb25seSBjdXJyZW50UmVnaW9uOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBBY2NvdW50IHRoaXMgU0RLIGhhcyBiZWVuIGluc3RhbnRpYXRlZCBmb3JcbiAgICpcbiAgICogKEFzIGRpc3RpbmN0IGZyb20gdGhlIGBkZWZhdWx0QWNjb3VudCgpYCBvbiBTZGtQcm92aWRlciB3aGljaFxuICAgKiByZXByZXNlbnRzIHRoZSBhY2NvdW50IGF2YWlsYWJsZSBieSB1c2luZyBkZWZhdWx0IGNyZWRlbnRpYWxzKS5cbiAgICovXG4gIGN1cnJlbnRBY2NvdW50KCk6IFByb21pc2U8QWNjb3VudD47XG5cbiAgY2xvdWRGb3JtYXRpb24oKTogQVdTLkNsb3VkRm9ybWF0aW9uO1xuICBlYzIoKTogQVdTLkVDMjtcbiAgc3NtKCk6IEFXUy5TU007XG4gIHMzKCk6IEFXUy5TMztcbiAgcm91dGU1MygpOiBBV1MuUm91dGU1MztcbiAgZWNyKCk6IEFXUy5FQ1I7XG4gIGVsYnYyKCk6IEFXUy5FTEJ2Mjtcbn1cblxuLyoqXG4gKiBBZGRpdGlvbmFsIFNESyBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZGtPcHRpb25zIHtcbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZGVzY3JpcHRpdmUgc3RyaW5ncyB0aGF0IGluZGljYXRlIHdoZXJlIHRoZSBcIkFzc3VtZVJvbGVcIiBjcmVkZW50aWFscyBhcmUgY29taW5nIGZyb21cbiAgICpcbiAgICogV2lsbCBiZSBwcmludGVkIGluIGFuIGVycm9yIG1lc3NhZ2UgdG8gaGVscCB1c2VycyBkaWFnbm9zZSBhdXRoIHByb2JsZW1zLlxuICAgKi9cbiAgcmVhZG9ubHkgYXNzdW1lUm9sZUNyZWRlbnRpYWxzU291cmNlRGVzY3JpcHRpb24/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQmFzZSBmdW5jdGlvbmFsaXR5IG9mIFNESyB3aXRob3V0IGNyZWRlbnRpYWwgZmV0Y2hpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFNESyBpbXBsZW1lbnRzIElTREsge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBhY2NvdW50Q2FjaGUgPSBuZXcgQWNjb3VudEFjY2Vzc0tleUNhY2hlKCk7XG5cbiAgcHVibGljIHJlYWRvbmx5IGN1cnJlbnRSZWdpb246IHN0cmluZztcblxuICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZzogQ29uZmlndXJhdGlvbk9wdGlvbnM7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgcmV0cnkgb3B0aW9ucyBmb3IgU0RLIGNsaWVudHMuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHJldHJ5T3B0aW9ucyA9IHsgbWF4UmV0cmllczogNiwgcmV0cnlEZWxheU9wdGlvbnM6IHsgYmFzZTogMzAwIH0gfTtcblxuICAvKipcbiAgICogVGhlIG1vcmUgZ2VuZXJvdXMgcmV0cnkgcG9saWN5IGZvciBDbG91ZEZvcm1hdGlvbiwgd2hpY2ggaGFzIGEgMSBUUE0gbGltaXQgb24gY2VydGFpbiBBUElzLFxuICAgKiB3aGljaCBhcmUgYWJ1bmRhbnRseSB1c2VkIGZvciBkZXBsb3ltZW50IHRyYWNraW5nLCAuLi5cbiAgICpcbiAgICogU28gd2UncmUgYWxsb3dpbmcgd2F5IG1vcmUgcmV0cmllcywgYnV0IHdhaXRpbmcgYSBiaXQgbW9yZS5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgY2xvdWRGb3JtYXRpb25SZXRyeU9wdGlvbnMgPSB7IG1heFJldHJpZXM6IDEwLCByZXRyeURlbGF5T3B0aW9uczogeyBiYXNlOiAxXzAwMCB9IH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBfY3JlZGVudGlhbHM6IEFXUy5DcmVkZW50aWFscyxcbiAgICByZWdpb246IHN0cmluZyxcbiAgICBodHRwT3B0aW9uczogQ29uZmlndXJhdGlvbk9wdGlvbnMgPSB7fSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNka09wdGlvbnM6IFNka09wdGlvbnMgPSB7fSkge1xuXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAuLi5odHRwT3B0aW9ucyxcbiAgICAgIC4uLnRoaXMucmV0cnlPcHRpb25zLFxuICAgICAgY3JlZGVudGlhbHM6IF9jcmVkZW50aWFscyxcbiAgICAgIHJlZ2lvbixcbiAgICAgIGxvZ2dlcjogeyBsb2c6ICguLi5tZXNzYWdlcykgPT4gbWVzc2FnZXMuZm9yRWFjaChtID0+IHRyYWNlKCclcycsIG0pKSB9LFxuICAgIH07XG4gICAgdGhpcy5jdXJyZW50UmVnaW9uID0gcmVnaW9uO1xuICB9XG5cbiAgcHVibGljIGNsb3VkRm9ybWF0aW9uKCk6IEFXUy5DbG91ZEZvcm1hdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMud3JhcFNlcnZpY2VFcnJvckhhbmRsaW5nKG5ldyBBV1MuQ2xvdWRGb3JtYXRpb24oe1xuICAgICAgLi4udGhpcy5jb25maWcsXG4gICAgICAuLi50aGlzLmNsb3VkRm9ybWF0aW9uUmV0cnlPcHRpb25zLFxuICAgIH0pKTtcbiAgfVxuXG4gIHB1YmxpYyBlYzIoKTogQVdTLkVDMiB7XG4gICAgcmV0dXJuIHRoaXMud3JhcFNlcnZpY2VFcnJvckhhbmRsaW5nKG5ldyBBV1MuRUMyKHRoaXMuY29uZmlnKSk7XG4gIH1cblxuICBwdWJsaWMgc3NtKCk6IEFXUy5TU00ge1xuICAgIHJldHVybiB0aGlzLndyYXBTZXJ2aWNlRXJyb3JIYW5kbGluZyhuZXcgQVdTLlNTTSh0aGlzLmNvbmZpZykpO1xuICB9XG5cbiAgcHVibGljIHMzKCk6IEFXUy5TMyB7XG4gICAgcmV0dXJuIHRoaXMud3JhcFNlcnZpY2VFcnJvckhhbmRsaW5nKG5ldyBBV1MuUzModGhpcy5jb25maWcpKTtcbiAgfVxuXG4gIHB1YmxpYyByb3V0ZTUzKCk6IEFXUy5Sb3V0ZTUzIHtcbiAgICByZXR1cm4gdGhpcy53cmFwU2VydmljZUVycm9ySGFuZGxpbmcobmV3IEFXUy5Sb3V0ZTUzKHRoaXMuY29uZmlnKSk7XG4gIH1cblxuICBwdWJsaWMgZWNyKCk6IEFXUy5FQ1Ige1xuICAgIHJldHVybiB0aGlzLndyYXBTZXJ2aWNlRXJyb3JIYW5kbGluZyhuZXcgQVdTLkVDUih0aGlzLmNvbmZpZykpO1xuICB9XG5cbiAgcHVibGljIGVsYnYyKCk6IEFXUy5FTEJ2MiB7XG4gICAgcmV0dXJuIHRoaXMud3JhcFNlcnZpY2VFcnJvckhhbmRsaW5nKG5ldyBBV1MuRUxCdjIodGhpcy5jb25maWcpKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjdXJyZW50QWNjb3VudCgpOiBQcm9taXNlPEFjY291bnQ+IHtcbiAgICAvLyBHZXQvcmVmcmVzaCBpZiBuZWNlc3NhcnkgYmVmb3JlIHdlIGNhbiBhY2Nlc3MgYGFjY2Vzc0tleUlkYFxuICAgIGF3YWl0IHRoaXMuZm9yY2VDcmVkZW50aWFsUmV0cmlldmFsKCk7XG5cbiAgICByZXR1cm4gY2FjaGVkKHRoaXMsIENVUlJFTlRfQUNDT1VOVF9LRVksICgpID0+IFNESy5hY2NvdW50Q2FjaGUuZmV0Y2godGhpcy5fY3JlZGVudGlhbHMuYWNjZXNzS2V5SWQsIGFzeW5jICgpID0+IHtcbiAgICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgb25lLCByZXNvbHZlIGZyb20gU1RTIGFuZCBzdG9yZSBpbiBjYWNoZS5cbiAgICAgIGRlYnVnKCdMb29raW5nIHVwIGRlZmF1bHQgYWNjb3VudCBJRCBmcm9tIFNUUycpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IEFXUy5TVFModGhpcy5jb25maWcpLmdldENhbGxlcklkZW50aXR5KCkucHJvbWlzZSgpO1xuICAgICAgY29uc3QgYWNjb3VudElkID0gcmVzdWx0LkFjY291bnQ7XG4gICAgICBjb25zdCBwYXJ0aXRpb24gPSByZXN1bHQuQXJuIS5zcGxpdCgnOicpWzFdO1xuICAgICAgaWYgKCFhY2NvdW50SWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTVFMgZGlkblxcJ3QgcmV0dXJuIGFuIGFjY291bnQgSUQnKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnKCdEZWZhdWx0IGFjY291bnQgSUQ6JywgYWNjb3VudElkKTtcbiAgICAgIHJldHVybiB7IGFjY291bnRJZCwgcGFydGl0aW9uIH07XG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgY3VycmVudCBjcmVkZW50aWFsc1xuICAgKlxuICAgKiBEb24ndCB1c2UgLS0gb25seSB1c2VkIHRvIHdyaXRlIHRlc3RzIGFyb3VuZCBhc3N1bWluZyByb2xlcy5cbiAgICovXG4gIHB1YmxpYyBhc3luYyBjdXJyZW50Q3JlZGVudGlhbHMoKTogUHJvbWlzZTxBV1MuQ3JlZGVudGlhbHM+IHtcbiAgICBhd2FpdCB0aGlzLmZvcmNlQ3JlZGVudGlhbFJldHJpZXZhbCgpO1xuICAgIHJldHVybiB0aGlzLl9jcmVkZW50aWFscztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZSByZXRyaWV2YWwgb2YgdGhlIGN1cnJlbnQgY3JlZGVudGlhbHNcbiAgICpcbiAgICogUmVsZXZhbnQgaWYgdGhlIGN1cnJlbnQgY3JlZGVudGlhbHMgYXJlIEFzc3VtZVJvbGUgY3JlZGVudGlhbHMgLS0gZG8gdGhlIGFjdHVhbFxuICAgKiBsb29rdXAsIGFuZCB0cmFuc2xhdGUgYW55IGVycm9yIGludG8gYSB1c2VmdWwgZXJyb3IgbWVzc2FnZSAodGFraW5nIGludG9cbiAgICogYWNjb3VudCBjcmVkZW50aWFsIHByb3ZlbmFuY2UpLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZvcmNlQ3JlZGVudGlhbFJldHJpZXZhbCgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fY3JlZGVudGlhbHMuZ2V0UHJvbWlzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGRlYnVnKGBBc3N1bWluZyByb2xlIGZhaWxlZDogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoW1xuICAgICAgICAnQ291bGQgbm90IGFzc3VtZSByb2xlIGluIHRhcmdldCBhY2NvdW50JyxcbiAgICAgICAgLi4udGhpcy5zZGtPcHRpb25zLmFzc3VtZVJvbGVDcmVkZW50aWFsc1NvdXJjZURlc2NyaXB0aW9uXG4gICAgICAgICAgPyBbYHVzaW5nICR7dGhpcy5zZGtPcHRpb25zLmFzc3VtZVJvbGVDcmVkZW50aWFsc1NvdXJjZURlc2NyaXB0aW9ufWBdXG4gICAgICAgICAgOiBbXSxcbiAgICAgICAgJyhkaWQgeW91IGJvb3RzdHJhcCB0aGUgZW52aXJvbm1lbnQgd2l0aCB0aGUgcmlnaHQgXFwnLS10cnVzdFxcJ3M/KTonLFxuICAgICAgICBlLm1lc3NhZ2UsXG4gICAgICBdLmpvaW4oJyAnKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIHdyYXBwaW5nIG9iamVjdCBmb3IgdGhlIHVuZGVybHlpbmcgc2VydmljZSBvYmplY3RcbiAgICpcbiAgICogUmVzcG9uZHMgdG8gZmFpbHVyZXMgaW4gdGhlIHVuZGVybHlpbmcgc2VydmljZSBjYWxscywgaW4gdHdvIGRpZmZlcmVudFxuICAgKiB3YXlzOlxuICAgKlxuICAgKiAtIFdoZW4gZXJyb3JzIGFyZSBlbmNvdW50ZXJlZCwgbG9nIHRoZSBmYWlsaW5nIGNhbGwgYW5kIHRoZSBlcnJvciB0aGF0XG4gICAqICAgaXQgdHJpZ2dlcmVkIChhdCBkZWJ1ZyBsZXZlbCkuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGxhY2sgb2ZcbiAgICogICBzdGFjayB0cmFjZXMgaW4gTm9kZUpTIG90aGVyd2lzZSBtYWtlcyBpdCB2ZXJ5IGhhcmQgdG8gc3VzcyBvdXQgd2hlcmVcbiAgICogICBhIGNlcnRhaW4gQVdTIGVycm9yIG9jY3VycmVkLlxuICAgKiAtIFRoZSBKUyBTREsgaGFzIGEgZnVubnkgYnVzaW5lc3Mgb2Ygd3JhcHBpbmcgYW55IGNyZWRlbnRpYWwtYmFzZWQgZXJyb3JcbiAgICogICBpbiBhIHN1cGVyLWdlbmVyaWMgKGFuZCBpbiBvdXIgY2FzZSB3cm9uZykgZXhjZXB0aW9uLiBJZiB3ZSB0aGVuIHVzZSBhXG4gICAqICAgJ0NoYWluYWJsZVRlbXBvcmFyeUNyZWRlbnRpYWxzJyBhbmQgdGhlIHRhcmdldCByb2xlIGRvZXNuJ3QgZXhpc3QsXG4gICAqICAgdGhlIGVycm9yIG1lc3NhZ2UgdGhhdCBzaG93cyB1cCBieSBkZWZhdWx0IGlzIHN1cGVyIG1pc2xlYWRpbmdcbiAgICogICAoaHR0cHM6Ly9naXRodWIuY29tL2F3cy9hd3Mtc2RrLWpzL2lzc3Vlcy8zMjcyKS4gV2UgY2FuIGZpeCB0aGlzIGJlY2F1c2VcbiAgICogICB0aGUgZXhjZXB0aW9uIGNvbnRhaW5zIHRoZSBcImlubmVyIGV4Y2VwdGlvblwiLCBzbyB3ZSB1bndyYXAgYW5kIHRocm93XG4gICAqICAgdGhlIGNvcnJlY3QgZXJyb3IgKFwiY2Fubm90IGFzc3VtZSByb2xlXCIpLlxuICAgKlxuICAgKiBUaGUgd3JhcHBpbmcgYnVzaW5lc3MgYmVsb3cgaXMgc2xpZ2h0bHkgbW9yZSBjb21wbGljYXRlZCB0aGFuIHlvdSdkIHRoaW5rXG4gICAqIGJlY2F1c2Ugd2UgbXVzdCBob29rIGludG8gdGhlIGBwcm9taXNlKClgIG1ldGhvZCBvZiB0aGUgb2JqZWN0IHRoYXQncyBiZWluZ1xuICAgKiByZXR1cm5lZCBmcm9tIHRoZSBtZXRob2RzIG9mIHRoZSBvYmplY3QgdGhhdCB3ZSB3cmFwLCBzbyB0aGVyZSdzIHR3b1xuICAgKiBsZXZlbHMgb2Ygd3JhcHBpbmcgZ29pbmcgb24sIGFuZCBhbHNvIHNvbWUgZXhjZXB0aW9ucyB0byB0aGUgd3JhcHBpbmcgbWFnaWMuXG4gICAqL1xuICBwcml2YXRlIHdyYXBTZXJ2aWNlRXJyb3JIYW5kbGluZzxBIGV4dGVuZHMgb2JqZWN0PihzZXJ2aWNlT2JqZWN0OiBBKTogQSB7XG4gICAgY29uc3QgY2xhc3NPYmplY3QgPSBzZXJ2aWNlT2JqZWN0LmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJveHkoc2VydmljZU9iamVjdCwge1xuICAgICAgZ2V0KG9iajogQSwgcHJvcDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHJlYWwgPSAob2JqIGFzIGFueSlbcHJvcF07XG4gICAgICAgIC8vIFRoaW5ncyB3ZSBkb24ndCB3YW50IHRvIGludGVyY2VwdDpcbiAgICAgICAgLy8gLSBBbnl0aGluZyB0aGF0J3Mgbm90IGEgZnVuY3Rpb24uXG4gICAgICAgIC8vIC0gJ2NvbnN0cnVjdG9yJywgczMudXBsb2FkKCkgd2lsbCB1c2UgdGhpcyB0byBkbyBzb21lIG1hZ2ljIGFuZCB3ZSBuZWVkIHRoZSB1bmRlcmx5aW5nIGNvbnN0cnVjdG9yLlxuICAgICAgICAvLyAtIEFueSBtZXRob2QgdGhhdCdzIG5vdCBvbiB0aGUgc2VydmljZSBjbGFzcyAoZG8gbm90IGludGVyY2VwdCAnbWFrZVJlcXVlc3QnIGFuZCBvdGhlciBoZWxwZXJzKS5cbiAgICAgICAgaWYgKHByb3AgPT09ICdjb25zdHJ1Y3RvcicgfHwgIWNsYXNzT2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApIHx8ICFpc0Z1bmN0aW9uKHJlYWwpKSB7IHJldHVybiByZWFsOyB9XG5cbiAgICAgICAgLy8gTk9URTogVGhpcyBtdXN0IGJlIGEgZnVuY3Rpb24oKSBhbmQgbm90IGFuICgpID0+IHtcbiAgICAgICAgLy8gYmVjYXVzZSBJIG5lZWQgJ3RoaXMnIHRvIGJlIGR5bmFtaWNhbGx5IGJvdW5kIGFuZCBub3Qgc3RhdGljYWxseSBib3VuZC5cbiAgICAgICAgLy8gSWYgeW91ciBsaW50ZXIgY29tcGxhaW5zIGRvbid0IGxpc3RlbiB0byBpdCFcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IGFueSkge1xuICAgICAgICAgIC8vIENhbGwgdGhlIHVuZGVybHlpbmcgZnVuY3Rpb24uIElmIGl0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggYSBwcm9taXNlKClcbiAgICAgICAgICAvLyBtZXRob2Qgb24gaXQsIHdyYXAgdGhhdCAncHJvbWlzZScgbWV0aG9kLlxuICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSByZWFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gICAgICAgICAgLy8gRG9uJ3QgaW50ZXJjZXB0IHVubGVzcyB0aGUgcmV0dXJuIHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGEgJy5wcm9taXNlKCknIG1ldGhvZC5cbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnb2JqZWN0JyB8fCAhcmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlOyB9XG4gICAgICAgICAgaWYgKCEoJ3Byb21pc2UnIGluIHJlc3BvbnNlKSkgeyByZXR1cm4gcmVzcG9uc2U7IH1cblxuICAgICAgICAgIC8vIFJldHVybiBhbiBvYmplY3Qgd2l0aCB0aGUgcHJvbWlzZSBtZXRob2QgcmVwbGFjZWQgd2l0aCBhIHdyYXBwZXIgd2hpY2ggd2lsbFxuICAgICAgICAgIC8vIGRvIGFkZGl0aW9uYWwgdGhpbmdzIHRvIGVycm9ycy5cbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHJlc3BvbnNlKSwge1xuICAgICAgICAgICAgcHJvbWlzZSgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2UoKS5jYXRjaCgoZTogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBlID0gc2VsZi5tYWtlRGV0YWlsZWRFeGNlcHRpb24oZSk7XG4gICAgICAgICAgICAgICAgZGVidWcoYENhbGwgZmFpbGVkOiAke3Byb3B9KCR7SlNPTi5zdHJpbmdpZnkoYXJnc1swXSl9KSA9PiAke2UubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IC8vIFJlLSd0aHJvdycgdGhlIG5ldyBlcnJvclxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYSBtb3JlIGRldGFpbGVkIGVycm9yIG91dCBvZiBhIGdlbmVyaWMgZXJyb3IgaWYgd2UgY2FuXG4gICAqXG4gICAqIElmIHRoaXMgaXMgYW4gZXJyb3IgYWJvdXQgQXNzdW1pbmcgUm9sZXMsIGFkZCBpbiB0aGUgY29udGV4dCBzaG93aW5nIHRoZVxuICAgKiBjaGFpbiBvZiBjcmVkZW50aWFscyB3ZSB1c2VkIHRvIHRyeSB0byBhc3N1bWUgdGhlIHJvbGUuXG4gICAqL1xuICBwcml2YXRlIG1ha2VEZXRhaWxlZEV4Y2VwdGlvbihlOiBFcnJvcik6IEVycm9yIHtcbiAgICAvLyBUaGlzIGlzIHRoZSBzdXBlci1nZW5lcmljIFwic29tZXRoaW5nJ3Mgd3JvbmdcIiBlcnJvciB0aGF0IHRoZSBKUyBTREsgd3JhcHMgb3RoZXIgZXJyb3JzIGluLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLXNkay1qcy9ibG9iL2YwYWMyZTUzNDU3Yzc1MTI4ODNkMDY3NzAxM2VhY2FhZDZjZDhhMTkvbGliL2V2ZW50X2xpc3RlbmVycy5qcyNMODRcbiAgICBpZiAodHlwZW9mIGUubWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgZS5tZXNzYWdlLnN0YXJ0c1dpdGgoJ01pc3NpbmcgY3JlZGVudGlhbHMgaW4gY29uZmlnJykpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsID0gKGUgYXMgYW55KS5vcmlnaW5hbEVycm9yO1xuICAgICAgaWYgKG9yaWdpbmFsKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIFNESyBkb2VzIGEgJ3V0aWwuY29weScsIHRoZXkgbG9zZSB0aGUgRXJyb3ItbmVzcyBvZiB0aGUgaW5uZXIgZXJyb3JcbiAgICAgICAgLy8gKHRoZXkgY29weSB0aGUgRXJyb3IncyBwcm9wZXJ0aWVzIGludG8gYSBwbGFpbiBvYmplY3QpIHNvIG1ha2UgaXQgYW4gRXJyb3Igb2JqZWN0IGFnYWluLlxuICAgICAgICBlID0gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoKSwgb3JpZ2luYWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBlcnJvciBtaWdodCBzdGlsbCBiZSBhIGdlbmVyaWMgXCJDaGFpbmFibGVUZW1wb3JhcnlDcmVkZW50aWFscyBmYWlsZWRcIlxuICAgIC8vIGVycm9yIHdoaWNoIHdyYXBzIHRoZSBSRUFMIGVycm9yIChBc3N1bWVSb2xlIGZhaWxlZCkuIFdlJ3JlIGdvaW5nIHRvIHJlcGxhY2UgdGhlIGVycm9yXG4gICAgLy8gbWVzc2FnZSB3aXRoIG9uZSB0aGF0J3MgbW9yZSBsaWtlbHkgdG8gaGVscCB1c2VycywgYW5kIHRlbGwgdGhlbSB0aGUgbW9zdCBwcm9iYWJsZVxuICAgIC8vIGZpeCAoYm9vdHN0cmFwcGluZykuIFRoZSB1bmRlcmx5aW5nIHNlcnZpY2UgY2FsbCBmYWlsdXJlIHdpbGwgYmUgYXBwZW5kZWQgYmVsb3cuXG4gICAgaWYgKGUubWVzc2FnZSA9PT0gJ0NvdWxkIG5vdCBsb2FkIGNyZWRlbnRpYWxzIGZyb20gQ2hhaW5hYmxlVGVtcG9yYXJ5Q3JlZGVudGlhbHMnKSB7XG4gICAgICBlLm1lc3NhZ2UgPSBbXG4gICAgICAgICdDb3VsZCBub3QgYXNzdW1lIHJvbGUgaW4gdGFyZ2V0IGFjY291bnQnLFxuICAgICAgICAuLi50aGlzLnNka09wdGlvbnMuYXNzdW1lUm9sZUNyZWRlbnRpYWxzU291cmNlRGVzY3JpcHRpb25cbiAgICAgICAgICA/IFtgdXNpbmcgJHt0aGlzLnNka09wdGlvbnMuYXNzdW1lUm9sZUNyZWRlbnRpYWxzU291cmNlRGVzY3JpcHRpb259YF1cbiAgICAgICAgICA6IFtdLFxuICAgICAgICAnKGRpZCB5b3UgYm9vdHN0cmFwIHRoZSBlbnZpcm9ubWVudCB3aXRoIHRoZSByaWdodCBcXCctLXRydXN0XFwncz8pJyxcbiAgICAgIF0uam9pbignICcpO1xuICAgIH1cblxuICAgIC8vIFJlcGxhY2UgdGhlIG1lc3NhZ2Ugb24gdGhpcyBlcnJvciB3aXRoIGEgY29uY2F0ZW5hdGlvbiBvZiBhbGwgaW5uZXIgZXJyb3IgbWVzc2FnZXMuXG4gICAgLy8gTXVzdCBtb3JlIGNsZWFyIHdoYXQncyBnb2luZyBvbiB0aGF0IHdheS5cbiAgICBlLm1lc3NhZ2UgPSBhbGxDaGFpbmVkRXhjZXB0aW9uTWVzc2FnZXMoZSk7XG4gICAgcmV0dXJuIGU7XG4gIH1cbn1cblxuY29uc3QgQ1VSUkVOVF9BQ0NPVU5UX0tFWSA9IFN5bWJvbCgnY3VycmVudF9hY2NvdW50X2tleScpO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHg6IGFueSk6IHggaXMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkge1xuICByZXR1cm4geCAmJiB7fS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY29uY2F0ZW5hdGVkIG1lc3NhZ2Ugb2YgYWxsIGV4Y2VwdGlvbnMgaW4gdGhlIEFXUyBleGNlcHRpb24gY2hhaW5cbiAqL1xuZnVuY3Rpb24gYWxsQ2hhaW5lZEV4Y2VwdGlvbk1lc3NhZ2VzKGU6IEVycm9yIHwgdW5kZWZpbmVkKSB7XG4gIGNvbnN0IHJldCA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG4gIHdoaWxlIChlKSB7XG4gICAgcmV0LnB1c2goZS5tZXNzYWdlKTtcbiAgICBlID0gKGUgYXMgYW55KS5vcmlnaW5hbEVycm9yO1xuICB9XG4gIHJldHVybiByZXQuam9pbignOiAnKTtcbn1cbiJdfQ==