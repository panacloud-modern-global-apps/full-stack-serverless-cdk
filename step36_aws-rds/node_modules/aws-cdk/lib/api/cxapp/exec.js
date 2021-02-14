"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execProgram = void 0;
const childProcess = require("child_process");
const path = require("path");
const cxschema = require("@aws-cdk/cloud-assembly-schema");
const cxapi = require("@aws-cdk/cx-api");
const fs = require("fs-extra");
const logging_1 = require("../../logging");
const settings_1 = require("../../settings");
const version_1 = require("../../version");
/** Invokes the cloud executable and returns JSON output */
async function execProgram(aws, config) {
    var _a, _b, _c, _d, _e, _f;
    const env = {};
    const context = config.context.all;
    await populateDefaultEnvironmentIfNeeded(aws, env);
    const debugMode = (_a = config.settings.get(['debug'])) !== null && _a !== void 0 ? _a : true;
    if (debugMode) {
        env.CDK_DEBUG = 'true';
    }
    const pathMetadata = (_b = config.settings.get(['pathMetadata'])) !== null && _b !== void 0 ? _b : true;
    if (pathMetadata) {
        context[cxapi.PATH_METADATA_ENABLE_CONTEXT] = true;
    }
    const assetMetadata = (_c = config.settings.get(['assetMetadata'])) !== null && _c !== void 0 ? _c : true;
    if (assetMetadata) {
        context[cxapi.ASSET_RESOURCE_METADATA_ENABLED_CONTEXT] = true;
    }
    const versionReporting = (_d = config.settings.get(['versionReporting'])) !== null && _d !== void 0 ? _d : true;
    if (versionReporting) {
        context[cxapi.ANALYTICS_REPORTING_ENABLED_CONTEXT] = true;
    }
    // We need to keep on doing this for framework version from before this flag was deprecated.
    if (!versionReporting) {
        context['aws:cdk:disable-version-reporting'] = true;
    }
    const stagingEnabled = (_e = config.settings.get(['staging'])) !== null && _e !== void 0 ? _e : true;
    if (!stagingEnabled) {
        context[cxapi.DISABLE_ASSET_STAGING_CONTEXT] = true;
    }
    const bundlingStacks = (_f = config.settings.get(['bundlingStacks'])) !== null && _f !== void 0 ? _f : ['*'];
    context[cxapi.BUNDLING_STACKS] = bundlingStacks;
    logging_1.debug('context:', context);
    env[cxapi.CONTEXT_ENV] = JSON.stringify(context);
    const app = config.settings.get(['app']);
    if (!app) {
        throw new Error(`--app is required either in command-line, in ${settings_1.PROJECT_CONFIG} or in ${settings_1.USER_DEFAULTS}`);
    }
    // bypass "synth" if app points to a cloud assembly
    if (await fs.pathExists(app) && (await fs.stat(app)).isDirectory()) {
        logging_1.debug('--app points to a cloud assembly, so we bypass synth');
        return createAssembly(app);
    }
    const commandLine = await guessExecutable(appToArray(app));
    const outdir = config.settings.get(['output']);
    if (!outdir) {
        throw new Error('unexpected: --output is required');
    }
    await fs.mkdirp(outdir);
    logging_1.debug('outdir:', outdir);
    env[cxapi.OUTDIR_ENV] = outdir;
    // Send version information
    env[cxapi.CLI_ASM_VERSION_ENV] = cxschema.Manifest.version();
    env[cxapi.CLI_VERSION_ENV] = version_1.versionNumber();
    logging_1.debug('env:', env);
    await exec();
    return createAssembly(outdir);
    function createAssembly(appDir) {
        try {
            return new cxapi.CloudAssembly(appDir);
        }
        catch (error) {
            if (error.message.includes(cxschema.VERSION_MISMATCH)) {
                // this means the CLI version is too old.
                // we instruct the user to upgrade.
                throw new Error(`This CDK CLI is not compatible with the CDK library used by your application. Please upgrade the CLI to the latest version.\n(${error.message})`);
            }
            throw error;
        }
    }
    async function exec() {
        return new Promise((ok, fail) => {
            // We use a slightly lower-level interface to:
            //
            // - Pass arguments in an array instead of a string, to get around a
            //   number of quoting issues introduced by the intermediate shell layer
            //   (which would be different between Linux and Windows).
            //
            // - Inherit stderr from controlling terminal. We don't use the captured value
            //   anyway, and if the subprocess is printing to it for debugging purposes the
            //   user gets to see it sooner. Plus, capturing doesn't interact nicely with some
            //   processes like Maven.
            const proc = childProcess.spawn(commandLine[0], commandLine.slice(1), {
                stdio: ['ignore', 'inherit', 'inherit'],
                detached: false,
                shell: true,
                env: {
                    ...process.env,
                    ...env,
                },
            });
            proc.on('error', fail);
            proc.on('exit', code => {
                if (code === 0) {
                    return ok();
                }
                else {
                    return fail(new Error(`Subprocess exited with error ${code}`));
                }
            });
        });
    }
}
exports.execProgram = execProgram;
/**
 * If we don't have region/account defined in context, we fall back to the default SDK behavior
 * where region is retrieved from ~/.aws/config and account is based on default credentials provider
 * chain and then STS is queried.
 *
 * This is done opportunistically: for example, if we can't access STS for some reason or the region
 * is not configured, the context value will be 'null' and there could failures down the line. In
 * some cases, synthesis does not require region/account information at all, so that might be perfectly
 * fine in certain scenarios.
 *
 * @param context The context key/value bash.
 */
async function populateDefaultEnvironmentIfNeeded(aws, env) {
    var _a;
    env[cxapi.DEFAULT_REGION_ENV] = aws.defaultRegion;
    logging_1.debug(`Setting "${cxapi.DEFAULT_REGION_ENV}" environment variable to`, env[cxapi.DEFAULT_REGION_ENV]);
    const accountId = (_a = (await aws.defaultAccount())) === null || _a === void 0 ? void 0 : _a.accountId;
    if (accountId) {
        env[cxapi.DEFAULT_ACCOUNT_ENV] = accountId;
        logging_1.debug(`Setting "${cxapi.DEFAULT_ACCOUNT_ENV}" environment variable to`, env[cxapi.DEFAULT_ACCOUNT_ENV]);
    }
}
/**
 * Make sure the 'app' is an array
 *
 * If it's a string, split on spaces as a trivial way of tokenizing the command line.
 */
function appToArray(app) {
    return typeof app === 'string' ? app.split(' ') : app;
}
/**
 * Execute the given file with the same 'node' process as is running the current process
 */
function executeNode(scriptFile) {
    return [process.execPath, scriptFile];
}
/**
 * Mapping of extensions to command-line generators
 */
const EXTENSION_MAP = new Map([
    ['.js', executeNode],
]);
/**
 * Guess the executable from the command-line argument
 *
 * Only do this if the file is NOT marked as executable. If it is,
 * we'll defer to the shebang inside the file itself.
 *
 * If we're on Windows, we ALWAYS take the handler, since it's hard to
 * verify if registry associations have or have not been set up for this
 * file type, so we'll assume the worst and take control.
 */
async function guessExecutable(commandLine) {
    if (commandLine.length === 1) {
        let fstat;
        try {
            fstat = await fs.stat(commandLine[0]);
        }
        catch (error) {
            logging_1.debug(`Not a file: '${commandLine[0]}'. Using '${commandLine}' as command-line`);
            return commandLine;
        }
        // eslint-disable-next-line no-bitwise
        const isExecutable = (fstat.mode & fs.constants.X_OK) !== 0;
        const isWindows = process.platform === 'win32';
        const handler = EXTENSION_MAP.get(path.extname(commandLine[0]));
        if (handler && (!isExecutable || isWindows)) {
            return handler(commandLine[0]);
        }
    }
    return commandLine;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4ZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQThDO0FBQzlDLDZCQUE2QjtBQUM3QiwyREFBMkQ7QUFDM0QseUNBQXlDO0FBQ3pDLCtCQUErQjtBQUMvQiwyQ0FBc0M7QUFDdEMsNkNBQThFO0FBQzlFLDJDQUE4QztBQUc5QywyREFBMkQ7QUFDcEQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxHQUFnQixFQUFFLE1BQXFCOztJQUN2RSxNQUFNLEdBQUcsR0FBOEIsRUFBRyxDQUFDO0lBRTNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ25DLE1BQU0sa0NBQWtDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sU0FBUyxTQUFZLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsbUNBQUksSUFBSSxDQUFDO0lBQ2xFLElBQUksU0FBUyxFQUFFO1FBQ2IsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7S0FDeEI7SUFFRCxNQUFNLFlBQVksU0FBWSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLG1DQUFJLElBQUksQ0FBQztJQUM1RSxJQUFJLFlBQVksRUFBRTtRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ3BEO0lBRUQsTUFBTSxhQUFhLFNBQVksTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxtQ0FBSSxJQUFJLENBQUM7SUFDOUUsSUFBSSxhQUFhLEVBQUU7UUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUMvRDtJQUVELE1BQU0sZ0JBQWdCLFNBQVksTUFBTSxDQUFDLFFB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Q0FBQyxXQUFxQjtJQUNsRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzVCLElBQUksS0FBSyxDQUFDO1FBRVYsSUFBSTtZQUNGLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLGVBQUssQ0FBQyxnQkFBZ0IsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztZQUNqRixPQUFPLFdBQVcsQ0FBQztTQUNwQjtRQUVELHNDQUFzQztRQUN0QyxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUM7UUFFL0MsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxTQUFTLENBQUMsRUFBRTtZQUMzQyxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQztLQUNGO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBjeHNjaGVtYSBmcm9tICdAYXdzLWNkay9jbG91ZC1hc3NlbWJseS1zY2hlbWEnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uLCBQUk9KRUNUX0NPTkZJRywgVVNFUl9ERUZBVUxUUyB9IGZyb20gJy4uLy4uL3NldHRpbmdzJztcbmltcG9ydCB7IHZlcnNpb25OdW1iZXIgfSBmcm9tICcuLi8uLi92ZXJzaW9uJztcbmltcG9ydCB7IFNka1Byb3ZpZGVyIH0gZnJvbSAnLi4vYXdzLWF1dGgnO1xuXG4vKiogSW52b2tlcyB0aGUgY2xvdWQgZXhlY3V0YWJsZSBhbmQgcmV0dXJucyBKU09OIG91dHB1dCAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWNQcm9ncmFtKGF3czogU2RrUHJvdmlkZXIsIGNvbmZpZzogQ29uZmlndXJhdGlvbik6IFByb21pc2U8Y3hhcGkuQ2xvdWRBc3NlbWJseT4ge1xuICBjb25zdCBlbnY6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7IH07XG5cbiAgY29uc3QgY29udGV4dCA9IGNvbmZpZy5jb250ZXh0LmFsbDtcbiAgYXdhaXQgcG9wdWxhdGVEZWZhdWx0RW52aXJvbm1lbnRJZk5lZWRlZChhd3MsIGVudik7XG5cbiAgY29uc3QgZGVidWdNb2RlOiBib29sZWFuID0gY29uZmlnLnNldHRpbmdzLmdldChbJ2RlYnVnJ10pID8/IHRydWU7XG4gIGlmIChkZWJ1Z01vZGUpIHtcbiAgICBlbnYuQ0RLX0RFQlVHID0gJ3RydWUnO1xuICB9XG5cbiAgY29uc3QgcGF0aE1ldGFkYXRhOiBib29sZWFuID0gY29uZmlnLnNldHRpbmdzLmdldChbJ3BhdGhNZXRhZGF0YSddKSA/PyB0cnVlO1xuICBpZiAocGF0aE1ldGFkYXRhKSB7XG4gICAgY29udGV4dFtjeGFwaS5QQVRIX01FVEFEQVRBX0VOQUJMRV9DT05URVhUXSA9IHRydWU7XG4gIH1cblxuICBjb25zdCBhc3NldE1ldGFkYXRhOiBib29sZWFuID0gY29uZmlnLnNldHRpbmdzLmdldChbJ2Fzc2V0TWV0YWRhdGEnXSkgPz8gdHJ1ZTtcbiAgaWYgKGFzc2V0TWV0YWRhdGEpIHtcbiAgICBjb250ZXh0W2N4YXBpLkFTU0VUX1JFU09VUkNFX01FVEFEQVRBX0VOQUJMRURfQ09OVEVYVF0gPSB0cnVlO1xuICB9XG5cbiAgY29uc3QgdmVyc2lvblJlcG9ydGluZzogYm9vbGVhbiA9IGNvbmZpZy5zZXR0aW5ncy5nZXQoWyd2ZXJzaW9uUmVwb3J0aW5nJ10pID8/IHRydWU7XG4gIGlmICh2ZXJzaW9uUmVwb3J0aW5nKSB7IGNvbnRleHRbY3hhcGkuQU5BTFlUSUNTX1JFUE9SVElOR19FTkFCTEVEX0NPTlRFWFRdID0gdHJ1ZTsgfVxuICAvLyBXZSBuZWVkIHRvIGtlZXAgb24gZG9pbmcgdGhpcyBmb3IgZnJhbWV3b3JrIHZlcnNpb24gZnJvbSBiZWZvcmUgdGhpcyBmbGFnIHdhcyBkZXByZWNhdGVkLlxuICBpZiAoIXZlcnNpb25SZXBvcnRpbmcpIHsgY29udGV4dFsnYXdzOmNkazpkaXNhYmxlLXZlcnNpb24tcmVwb3J0aW5nJ10gPSB0cnVlOyB9XG5cbiAgY29uc3Qgc3RhZ2luZ0VuYWJsZWQgPSBjb25maWcuc2V0dGluZ3MuZ2V0KFsnc3RhZ2luZyddKSA/PyB0cnVlO1xuICBpZiAoIXN0YWdpbmdFbmFibGVkKSB7XG4gICAgY29udGV4dFtjeGFwaS5ESVNBQkxFX0FTU0VUX1NUQUdJTkdfQ09OVEVYVF0gPSB0cnVlO1xuICB9XG5cbiAgY29uc3QgYnVuZGxpbmdTdGFja3MgPSBjb25maWcuc2V0dGluZ3MuZ2V0KFsnYnVuZGxpbmdTdGFja3MnXSkgPz8gWycqJ107XG4gIGNvbnRleHRbY3hhcGkuQlVORExJTkdfU1RBQ0tTXSA9IGJ1bmRsaW5nU3RhY2tzO1xuXG4gIGRlYnVnKCdjb250ZXh0OicsIGNvbnRleHQpO1xuICBlbnZbY3hhcGkuQ09OVEVYVF9FTlZdID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG5cbiAgY29uc3QgYXBwID0gY29uZmlnLnNldHRpbmdzLmdldChbJ2FwcCddKTtcbiAgaWYgKCFhcHApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYC0tYXBwIGlzIHJlcXVpcmVkIGVpdGhlciBpbiBjb21tYW5kLWxpbmUsIGluICR7UFJPSkVDVF9DT05GSUd9IG9yIGluICR7VVNFUl9ERUZBVUxUU31gKTtcbiAgfVxuXG4gIC8vIGJ5cGFzcyBcInN5bnRoXCIgaWYgYXBwIHBvaW50cyB0byBhIGNsb3VkIGFzc2VtYmx5XG4gIGlmIChhd2FpdCBmcy5wYXRoRXhpc3RzKGFwcCkgJiYgKGF3YWl0IGZzLnN0YXQoYXBwKSkuaXNEaXJlY3RvcnkoKSkge1xuICAgIGRlYnVnKCctLWFwcCBwb2ludHMgdG8gYSBjbG91ZCBhc3NlbWJseSwgc28gd2UgYnlwYXNzIHN5bnRoJyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFzc2VtYmx5KGFwcCk7XG4gIH1cblxuICBjb25zdCBjb21tYW5kTGluZSA9IGF3YWl0IGd1ZXNzRXhlY3V0YWJsZShhcHBUb0FycmF5KGFwcCkpO1xuXG4gIGNvbnN0IG91dGRpciA9IGNvbmZpZy5zZXR0aW5ncy5nZXQoWydvdXRwdXQnXSk7XG4gIGlmICghb3V0ZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkOiAtLW91dHB1dCBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGF3YWl0IGZzLm1rZGlycChvdXRkaXIpO1xuXG4gIGRlYnVnKCdvdXRkaXI6Jywgb3V0ZGlyKTtcbiAgZW52W2N4YXBpLk9VVERJUl9FTlZdID0gb3V0ZGlyO1xuXG4gIC8vIFNlbmQgdmVyc2lvbiBpbmZvcm1hdGlvblxuICBlbnZbY3hhcGkuQ0xJX0FTTV9WRVJTSU9OX0VOVl0gPSBjeHNjaGVtYS5NYW5pZmVzdC52ZXJzaW9uKCk7XG4gIGVudltjeGFwaS5DTElfVkVSU0lPTl9FTlZdID0gdmVyc2lvbk51bWJlcigpO1xuXG4gIGRlYnVnKCdlbnY6JywgZW52KTtcblxuICBhd2FpdCBleGVjKCk7XG5cbiAgcmV0dXJuIGNyZWF0ZUFzc2VtYmx5KG91dGRpcik7XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXNzZW1ibHkoYXBwRGlyOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBjeGFwaS5DbG91ZEFzc2VtYmx5KGFwcERpcik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKGN4c2NoZW1hLlZFUlNJT05fTUlTTUFUQ0gpKSB7XG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhlIENMSSB2ZXJzaW9uIGlzIHRvbyBvbGQuXG4gICAgICAgIC8vIHdlIGluc3RydWN0IHRoZSB1c2VyIHRvIHVwZ3JhZGUuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhpcyBDREsgQ0xJIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIENESyBsaWJyYXJ5IHVzZWQgYnkgeW91ciBhcHBsaWNhdGlvbi4gUGxlYXNlIHVwZ3JhZGUgdGhlIENMSSB0byB0aGUgbGF0ZXN0IHZlcnNpb24uXFxuKCR7ZXJyb3IubWVzc2FnZX0pYCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBleGVjKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChvaywgZmFpbCkgPT4ge1xuICAgICAgLy8gV2UgdXNlIGEgc2xpZ2h0bHkgbG93ZXItbGV2ZWwgaW50ZXJmYWNlIHRvOlxuICAgICAgLy9cbiAgICAgIC8vIC0gUGFzcyBhcmd1bWVudHMgaW4gYW4gYXJyYXkgaW5zdGVhZCBvZiBhIHN0cmluZywgdG8gZ2V0IGFyb3VuZCBhXG4gICAgICAvLyAgIG51bWJlciBvZiBxdW90aW5nIGlzc3VlcyBpbnRyb2R1Y2VkIGJ5IHRoZSBpbnRlcm1lZGlhdGUgc2hlbGwgbGF5ZXJcbiAgICAgIC8vICAgKHdoaWNoIHdvdWxkIGJlIGRpZmZlcmVudCBiZXR3ZWVuIExpbnV4IGFuZCBXaW5kb3dzKS5cbiAgICAgIC8vXG4gICAgICAvLyAtIEluaGVyaXQgc3RkZXJyIGZyb20gY29udHJvbGxpbmcgdGVybWluYWwuIFdlIGRvbid0IHVzZSB0aGUgY2FwdHVyZWQgdmFsdWVcbiAgICAgIC8vICAgYW55d2F5LCBhbmQgaWYgdGhlIHN1YnByb2Nlc3MgaXMgcHJpbnRpbmcgdG8gaXQgZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyB0aGVcbiAgICAgIC8vICAgdXNlciBnZXRzIHRvIHNlZSBpdCBzb29uZXIuIFBsdXMsIGNhcHR1cmluZyBkb2Vzbid0IGludGVyYWN0IG5pY2VseSB3aXRoIHNvbWVcbiAgICAgIC8vICAgcHJvY2Vzc2VzIGxpa2UgTWF2ZW4uXG4gICAgICBjb25zdCBwcm9jID0gY2hpbGRQcm9jZXNzLnNwYXduKGNvbW1hbmRMaW5lWzBdLCBjb21tYW5kTGluZS5zbGljZSgxKSwge1xuICAgICAgICBzdGRpbzogWydpZ25vcmUnLCAnaW5oZXJpdCcsICdpbmhlcml0J10sXG4gICAgICAgIGRldGFjaGVkOiBmYWxzZSxcbiAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgIGVudjoge1xuICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgIC4uLmVudixcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBwcm9jLm9uKCdlcnJvcicsIGZhaWwpO1xuXG4gICAgICBwcm9jLm9uKCdleGl0JywgY29kZSA9PiB7XG4gICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIG9rKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhaWwobmV3IEVycm9yKGBTdWJwcm9jZXNzIGV4aXRlZCB3aXRoIGVycm9yICR7Y29kZX1gKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSWYgd2UgZG9uJ3QgaGF2ZSByZWdpb24vYWNjb3VudCBkZWZpbmVkIGluIGNvbnRleHQsIHdlIGZhbGwgYmFjayB0byB0aGUgZGVmYXVsdCBTREsgYmVoYXZpb3JcbiAqIHdoZXJlIHJlZ2lvbiBpcyByZXRyaWV2ZWQgZnJvbSB+Ly5hd3MvY29uZmlnIGFuZCBhY2NvdW50IGlzIGJhc2VkIG9uIGRlZmF1bHQgY3JlZGVudGlhbHMgcHJvdmlkZXJcbiAqIGNoYWluIGFuZCB0aGVuIFNUUyBpcyBxdWVyaWVkLlxuICpcbiAqIFRoaXMgaXMgZG9uZSBvcHBvcnR1bmlzdGljYWxseTogZm9yIGV4YW1wbGUsIGlmIHdlIGNhbid0IGFjY2VzcyBTVFMgZm9yIHNvbWUgcmVhc29uIG9yIHRoZSByZWdpb25cbiAqIGlzIG5vdCBjb25maWd1cmVkLCB0aGUgY29udGV4dCB2YWx1ZSB3aWxsIGJlICdudWxsJyBhbmQgdGhlcmUgY291bGQgZmFpbHVyZXMgZG93biB0aGUgbGluZS4gSW5cbiAqIHNvbWUgY2FzZXMsIHN5bnRoZXNpcyBkb2VzIG5vdCByZXF1aXJlIHJlZ2lvbi9hY2NvdW50IGluZm9ybWF0aW9uIGF0IGFsbCwgc28gdGhhdCBtaWdodCBiZSBwZXJmZWN0bHlcbiAqIGZpbmUgaW4gY2VydGFpbiBzY2VuYXJpb3MuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQga2V5L3ZhbHVlIGJhc2guXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlRGVmYXVsdEVudmlyb25tZW50SWZOZWVkZWQoYXdzOiBTZGtQcm92aWRlciwgZW52OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZH0pIHtcbiAgZW52W2N4YXBpLkRFRkFVTFRfUkVHSU9OX0VOVl0gPSBhd3MuZGVmYXVsdFJlZ2lvbjtcbiAgZGVidWcoYFNldHRpbmcgXCIke2N4YXBpLkRFRkFVTFRfUkVHSU9OX0VOVn1cIiBlbnZpcm9ubWVudCB2YXJpYWJsZSB0b2AsIGVudltjeGFwaS5ERUZBVUxUX1JFR0lPTl9FTlZdKTtcblxuICBjb25zdCBhY2NvdW50SWQgPSAoYXdhaXQgYXdzLmRlZmF1bHRBY2NvdW50KCkpPy5hY2NvdW50SWQ7XG4gIGlmIChhY2NvdW50SWQpIHtcbiAgICBlbnZbY3hhcGkuREVGQVVMVF9BQ0NPVU5UX0VOVl0gPSBhY2NvdW50SWQ7XG4gICAgZGVidWcoYFNldHRpbmcgXCIke2N4YXBpLkRFRkFVTFRfQUNDT1VOVF9FTlZ9XCIgZW52aXJvbm1lbnQgdmFyaWFibGUgdG9gLCBlbnZbY3hhcGkuREVGQVVMVF9BQ0NPVU5UX0VOVl0pO1xuICB9XG59XG5cbi8qKlxuICogTWFrZSBzdXJlIHRoZSAnYXBwJyBpcyBhbiBhcnJheVxuICpcbiAqIElmIGl0J3MgYSBzdHJpbmcsIHNwbGl0IG9uIHNwYWNlcyBhcyBhIHRyaXZpYWwgd2F5IG9mIHRva2VuaXppbmcgdGhlIGNvbW1hbmQgbGluZS5cbiAqL1xuZnVuY3Rpb24gYXBwVG9BcnJheShhcHA6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGFwcCA9PT0gJ3N0cmluZycgPyBhcHAuc3BsaXQoJyAnKSA6IGFwcDtcbn1cblxudHlwZSBDb21tYW5kR2VuZXJhdG9yID0gKGZpbGU6IHN0cmluZykgPT4gc3RyaW5nW107XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgZ2l2ZW4gZmlsZSB3aXRoIHRoZSBzYW1lICdub2RlJyBwcm9jZXNzIGFzIGlzIHJ1bm5pbmcgdGhlIGN1cnJlbnQgcHJvY2Vzc1xuICovXG5mdW5jdGlvbiBleGVjdXRlTm9kZShzY3JpcHRGaWxlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBbcHJvY2Vzcy5leGVjUGF0aCwgc2NyaXB0RmlsZV07XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBleHRlbnNpb25zIHRvIGNvbW1hbmQtbGluZSBnZW5lcmF0b3JzXG4gKi9cbmNvbnN0IEVYVEVOU0lPTl9NQVAgPSBuZXcgTWFwPHN0cmluZywgQ29tbWFuZEdlbmVyYXRvcj4oW1xuICBbJy5qcycsIGV4ZWN1dGVOb2RlXSxcbl0pO1xuXG4vKipcbiAqIEd1ZXNzIHRoZSBleGVjdXRhYmxlIGZyb20gdGhlIGNvbW1hbmQtbGluZSBhcmd1bWVudFxuICpcbiAqIE9ubHkgZG8gdGhpcyBpZiB0aGUgZmlsZSBpcyBOT1QgbWFya2VkIGFzIGV4ZWN1dGFibGUuIElmIGl0IGlzLFxuICogd2UnbGwgZGVmZXIgdG8gdGhlIHNoZWJhbmcgaW5zaWRlIHRoZSBmaWxlIGl0c2VsZi5cbiAqXG4gKiBJZiB3ZSdyZSBvbiBXaW5kb3dzLCB3ZSBBTFdBWVMgdGFrZSB0aGUgaGFuZGxlciwgc2luY2UgaXQncyBoYXJkIHRvXG4gKiB2ZXJpZnkgaWYgcmVnaXN0cnkgYXNzb2NpYXRpb25zIGhhdmUgb3IgaGF2ZSBub3QgYmVlbiBzZXQgdXAgZm9yIHRoaXNcbiAqIGZpbGUgdHlwZSwgc28gd2UnbGwgYXNzdW1lIHRoZSB3b3JzdCBhbmQgdGFrZSBjb250cm9sLlxuICovXG5hc3luYyBmdW5jdGlvbiBndWVzc0V4ZWN1dGFibGUoY29tbWFuZExpbmU6IHN0cmluZ1tdKSB7XG4gIGlmIChjb21tYW5kTGluZS5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgZnN0YXQ7XG5cbiAgICB0cnkge1xuICAgICAgZnN0YXQgPSBhd2FpdCBmcy5zdGF0KGNvbW1hbmRMaW5lWzBdKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZGVidWcoYE5vdCBhIGZpbGU6ICcke2NvbW1hbmRMaW5lWzBdfScuIFVzaW5nICcke2NvbW1hbmRMaW5lfScgYXMgY29tbWFuZC1saW5lYCk7XG4gICAgICByZXR1cm4gY29tbWFuZExpbmU7XG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2VcbiAgICBjb25zdCBpc0V4ZWN1dGFibGUgPSAoZnN0YXQubW9kZSAmIGZzLmNvbnN0YW50cy5YX09LKSAhPT0gMDtcbiAgICBjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IEVYVEVOU0lPTl9NQVAuZ2V0KHBhdGguZXh0bmFtZShjb21tYW5kTGluZVswXSkpO1xuICAgIGlmIChoYW5kbGVyICYmICghaXNFeGVjdXRhYmxlIHx8IGlzV2luZG93cykpIHtcbiAgICAgIHJldHVybiBoYW5kbGVyKGNvbW1hbmRMaW5lWzBdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbW1hbmRMaW5lO1xufVxuIl19