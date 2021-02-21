"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomString = exports.rimraf = exports.shell = exports.TestFixture = exports.cloneDirectory = exports.withDefaultFixture = exports.withMonolithicCfnIncludeCdkApp = exports.withCdkApp = exports.withAws = void 0;
const child_process = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const aws_1 = require("./aws");
const resource_pool_1 = require("./resource-pool");
const REGIONS = process.env.AWS_REGIONS
    ? process.env.AWS_REGIONS.split(',')
    : [(_b = (_a = process.env.AWS_REGION) !== null && _a !== void 0 ? _a : process.env.AWS_DEFAULT_REGION) !== null && _b !== void 0 ? _b : 'us-east-1'];
const FRAMEWORK_VERSION = process.env.FRAMEWORK_VERSION;
process.stdout.write(`Using regions: ${REGIONS}\n`);
process.stdout.write(`Using framework version: ${FRAMEWORK_VERSION}\n`);
const REGION_POOL = new resource_pool_1.ResourcePool(REGIONS);
/**
 * Higher order function to execute a block with an AWS client setup
 *
 * Allocate the next region from the REGION pool and dispose it afterwards.
 */
function withAws(block) {
    return (context) => REGION_POOL.using(async (region) => {
        const aws = await aws_1.AwsClients.forRegion(region, context.output);
        await sanityCheck(aws);
        return block({ ...context, aws });
    });
}
exports.withAws = withAws;
/**
 * Higher order function to execute a block with a CDK app fixture
 *
 * Requires an AWS client to be passed in.
 *
 * For backwards compatibility with existing tests (so we don't have to change
 * too much) the inner block is expected to take a `TestFixture` object.
 */
function withCdkApp(block) {
    return async (context) => {
        const randy = randomString();
        const stackNamePrefix = `cdktest-${randy}`;
        const integTestDir = path.join(os.tmpdir(), `cdk-integ-${randy}`);
        context.output.write(` Stack prefix:   ${stackNamePrefix}\n`);
        context.output.write(` Test directory: ${integTestDir}\n`);
        context.output.write(` Region:         ${context.aws.region}\n`);
        await cloneDirectory(path.join(__dirname, '..', 'cli', 'app'), integTestDir, context.output);
        const fixture = new TestFixture(integTestDir, stackNamePrefix, context.output, context.aws);
        let success = true;
        try {
            let modules = [
                '@aws-cdk/core',
                '@aws-cdk/aws-sns',
                '@aws-cdk/aws-iam',
                '@aws-cdk/aws-lambda',
                '@aws-cdk/aws-ssm',
                '@aws-cdk/aws-ecr-assets',
                '@aws-cdk/aws-cloudformation',
                '@aws-cdk/aws-ec2',
            ];
            if (FRAMEWORK_VERSION) {
                modules = modules.map(module => `${module}@${FRAMEWORK_VERSION}`);
            }
            await fixture.shell(['npm', 'install', ...modules]);
            await ensureBootstrapped(fixture);
            await block(fixture);
        }
        catch (e) {
            success = false;
            throw e;
        }
        finally {
            if (process.env.INTEG_NO_CLEAN) {
                process.stderr.write(`Left test directory in '${integTestDir}' ($INTEG_NO_CLEAN)\n`);
            }
            else {
                await fixture.dispose(success);
            }
        }
    };
}
exports.withCdkApp = withCdkApp;
function withMonolithicCfnIncludeCdkApp(block) {
    return async (context) => {
        const uberPackage = process.env.UBERPACKAGE;
        if (!uberPackage) {
            throw new Error('The UBERPACKAGE environment variable is required for running this test!');
        }
        const randy = randomString();
        const stackNamePrefix = `cdk-uber-cfn-include-${randy}`;
        const integTestDir = path.join(os.tmpdir(), `cdk-uber-cfn-include-${randy}`);
        context.output.write(` Stack prefix:   ${stackNamePrefix}\n`);
        context.output.write(` Test directory: ${integTestDir}\n`);
        const awsClients = await aws_1.AwsClients.default(context.output);
        await cloneDirectory(path.join(__dirname, '..', 'uberpackage', 'cfn-include-app'), integTestDir, context.output);
        const fixture = new TestFixture(integTestDir, stackNamePrefix, context.output, awsClients);
        let success = true;
        try {
            let module = uberPackage;
            if (FRAMEWORK_VERSION) {
                module = `${module}@${FRAMEWORK_VERSION}`;
            }
            await fixture.shell(['npm', 'install', 'constructs', module]);
            await block(fixture);
        }
        catch (e) {
            success = false;
            throw e;
        }
        finally {
            if (process.env.INTEG_NO_CLEAN) {
                process.stderr.write(`Left test directory in '${integTestDir}' ($INTEG_NO_CLEAN)\n`);
            }
            else {
                await fixture.dispose(success);
            }
        }
    };
}
exports.withMonolithicCfnIncludeCdkApp = withMonolithicCfnIncludeCdkApp;
/**
 * Default test fixture for most (all?) integ tests
 *
 * It's a composition of withAws/withCdkApp, expecting the test block to take a `TestFixture`
 * object.
 *
 * We could have put `withAws(withCdkApp(fixture => { /... actual test here.../ }))` in every
 * test declaration but centralizing it is going to make it convenient to modify in the future.
 */
function withDefaultFixture(block) {
    return withAws(withCdkApp(block));
    //              ^~~~~~ this is disappointing TypeScript! Feels like you should have been able to derive this.
}
exports.withDefaultFixture = withDefaultFixture;
/**
 * Prepare a target dir byreplicating a source directory
 */
async function cloneDirectory(source, target, output) {
    await shell(['rm', '-rf', target], { output });
    await shell(['mkdir', '-p', target], { output });
    await shell(['cp', '-R', source + '/*', target], { output });
}
exports.cloneDirectory = cloneDirectory;
class TestFixture {
    constructor(integTestDir, stackNamePrefix, output, aws) {
        this.integTestDir = integTestDir;
        this.stackNamePrefix = stackNamePrefix;
        this.output = output;
        this.aws = aws;
        this.qualifier = randomString().substr(0, 10);
        this.bucketsToDelete = new Array();
    }
    log(s) {
        this.output.write(`${s}\n`);
    }
    async shell(command, options = {}) {
        return shell(command, {
            output: this.output,
            cwd: this.integTestDir,
            ...options,
        });
    }
    async cdkDeploy(stackNames, options = {}) {
        var _a, _b;
        stackNames = typeof stackNames === 'string' ? [stackNames] : stackNames;
        const neverRequireApproval = (_a = options.neverRequireApproval) !== null && _a !== void 0 ? _a : true;
        return this.cdk(['deploy',
            ...(neverRequireApproval ? ['--require-approval=never'] : []), // Default to no approval in an unattended test
            ...((_b = options.options) !== null && _b !== void 0 ? _b : []), ...this.fullStackName(stackNames)], options);
    }
    async cdkSynth(options = {}) {
        var _a;
        return this.cdk([
            'synth',
            ...((_a = options.options) !== null && _a !== void 0 ? _a : []),
        ], options);
    }
    async cdkDestroy(stackNames, options = {}) {
        var _a;
        stackNames = typeof stackNames === 'string' ? [stackNames] : stackNames;
        return this.cdk(['destroy',
            '-f', // We never want a prompt in an unattended test
            ...((_a = options.options) !== null && _a !== void 0 ? _a : []), ...this.fullStackName(stackNames)], options);
    }
    async cdk(args, options = {}) {
        var _a;
        const verbose = (_a = options.verbose) !== null && _a !== void 0 ? _a : true;
        return this.shell(['cdk', ...(verbose ? ['-v'] : []), ...args], {
            ...options,
            modEnv: {
                AWS_REGION: this.aws.region,
                AWS_DEFAULT_REGION: this.aws.region,
                STACK_NAME_PREFIX: this.stackNamePrefix,
                ...options.modEnv,
            },
        });
    }
    fullStackName(stackNames) {
        if (typeof stackNames === 'string') {
            return `${this.stackNamePrefix}-${stackNames}`;
        }
        else {
            return stackNames.map(s => `${this.stackNamePrefix}-${s}`);
        }
    }
    /**
     * Append this to the list of buckets to potentially delete
     *
     * At the end of a test, we clean up buckets that may not have gotten destroyed
     * (for whatever reason).
     */
    rememberToDeleteBucket(bucketName) {
        this.bucketsToDelete.push(bucketName);
    }
    /**
     * Cleanup leftover stacks and buckets
     */
    async dispose(success) {
        const stacksToDelete = await this.deleteableStacks(this.stackNamePrefix);
        // Bootstrap stacks have buckets that need to be cleaned
        const bucketNames = stacksToDelete.map(stack => aws_1.outputFromStack('BucketName', stack)).filter(defined);
        await Promise.all(bucketNames.map(b => this.aws.emptyBucket(b)));
        // The bootstrap bucket has a removal policy of RETAIN by default, so add it to the buckets to be cleaned up.
        this.bucketsToDelete.push(...bucketNames);
        // Bootstrap stacks have ECR repositories with images which should be deleted
        const imageRepositoryNames = stacksToDelete.map(stack => aws_1.outputFromStack('ImageRepositoryName', stack)).filter(defined);
        await Promise.all(imageRepositoryNames.map(r => this.aws.deleteImageRepository(r)));
        await this.aws.deleteStacks(...stacksToDelete.map(s => s.StackName));
        // We might have leaked some buckets by upgrading the bootstrap stack. Be
        // sure to clean everything.
        for (const bucket of this.bucketsToDelete) {
            await this.aws.deleteBucket(bucket);
        }
        // If the tests completed successfully, happily delete the fixture
        // (otherwise leave it for humans to inspect)
        if (success) {
            rimraf(this.integTestDir);
        }
    }
    /**
     * Return the stacks starting with our testing prefix that should be deleted
     */
    async deleteableStacks(prefix) {
        var _a;
        const statusFilter = [
            'CREATE_IN_PROGRESS', 'CREATE_FAILED', 'CREATE_COMPLETE',
            'ROLLBACK_IN_PROGRESS', 'ROLLBACK_FAILED', 'ROLLBACK_COMPLETE',
            'DELETE_FAILED',
            'UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
            'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_IN_PROGRESS',
            'UPDATE_ROLLBACK_FAILED',
            'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
            'UPDATE_ROLLBACK_COMPLETE', 'REVIEW_IN_PROGRESS',
            'IMPORT_IN_PROGRESS', 'IMPORT_COMPLETE',
            'IMPORT_ROLLBACK_IN_PROGRESS', 'IMPORT_ROLLBACK_FAILED',
            'IMPORT_ROLLBACK_COMPLETE',
        ];
        const response = await this.aws.cloudFormation('describeStacks', {});
        return ((_a = response.Stacks) !== null && _a !== void 0 ? _a : [])
            .filter(s => s.StackName.startsWith(prefix))
            .filter(s => statusFilter.includes(s.StackStatus))
            .filter(s => s.RootId === undefined); // Only delete parent stacks. Nested stacks are deleted in the process
    }
}
exports.TestFixture = TestFixture;
/**
 * Perform a one-time quick sanity check that the AWS clients has properly configured credentials
 *
 * If we don't do this, calls are going to fail and they'll be retried and everything will take
 * forever before the user notices a simple misconfiguration.
 *
 * We can't check for the presence of environment variables since credentials could come from
 * anywhere, so do simple account retrieval.
 *
 * Only do it once per process.
 */
async function sanityCheck(aws) {
    if (sanityChecked === undefined) {
        try {
            await aws.account();
            sanityChecked = true;
        }
        catch (e) {
            sanityChecked = false;
            throw new Error(`AWS credentials probably not configured, got error: ${e.message}`);
        }
    }
    if (!sanityChecked) {
        throw new Error('AWS credentials probably not configured, see previous error');
    }
}
let sanityChecked;
/**
 * Make sure that the given environment is bootstrapped
 *
 * Since we go striping across regions, it's going to suck doing this
 * by hand so let's just mass-automate it.
 */
async function ensureBootstrapped(fixture) {
    // Old-style bootstrap stack with default name
    if (await fixture.aws.stackStatus('CDKToolkit') === undefined) {
        await fixture.cdk(['bootstrap', `aws://${await fixture.aws.account()}/${fixture.aws.region}`]);
    }
}
/**
 * A shell command that does what you want
 *
 * Is platform-aware, handles errors nicely.
 */
async function shell(command, options = {}) {
    var _a, _b;
    if (options.modEnv && options.env) {
        throw new Error('Use either env or modEnv but not both');
    }
    (_a = options.output) === null || _a === void 0 ? void 0 : _a.write(`💻 ${command.join(' ')}\n`);
    const env = (_b = options.env) !== null && _b !== void 0 ? _b : (options.modEnv ? { ...process.env, ...options.modEnv } : undefined);
    const child = child_process.spawn(command[0], command.slice(1), {
        ...options,
        env,
        // Need this for Windows where we want .cmd and .bat to be found as well.
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    return new Promise((resolve, reject) => {
        const stdout = new Array();
        const stderr = new Array();
        child.stdout.on('data', chunk => {
            var _a;
            (_a = options.output) === null || _a === void 0 ? void 0 : _a.write(chunk);
            stdout.push(chunk);
        });
        child.stderr.on('data', chunk => {
            var _a, _b;
            (_a = options.output) === null || _a === void 0 ? void 0 : _a.write(chunk);
            if ((_b = options.captureStderr) !== null && _b !== void 0 ? _b : true) {
                stderr.push(chunk);
            }
        });
        child.once('error', reject);
        child.once('close', code => {
            const output = (Buffer.concat(stdout).toString('utf-8') + Buffer.concat(stderr).toString('utf-8')).trim();
            if (code === 0 || options.allowErrExit) {
                resolve(output);
            }
            else {
                reject(new Error(`'${command.join(' ')}' exited with error code ${code}. Output: \n${output}`));
            }
        });
    });
}
exports.shell = shell;
function defined(x) {
    return x !== undefined;
}
/**
 * rm -rf reimplementation, don't want to depend on an NPM package for this
 */
function rimraf(fsPath) {
    try {
        const isDir = fs.lstatSync(fsPath).isDirectory();
        if (isDir) {
            for (const file of fs.readdirSync(fsPath)) {
                rimraf(path.join(fsPath, file));
            }
            fs.rmdirSync(fsPath);
        }
        else {
            fs.unlinkSync(fsPath);
        }
    }
    catch (e) {
        // We will survive ENOENT
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
}
exports.rimraf = rimraf;
function randomString() {
    // Crazy
    return Math.random().toString(36).replace(/[^a-z0-9]+/g, '');
}
exports.randomString = randomString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSwrQ0FBK0M7QUFDL0MseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsK0JBQW9EO0FBQ3BELG1EQUErQztBQUcvQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7SUFDckMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDcEMsQ0FBQyxDQUFDLGFBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLG1DQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLG1DQUFJLFdBQVcsQ0FBQyxDQUFDO0FBRTlFLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztBQUV4RCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsT0FBTyxJQUFJLENBQUMsQ0FBQztBQUNwRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsaUJBQWlCLElBQUksQ0FBQyxDQUFDO0FBRXhFLE1BQU0sV0FBVyxHQUFHLElBQUksNEJBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUs5Qzs7OztHQUlHO0FBQ0gsU0FBZ0IsT0FBTyxDQUF3QixLQUFpRDtJQUM5RixPQUFPLENBQUMsT0FBVSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN4RCxNQUFNLEdBQUcsR0FBRyxNQUFNLGdCQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkIsT0FBTyxLQUFLLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxH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QUNGLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFakQsSUFBSSxLQUFLLEVBQUU7WUFDVCxLQUFLLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN0QjthQUFNO1lBQ0wsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QjtLQUNGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVix5QkFBeUI7UUFDekIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQUU7S0FDdEM7QUFDSCxDQUFDO0FBaEJELHdCQWdCQztBQUVELFNBQWdCLFlBQVk7SUFDMUIsUUFBUTtJQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFIRCxvQ0FHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgb3V0cHV0RnJvbVN0YWNrLCBBd3NDbGllbnRzIH0gZnJvbSAnLi9hd3MnO1xuaW1wb3J0IHsgUmVzb3VyY2VQb29sIH0gZnJvbSAnLi9yZXNvdXJjZS1wb29sJztcbmltcG9ydCB7IFRlc3RDb250ZXh0IH0gZnJvbSAnLi90ZXN0LWhlbHBlcnMnO1xuXG5jb25zdCBSRUdJT05TID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTlNcbiAgPyBwcm9jZXNzLmVudi5BV1NfUkVHSU9OUy5zcGxpdCgnLCcpXG4gIDogW3Byb2Nlc3MuZW52LkFXU19SRUdJT04gPz8gcHJvY2Vzcy5lbnYuQVdTX0RFRkFVTFRfUkVHSU9OID8/ICd1cy1lYXN0LTEnXTtcblxuY29uc3QgRlJBTUVXT1JLX1ZFUlNJT04gPSBwcm9jZXNzLmVudi5GUkFNRVdPUktfVkVSU0lPTjtcblxucHJvY2Vzcy5zdGRvdXQud3JpdGUoYFVzaW5nIHJlZ2lvbnM6ICR7UkVHSU9OU31cXG5gKTtcbnByb2Nlc3Muc3Rkb3V0LndyaXRlKGBVc2luZyBmcmFtZXdvcmsgdmVyc2lvbjogJHtGUkFNRVdPUktfVkVSU0lPTn1cXG5gKTtcblxuY29uc3QgUkVHSU9OX1BPT0wgPSBuZXcgUmVzb3VyY2VQb29sKFJFR0lPTlMpO1xuXG5cbmV4cG9ydCB0eXBlIEF3c0NvbnRleHQgPSB7IHJlYWRvbmx5IGF3czogQXdzQ2xpZW50cyB9O1xuXG4vKipcbiAqIEhpZ2hlciBvcmRlciBmdW5jdGlvbiB0byBleGVjdXRlIGEgYmxvY2sgd2l0aCBhbiBBV1MgY2xpZW50IHNldHVwXG4gKlxuICogQWxsb2NhdGUgdGhlIG5leHQgcmVnaW9uIGZyb20gdGhlIFJFR0lPTiBwb29sIGFuZCBkaXNwb3NlIGl0IGFmdGVyd2FyZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQXdzPEEgZXh0ZW5kcyBUZXN0Q29udGV4dD4oYmxvY2s6IChjb250ZXh0OiBBICYgQXdzQ29udGV4dCkgPT4gUHJvbWlzZTx2b2lkPikge1xuICByZXR1cm4gKGNvbnRleHQ6IEEpID0+IFJFR0lPTl9QT09MLnVzaW5nKGFzeW5jIChyZWdpb24pID0+IHtcbiAgICBjb25zdCBhd3MgPSBhd2FpdCBBd3NDbGllbnRzLmZvclJlZ2lvbihyZWdpb24sIGNvbnRleHQub3V0cHV0KTtcbiAgICBhd2FpdCBzYW5pdHlDaGVjayhhd3MpO1xuXG4gICAgcmV0dXJuIGJsb2NrKHsgLi4uY29udGV4dCwgYXdzIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBIaWdoZXIgb3JkZXIgZnVuY3Rpb24gdG8gZXhlY3V0ZSBhIGJsb2NrIHdpdGggYSBDREsgYXBwIGZpeHR1cmVcbiAqXG4gKiBSZXF1aXJlcyBhbiBBV1MgY2xpZW50IHRvIGJlIHBhc3NlZCBpbi5cbiAqXG4gKiBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCBleGlzdGluZyB0ZXN0cyAoc28gd2UgZG9uJ3QgaGF2ZSB0byBjaGFuZ2VcbiAqIHRvbyBtdWNoKSB0aGUgaW5uZXIgYmxvY2sgaXMgZXhwZWN0ZWQgdG8gdGFrZSBhIGBUZXN0Rml4dHVyZWAgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aENka0FwcDxBIGV4dGVuZHMgVGVzdENvbnRleHQgJiBBd3NDb250ZXh0PihibG9jazogKGNvbnRleHQ6IFRlc3RGaXh0dXJlKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG4gIHJldHVybiBhc3luYyAoY29udGV4dDogQSkgPT4ge1xuICAgIGNvbnN0IHJhbmR5ID0gcmFuZG9tU3RyaW5nKCk7XG4gICAgY29uc3Qgc3RhY2tOYW1lUHJlZml4ID0gYGNka3Rlc3QtJHtyYW5keX1gO1xuICAgIGNvbnN0IGludGVnVGVzdERpciA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgYGNkay1pbnRlZy0ke3JhbmR5fWApO1xuXG4gICAgY29udGV4dC5vdXRwdXQud3JpdGUoYCBTdGFjayBwcmVmaXg6ICAgJHtzdGFja05hbWVQcmVmaXh9XFxuYCk7XG4gICAgY29udGV4dC5vdXRwdXQud3JpdGUoYCBUZXN0IGRpcmVjdG9yeTogJHtpbnRlZ1Rlc3REaXJ9XFxuYCk7XG4gICAgY29udGV4dC5vdXRwdXQud3JpdGUoYCBSZWdpb246ICAgICAgICAgJHtjb250ZXh0LmF3cy5yZWdpb259XFxuYCk7XG5cbiAgICBhd2FpdCBjbG9uZURpcmVjdG9yeShwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnY2xpJywgJ2FwcCcpLCBpbnRlZ1Rlc3REaXIsIGNvbnRleHQub3V0cHV0KTtcbiAgICBjb25zdCBmaXh0dXJlID0gbmV3IFRlc3RGaXh0dXJlKFxuICAgICAgaW50ZWdUZXN0RGlyLFxuICAgICAgc3RhY2tOYW1lUHJlZml4LFxuICAgICAgY29udGV4dC5vdXRwdXQsXG4gICAgICBjb250ZXh0LmF3cyk7XG5cbiAgICBsZXQgc3VjY2VzcyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBtb2R1bGVzID0gW1xuICAgICAgICAnQGF3cy1jZGsvY29yZScsXG4gICAgICAgICdAYXdzLWNkay9hd3Mtc25zJyxcbiAgICAgICAgJ0Bhd3MtY2RrL2F3cy1pYW0nLFxuICAgICAgICAnQGF3cy1jZGsvYXdzLWxhbWJkYScsXG4gICAgICAgICdAYXdzLWNkay9hd3Mtc3NtJyxcbiAgICAgICAgJ0Bhd3MtY2RrL2F3cy1lY3ItYXNzZXRzJyxcbiAgICAgICAgJ0Bhd3MtY2RrL2F3cy1jbG91ZGZvcm1hdGlvbicsXG4gICAgICAgICdAYXdzLWNkay9hd3MtZWMyJyxcbiAgICAgIF07XG4gICAgICBpZiAoRlJBTUVXT1JLX1ZFUlNJT04pIHtcbiAgICAgICAgbW9kdWxlcyA9IG1vZHVsZXMubWFwKG1vZHVsZSA9PiBgJHttb2R1bGV9QCR7RlJBTUVXT1JLX1ZFUlNJT059YCk7XG4gICAgICB9XG4gICAgICBhd2FpdCBmaXh0dXJlLnNoZWxsKFsnbnBtJywgJ2luc3RhbGwnLCAuLi5tb2R1bGVzXSk7XG5cbiAgICAgIGF3YWl0IGVuc3VyZUJvb3RzdHJhcHBlZChmaXh0dXJlKTtcblxuICAgICAgYXdhaXQgYmxvY2soZml4dHVyZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52LklOVEVHX05PX0NMRUFOKSB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKGBMZWZ0IHRlc3QgZGlyZWN0b3J5IGluICcke2ludGVnVGVzdERpcn0nICgkSU5URUdfTk9fQ0xFQU4pXFxuYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBmaXh0dXJlLmRpc3Bvc2Uoc3VjY2Vzcyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1vbm9saXRoaWNDZm5JbmNsdWRlQ2RrQXBwPEEgZXh0ZW5kcyBUZXN0Q29udGV4dD4oYmxvY2s6IChjb250ZXh0OiBUZXN0Rml4dHVyZSkgPT4gUHJvbWlzZTx2b2lkPikge1xuICByZXR1cm4gYXN5bmMgKGNvbnRleHQ6IEEpID0+IHtcbiAgICBjb25zdCB1YmVyUGFja2FnZSA9IHByb2Nlc3MuZW52LlVCRVJQQUNLQUdFO1xuICAgIGlmICghdWJlclBhY2thZ2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIFVCRVJQQUNLQUdFIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHJlcXVpcmVkIGZvciBydW5uaW5nIHRoaXMgdGVzdCEnKTtcbiAgICB9XG5cbiAgICBjb25zdCByYW5keSA9IHJhbmRvbVN0cmluZygpO1xuICAgIGNvbnN0IHN0YWNrTmFtZVByZWZpeCA9IGBjZGstdWJlci1jZm4taW5jbHVkZS0ke3JhbmR5fWA7XG4gICAgY29uc3QgaW50ZWdUZXN0RGlyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBgY2RrLXViZXItY2ZuLWluY2x1ZGUtJHtyYW5keX1gKTtcblxuICAgIGNvbnRleHQub3V0cHV0LndyaXRlKGAgU3RhY2sgcHJlZml4OiAgICR7c3RhY2tOYW1lUHJlZml4fVxcbmApO1xuICAgIGNvbnRleHQub3V0cHV0LndyaXRlKGAgVGVzdCBkaXJlY3Rvcnk6ICR7aW50ZWdUZXN0RGlyfVxcbmApO1xuXG4gICAgY29uc3QgYXdzQ2xpZW50cyA9IGF3YWl0IEF3c0NsaWVudHMuZGVmYXVsdChjb250ZXh0Lm91dHB1dCk7XG4gICAgYXdhaXQgY2xvbmVEaXJlY3RvcnkocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ3ViZXJwYWNrYWdlJywgJ2Nmbi1pbmNsdWRlLWFwcCcpLCBpbnRlZ1Rlc3REaXIsIGNvbnRleHQub3V0cHV0KTtcbiAgICBjb25zdCBmaXh0dXJlID0gbmV3IFRlc3RGaXh0dXJlKFxuICAgICAgaW50ZWdUZXN0RGlyLFxuICAgICAgc3RhY2tOYW1lUHJlZml4LFxuICAgICAgY29udGV4dC5vdXRwdXQsXG4gICAgICBhd3NDbGllbnRzLFxuICAgICk7XG5cbiAgICBsZXQgc3VjY2VzcyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBtb2R1bGUgPSB1YmVyUGFja2FnZTtcbiAgICAgIGlmIChGUkFNRVdPUktfVkVSU0lPTikge1xuICAgICAgICBtb2R1bGUgPSBgJHttb2R1bGV9QCR7RlJBTUVXT1JLX1ZFUlNJT059YDtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGZpeHR1cmUuc2hlbGwoWyducG0nLCAnaW5zdGFsbCcsICdjb25zdHJ1Y3RzJywgbW9kdWxlXSk7XG5cbiAgICAgIGF3YWl0IGJsb2NrKGZpeHR1cmUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5JTlRFR19OT19DTEVBTikge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShgTGVmdCB0ZXN0IGRpcmVjdG9yeSBpbiAnJHtpbnRlZ1Rlc3REaXJ9JyAoJElOVEVHX05PX0NMRUFOKVxcbmApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZml4dHVyZS5kaXNwb3NlKHN1Y2Nlc3MpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRlc3QgZml4dHVyZSBmb3IgbW9zdCAoYWxsPykgaW50ZWcgdGVzdHNcbiAqXG4gKiBJdCdzIGEgY29tcG9zaXRpb24gb2Ygd2l0aEF3cy93aXRoQ2RrQXBwLCBleHBlY3RpbmcgdGhlIHRlc3QgYmxvY2sgdG8gdGFrZSBhIGBUZXN0Rml4dHVyZWBcbiAqIG9iamVjdC5cbiAqXG4gKiBXZSBjb3VsZCBoYXZlIHB1dCBgd2l0aEF3cyh3aXRoQ2RrQXBwKGZpeHR1cmUgPT4geyAvLi4uIGFjdHVhbCB0ZXN0IGhlcmUuLi4vIH0pKWAgaW4gZXZlcnlcbiAqIHRlc3QgZGVjbGFyYXRpb24gYnV0IGNlbnRyYWxpemluZyBpdCBpcyBnb2luZyB0byBtYWtlIGl0IGNvbnZlbmllbnQgdG8gbW9kaWZ5IGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRGVmYXVsdEZpeHR1cmUoYmxvY2s6IChjb250ZXh0OiBUZXN0Rml4dHVyZSkgPT4gUHJvbWlzZTx2b2lkPikge1xuICByZXR1cm4gd2l0aEF3czxUZXN0Q29udGV4dD4od2l0aENka0FwcChibG9jaykpO1xuICAvLyAgICAgICAgICAgICAgXn5+fn5+IHRoaXMgaXMgZGlzYXBwb2ludGluZyBUeXBlU2NyaXB0ISBGZWVscyBsaWtlIHlvdSBzaG91bGQgaGF2ZSBiZWVuIGFibGUgdG8gZGVyaXZlIHRoaXMuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hlbGxPcHRpb25zIGV4dGVuZHMgY2hpbGRfcHJvY2Vzcy5TcGF3bk9wdGlvbnMge1xuICAvKipcbiAgICogUHJvcGVydGllcyB0byBhZGQgdG8gJ2VudidcbiAgICovXG4gIG1vZEVudj86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgLyoqXG4gICAqIERvbid0IGZhaWwgd2hlbiBleGl0aW5nIHdpdGggYW4gZXJyb3JcbiAgICpcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFsbG93RXJyRXhpdD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY2FwdHVyZSBzdGRlcnJcbiAgICpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2FwdHVyZVN0ZGVycj86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFBhc3Mgb3V0cHV0IGhlcmVcbiAgICovXG4gIG91dHB1dD86IE5vZGVKUy5Xcml0YWJsZVN0cmVhbTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDZGtDbGlPcHRpb25zIGV4dGVuZHMgU2hlbGxPcHRpb25zIHtcbiAgb3B0aW9ucz86IHN0cmluZ1tdO1xuICBuZXZlclJlcXVpcmVBcHByb3ZhbD86IGJvb2xlYW47XG4gIHZlcmJvc2U/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFByZXBhcmUgYSB0YXJnZXQgZGlyIGJ5cmVwbGljYXRpbmcgYSBzb3VyY2UgZGlyZWN0b3J5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9uZURpcmVjdG9yeShzb3VyY2U6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcsIG91dHB1dD86IE5vZGVKUy5Xcml0YWJsZVN0cmVhbSkge1xuICBhd2FpdCBzaGVsbChbJ3JtJywgJy1yZicsIHRhcmdldF0sIHsgb3V0cHV0IH0pO1xuICBhd2FpdCBzaGVsbChbJ21rZGlyJywgJy1wJywgdGFyZ2V0XSwgeyBvdXRwdXQgfSk7XG4gIGF3YWl0IHNoZWxsKFsnY3AnLCAnLVInLCBzb3VyY2UgKyAnLyonLCB0YXJnZXRdLCB7IG91dHB1dCB9KTtcbn1cblxuZXhwb3J0IGNsYXNzIFRlc3RGaXh0dXJlIHtcbiAgcHVibGljIHJlYWRvbmx5IHF1YWxpZmllciA9IHJhbmRvbVN0cmluZygpLnN1YnN0cigwLCAxMCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgYnVja2V0c1RvRGVsZXRlID0gbmV3IEFycmF5PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgaW50ZWdUZXN0RGlyOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHN0YWNrTmFtZVByZWZpeDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBvdXRwdXQ6IE5vZGVKUy5Xcml0YWJsZVN0cmVhbSxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXdzOiBBd3NDbGllbnRzKSB7XG4gIH1cblxuICBwdWJsaWMgbG9nKHM6IHN0cmluZykge1xuICAgIHRoaXMub3V0cHV0LndyaXRlKGAke3N9XFxuYCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2hlbGwoY29tbWFuZDogc3RyaW5nW10sIG9wdGlvbnM6IE9taXQ8U2hlbGxPcHRpb25zLCAnY3dkJ3wnb3V0cHV0Jz4gPSB7fSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHNoZWxsKGNvbW1hbmQsIHtcbiAgICAgIG91dHB1dDogdGhpcy5vdXRwdXQsXG4gICAgICBjd2Q6IHRoaXMuaW50ZWdUZXN0RGlyLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjZGtEZXBsb3koc3RhY2tOYW1lczogc3RyaW5nIHwgc3RyaW5nW10sIG9wdGlvbnM6IENka0NsaU9wdGlvbnMgPSB7fSkge1xuICAgIHN0YWNrTmFtZXMgPSB0eXBlb2Ygc3RhY2tOYW1lcyA9PT0gJ3N0cmluZycgPyBbc3RhY2tOYW1lc10gOiBzdGFja05hbWVzO1xuXG4gICAgY29uc3QgbmV2ZXJSZXF1aXJlQXBwcm92YWwgPSBvcHRpb25zLm5ldmVyUmVxdWlyZUFwcHJvdmFsID8/IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcy5jZGsoWydkZXBsb3knLFxuICAgICAgLi4uKG5ldmVyUmVxdWlyZUFwcHJvdmFsID8gWyctLXJlcXVpcmUtYXBwcm92YWw9bmV2ZXInXSA6IFtdKSwgLy8gRGVmYXVsdCB0byBubyBhcHByb3ZhbCBpbiBhbiB1bmF0dGVuZGVkIHRlc3RcbiAgICAgIC4uLihvcHRpb25zLm9wdGlvbnMgPz8gW10pLFxuICAgICAgLi4udGhpcy5mdWxsU3RhY2tOYW1lKHN0YWNrTmFtZXMpXSwgb3B0aW9ucyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2RrU3ludGgob3B0aW9uczogQ2RrQ2xpT3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuY2RrKFtcbiAgICAgICdzeW50aCcsXG4gICAgICAuLi4ob3B0aW9ucy5vcHRpb25zID8/IFtdKSxcbiAgICBdLCBvcHRpb25zKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjZGtEZXN0cm95KHN0YWNrTmFtZXM6IHN0cmluZyB8IHN0cmluZ1tdLCBvcHRpb25zOiBDZGtDbGlPcHRpb25zID0ge30pIHtcbiAgICBzdGFja05hbWVzID0gdHlwZW9mIHN0YWNrTmFtZXMgPT09ICdzdHJpbmcnID8gW3N0YWNrTmFtZXNdIDogc3RhY2tOYW1lcztcblxuICAgIHJldHVybiB0aGlzLmNkayhbJ2Rlc3Ryb3knLFxuICAgICAgJy1mJywgLy8gV2UgbmV2ZXIgd2FudCBhIHByb21wdCBpbiBhbiB1bmF0dGVuZGVkIHRlc3RcbiAgICAgIC4uLihvcHRpb25zLm9wdGlvbnMgPz8gW10pLFxuICAgICAgLi4udGhpcy5mdWxsU3RhY2tOYW1lKHN0YWNrTmFtZXMpXSwgb3B0aW9ucyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2RrKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBDZGtDbGlPcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlID8/IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcy5zaGVsbChbJ2NkaycsIC4uLih2ZXJib3NlID8gWyctdiddIDogW10pLCAuLi5hcmdzXSwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIG1vZEVudjoge1xuICAgICAgICBBV1NfUkVHSU9OOiB0aGlzLmF3cy5yZWdpb24sXG4gICAgICAgIEFXU19ERUZBVUxUX1JFR0lPTjogdGhpcy5hd3MucmVnaW9uLFxuICAgICAgICBTVEFDS19OQU1FX1BSRUZJWDogdGhpcy5zdGFja05hbWVQcmVmaXgsXG4gICAgICAgIC4uLm9wdGlvbnMubW9kRW52LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBmdWxsU3RhY2tOYW1lKHN0YWNrTmFtZTogc3RyaW5nKTogc3RyaW5nO1xuICBwdWJsaWMgZnVsbFN0YWNrTmFtZShzdGFja05hbWVzOiBzdHJpbmdbXSk6IHN0cmluZ1tdO1xuICBwdWJsaWMgZnVsbFN0YWNrTmFtZShzdGFja05hbWVzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHN0cmluZyB8IHN0cmluZ1tdIHtcbiAgICBpZiAodHlwZW9mIHN0YWNrTmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5zdGFja05hbWVQcmVmaXh9LSR7c3RhY2tOYW1lc31gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RhY2tOYW1lcy5tYXAocyA9PiBgJHt0aGlzLnN0YWNrTmFtZVByZWZpeH0tJHtzfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmQgdGhpcyB0byB0aGUgbGlzdCBvZiBidWNrZXRzIHRvIHBvdGVudGlhbGx5IGRlbGV0ZVxuICAgKlxuICAgKiBBdCB0aGUgZW5kIG9mIGEgdGVzdCwgd2UgY2xlYW4gdXAgYnVja2V0cyB0aGF0IG1heSBub3QgaGF2ZSBnb3R0ZW4gZGVzdHJveWVkXG4gICAqIChmb3Igd2hhdGV2ZXIgcmVhc29uKS5cbiAgICovXG4gIHB1YmxpYyByZW1lbWJlclRvRGVsZXRlQnVja2V0KGJ1Y2tldE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuYnVja2V0c1RvRGVsZXRlLnB1c2goYnVja2V0TmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW51cCBsZWZ0b3ZlciBzdGFja3MgYW5kIGJ1Y2tldHNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBkaXNwb3NlKHN1Y2Nlc3M6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzdGFja3NUb0RlbGV0ZSA9IGF3YWl0IHRoaXMuZGVsZXRlYWJsZVN0YWNrcyh0aGlzLnN0YWNrTmFtZVByZWZpeCk7XG5cbiAgICAvLyBCb290c3RyYXAgc3RhY2tzIGhhdmUgYnVja2V0cyB0aGF0IG5lZWQgdG8gYmUgY2xlYW5lZFxuICAgIGNvbnN0IGJ1Y2tldE5hbWVzID0gc3RhY2tzVG9EZWxldGUubWFwKHN0YWNrID0+IG91dHB1dEZyb21TdGFjaygnQnVja2V0TmFtZScsIHN0YWNrKSkuZmlsdGVyKGRlZmluZWQpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGJ1Y2tldE5hbWVzLm1hcChiID0+IHRoaXMuYXdzLmVtcHR5QnVja2V0KGIpKSk7XG4gICAgLy8gVGhlIGJvb3RzdHJhcCBidWNrZXQgaGFzIGEgcmVtb3ZhbCBwb2xpY3kgb2YgUkVUQUlOIGJ5IGRlZmF1bHQsIHNvIGFkZCBpdCB0byB0aGUgYnVja2V0cyB0byBiZSBjbGVhbmVkIHVwLlxuICAgIHRoaXMuYnVja2V0c1RvRGVsZXRlLnB1c2goLi4uYnVja2V0TmFtZXMpO1xuXG4gICAgLy8gQm9vdHN0cmFwIHN0YWNrcyBoYXZlIEVDUiByZXBvc2l0b3JpZXMgd2l0aCBpbWFnZXMgd2hpY2ggc2hvdWxkIGJlIGRlbGV0ZWRcbiAgICBjb25zdCBpbWFnZVJlcG9zaXRvcnlOYW1lcyA9IHN0YWNrc1RvRGVsZXRlLm1hcChzdGFjayA9PiBvdXRwdXRGcm9tU3RhY2soJ0ltYWdlUmVwb3NpdG9yeU5hbWUnLCBzdGFjaykpLmZpbHRlcihkZWZpbmVkKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChpbWFnZVJlcG9zaXRvcnlOYW1lcy5tYXAociA9PiB0aGlzLmF3cy5kZWxldGVJbWFnZVJlcG9zaXRvcnkocikpKTtcblxuICAgIGF3YWl0IHRoaXMuYXdzLmRlbGV0ZVN0YWNrcyguLi5zdGFja3NUb0RlbGV0ZS5tYXAocyA9PiBzLlN0YWNrTmFtZSkpO1xuXG4gICAgLy8gV2UgbWlnaHQgaGF2ZSBsZWFrZWQgc29tZSBidWNrZXRzIGJ5IHVwZ3JhZGluZyB0aGUgYm9vdHN0cmFwIHN0YWNrLiBCZVxuICAgIC8vIHN1cmUgdG8gY2xlYW4gZXZlcnl0aGluZy5cbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiB0aGlzLmJ1Y2tldHNUb0RlbGV0ZSkge1xuICAgICAgYXdhaXQgdGhpcy5hd3MuZGVsZXRlQnVja2V0KGJ1Y2tldCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHRlc3RzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHksIGhhcHBpbHkgZGVsZXRlIHRoZSBmaXh0dXJlXG4gICAgLy8gKG90aGVyd2lzZSBsZWF2ZSBpdCBmb3IgaHVtYW5zIHRvIGluc3BlY3QpXG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgIHJpbXJhZih0aGlzLmludGVnVGVzdERpcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgc3RhY2tzIHN0YXJ0aW5nIHdpdGggb3VyIHRlc3RpbmcgcHJlZml4IHRoYXQgc2hvdWxkIGJlIGRlbGV0ZWRcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZGVsZXRlYWJsZVN0YWNrcyhwcmVmaXg6IHN0cmluZyk6IFByb21pc2U8QVdTLkNsb3VkRm9ybWF0aW9uLlN0YWNrW10+IHtcbiAgICBjb25zdCBzdGF0dXNGaWx0ZXIgPSBbXG4gICAgICAnQ1JFQVRFX0lOX1BST0dSRVNTJywgJ0NSRUFURV9GQUlMRUQnLCAnQ1JFQVRFX0NPTVBMRVRFJyxcbiAgICAgICdST0xMQkFDS19JTl9QUk9HUkVTUycsICdST0xMQkFDS19GQUlMRUQnLCAnUk9MTEJBQ0tfQ09NUExFVEUnLFxuICAgICAgJ0RFTEVURV9GQUlMRUQnLFxuICAgICAgJ1VQREFURV9JTl9QUk9HUkVTUycsICdVUERBVEVfQ09NUExFVEVfQ0xFQU5VUF9JTl9QUk9HUkVTUycsXG4gICAgICAnVVBEQVRFX0NPTVBMRVRFJywgJ1VQREFURV9ST0xMQkFDS19JTl9QUk9HUkVTUycsXG4gICAgICAnVVBEQVRFX1JPTExCQUNLX0ZBSUxFRCcsXG4gICAgICAnVVBEQVRFX1JPTExCQUNLX0NPTVBMRVRFX0NMRUFOVVBfSU5fUFJPR1JFU1MnLFxuICAgICAgJ1VQREFURV9ST0xMQkFDS19DT01QTEVURScsICdSRVZJRVdfSU5fUFJPR1JFU1MnLFxuICAgICAgJ0lNUE9SVF9JTl9QUk9HUkVTUycsICdJTVBPUlRfQ09NUExFVEUnLFxuICAgICAgJ0lNUE9SVF9ST0xMQkFDS19JTl9QUk9HUkVTUycsICdJTVBPUlRfUk9MTEJBQ0tfRkFJTEVEJyxcbiAgICAgICdJTVBPUlRfUk9MTEJBQ0tfQ09NUExFVEUnLFxuICAgIF07XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuYXdzLmNsb3VkRm9ybWF0aW9uKCdkZXNjcmliZVN0YWNrcycsIHt9KTtcblxuICAgIHJldHVybiAocmVzcG9uc2UuU3RhY2tzID8/IFtdKVxuICAgICAgLmZpbHRlcihzID0+IHMuU3RhY2tOYW1lLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgIC5maWx0ZXIocyA9PiBzdGF0dXNGaWx0ZXIuaW5jbHVkZXMocy5TdGFja1N0YXR1cykpXG4gICAgICAuZmlsdGVyKHMgPT4gcy5Sb290SWQgPT09IHVuZGVmaW5lZCk7IC8vIE9ubHkgZGVsZXRlIHBhcmVudCBzdGFja3MuIE5lc3RlZCBzdGFja3MgYXJlIGRlbGV0ZWQgaW4gdGhlIHByb2Nlc3NcbiAgfVxufVxuXG4vKipcbiAqIFBlcmZvcm0gYSBvbmUtdGltZSBxdWljayBzYW5pdHkgY2hlY2sgdGhhdCB0aGUgQVdTIGNsaWVudHMgaGFzIHByb3Blcmx5IGNvbmZpZ3VyZWQgY3JlZGVudGlhbHNcbiAqXG4gKiBJZiB3ZSBkb24ndCBkbyB0aGlzLCBjYWxscyBhcmUgZ29pbmcgdG8gZmFpbCBhbmQgdGhleSdsbCBiZSByZXRyaWVkIGFuZCBldmVyeXRoaW5nIHdpbGwgdGFrZVxuICogZm9yZXZlciBiZWZvcmUgdGhlIHVzZXIgbm90aWNlcyBhIHNpbXBsZSBtaXNjb25maWd1cmF0aW9uLlxuICpcbiAqIFdlIGNhbid0IGNoZWNrIGZvciB0aGUgcHJlc2VuY2Ugb2YgZW52aXJvbm1lbnQgdmFyaWFibGVzIHNpbmNlIGNyZWRlbnRpYWxzIGNvdWxkIGNvbWUgZnJvbVxuICogYW55d2hlcmUsIHNvIGRvIHNpbXBsZSBhY2NvdW50IHJldHJpZXZhbC5cbiAqXG4gKiBPbmx5IGRvIGl0IG9uY2UgcGVyIHByb2Nlc3MuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhbml0eUNoZWNrKGF3czogQXdzQ2xpZW50cykge1xuICBpZiAoc2FuaXR5Q2hlY2tlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGF3cy5hY2NvdW50KCk7XG4gICAgICBzYW5pdHlDaGVja2VkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzYW5pdHlDaGVja2VkID0gZmFsc2U7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFXUyBjcmVkZW50aWFscyBwcm9iYWJseSBub3QgY29uZmlndXJlZCwgZ290IGVycm9yOiAke2UubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFzYW5pdHlDaGVja2VkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBV1MgY3JlZGVudGlhbHMgcHJvYmFibHkgbm90IGNvbmZpZ3VyZWQsIHNlZSBwcmV2aW91cyBlcnJvcicpO1xuICB9XG59XG5sZXQgc2FuaXR5Q2hlY2tlZDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBNYWtlIHN1cmUgdGhhdCB0aGUgZ2l2ZW4gZW52aXJvbm1lbnQgaXMgYm9vdHN0cmFwcGVkXG4gKlxuICogU2luY2Ugd2UgZ28gc3RyaXBpbmcgYWNyb3NzIHJlZ2lvbnMsIGl0J3MgZ29pbmcgdG8gc3VjayBkb2luZyB0aGlzXG4gKiBieSBoYW5kIHNvIGxldCdzIGp1c3QgbWFzcy1hdXRvbWF0ZSBpdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZW5zdXJlQm9vdHN0cmFwcGVkKGZpeHR1cmU6IFRlc3RGaXh0dXJlKSB7XG4gIC8vIE9sZC1zdHlsZSBib290c3RyYXAgc3RhY2sgd2l0aCBkZWZhdWx0IG5hbWVcbiAgaWYgKGF3YWl0IGZpeHR1cmUuYXdzLnN0YWNrU3RhdHVzKCdDREtUb29sa2l0JykgPT09IHVuZGVmaW5lZCkge1xuICAgIGF3YWl0IGZpeHR1cmUuY2RrKFsnYm9vdHN0cmFwJywgYGF3czovLyR7YXdhaXQgZml4dHVyZS5hd3MuYWNjb3VudCgpfS8ke2ZpeHR1cmUuYXdzLnJlZ2lvbn1gXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHNoZWxsIGNvbW1hbmQgdGhhdCBkb2VzIHdoYXQgeW91IHdhbnRcbiAqXG4gKiBJcyBwbGF0Zm9ybS1hd2FyZSwgaGFuZGxlcyBlcnJvcnMgbmljZWx5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hlbGwoY29tbWFuZDogc3RyaW5nW10sIG9wdGlvbnM6IFNoZWxsT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgaWYgKG9wdGlvbnMubW9kRW52ICYmIG9wdGlvbnMuZW52KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVc2UgZWl0aGVyIGVudiBvciBtb2RFbnYgYnV0IG5vdCBib3RoJyk7XG4gIH1cblxuICBvcHRpb25zLm91dHB1dD8ud3JpdGUoYPCfkrsgJHtjb21tYW5kLmpvaW4oJyAnKX1cXG5gKTtcblxuICBjb25zdCBlbnYgPSBvcHRpb25zLmVudiA/PyAob3B0aW9ucy5tb2RFbnYgPyB7IC4uLnByb2Nlc3MuZW52LCAuLi5vcHRpb25zLm1vZEVudiB9IDogdW5kZWZpbmVkKTtcblxuICBjb25zdCBjaGlsZCA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oY29tbWFuZFswXSwgY29tbWFuZC5zbGljZSgxKSwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZW52LFxuICAgIC8vIE5lZWQgdGhpcyBmb3IgV2luZG93cyB3aGVyZSB3ZSB3YW50IC5jbWQgYW5kIC5iYXQgdG8gYmUgZm91bmQgYXMgd2VsbC5cbiAgICBzaGVsbDogdHJ1ZSxcbiAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdwaXBlJ10sXG4gIH0pO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzdGRvdXQgPSBuZXcgQXJyYXk8QnVmZmVyPigpO1xuICAgIGNvbnN0IHN0ZGVyciA9IG5ldyBBcnJheTxCdWZmZXI+KCk7XG5cbiAgICBjaGlsZC5zdGRvdXQhLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgb3B0aW9ucy5vdXRwdXQ/LndyaXRlKGNodW5rKTtcbiAgICAgIHN0ZG91dC5wdXNoKGNodW5rKTtcbiAgICB9KTtcblxuICAgIGNoaWxkLnN0ZGVyciEub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICBvcHRpb25zLm91dHB1dD8ud3JpdGUoY2h1bmspO1xuICAgICAgaWYgKG9wdGlvbnMuY2FwdHVyZVN0ZGVyciA/PyB0cnVlKSB7XG4gICAgICAgIHN0ZGVyci5wdXNoKGNodW5rKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkLm9uY2UoJ2Vycm9yJywgcmVqZWN0KTtcblxuICAgIGNoaWxkLm9uY2UoJ2Nsb3NlJywgY29kZSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXQgPSAoQnVmZmVyLmNvbmNhdChzdGRvdXQpLnRvU3RyaW5nKCd1dGYtOCcpICsgQnVmZmVyLmNvbmNhdChzdGRlcnIpLnRvU3RyaW5nKCd1dGYtOCcpKS50cmltKCk7XG4gICAgICBpZiAoY29kZSA9PT0gMCB8fCBvcHRpb25zLmFsbG93RXJyRXhpdCkge1xuICAgICAgICByZXNvbHZlKG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGAnJHtjb21tYW5kLmpvaW4oJyAnKX0nIGV4aXRlZCB3aXRoIGVycm9yIGNvZGUgJHtjb2RlfS4gT3V0cHV0OiBcXG4ke291dHB1dH1gKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkZWZpbmVkPEE+KHg6IEEpOiB4IGlzIE5vbk51bGxhYmxlPEE+IHtcbiAgcmV0dXJuIHggIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBybSAtcmYgcmVpbXBsZW1lbnRhdGlvbiwgZG9uJ3Qgd2FudCB0byBkZXBlbmQgb24gYW4gTlBNIHBhY2thZ2UgZm9yIHRoaXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJpbXJhZihmc1BhdGg6IHN0cmluZykge1xuICB0cnkge1xuICAgIGNvbnN0IGlzRGlyID0gZnMubHN0YXRTeW5jKGZzUGF0aCkuaXNEaXJlY3RvcnkoKTtcblxuICAgIGlmIChpc0Rpcikge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZzLnJlYWRkaXJTeW5jKGZzUGF0aCkpIHtcbiAgICAgICAgcmltcmFmKHBhdGguam9pbihmc1BhdGgsIGZpbGUpKTtcbiAgICAgIH1cbiAgICAgIGZzLnJtZGlyU3luYyhmc1BhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmcy51bmxpbmtTeW5jKGZzUGF0aCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gV2Ugd2lsbCBzdXJ2aXZlIEVOT0VOVFxuICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7IHRocm93IGU7IH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tU3RyaW5nKCkge1xuICAvLyBDcmF6eVxuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXowLTldKy9nLCAnJyk7XG59XG4iXX0=