"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The init templates rely on parsing the current major version to find the correct template directory.
 * During tests, the current package version is '0.0.0', rather than a specific version.
 * The below mocks the versionNumber to return the major version (and so init template version) specified.
 */
let mockMajorVersion = '1.0.0';
jest.mock('../lib/version', () => ({
    versionNumber: () => mockMajorVersion,
}));
const os = require("os");
const path = require("path");
const cxapi = require("@aws-cdk/cx-api");
const fs = require("fs-extra");
const init_1 = require("../lib/init");
describe.each(['1', '2'])('v%s tests', (majorVersion) => {
    beforeEach(() => {
        mockMajorVersion = `${majorVersion}.0.0`;
        jest.resetAllMocks();
    });
    cliTest('create a TypeScript library project', async (workDir) => {
        await init_1.cliInit('lib', 'typescript', false, undefined /* canUseNetwork */, workDir);
        // Check that package.json and lib/ got created in the current directory
        expect(await fs.pathExists(path.join(workDir, 'package.json'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, 'lib'))).toBeTruthy();
    });
    cliTest('create a TypeScript app project', async (workDir) => {
        await init_1.cliInit('app', 'typescript', false, undefined /* canUseNetwork */, workDir);
        // Check that package.json and bin/ got created in the current directory
        expect(await fs.pathExists(path.join(workDir, 'package.json'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, 'bin'))).toBeTruthy();
    });
    cliTest('create a JavaScript app project', async (workDir) => {
        await init_1.cliInit('app', 'javascript', false, undefined /* canUseNetwork */, workDir);
        // Check that package.json and bin/ got created in the current directory
        expect(await fs.pathExists(path.join(workDir, 'package.json'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, 'bin'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, '.git'))).toBeTruthy();
    });
    cliTest('--generate-only should skip git init', async (workDir) => {
        await init_1.cliInit('app', 'javascript', false, true, workDir);
        // Check that package.json and bin/ got created in the current directory
        expect(await fs.pathExists(path.join(workDir, 'package.json'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, 'bin'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, '.git'))).toBeFalsy();
    });
    cliTest('git directory does not throw off the initer!', async (workDir) => {
        fs.mkdirSync(path.join(workDir, '.git'));
        await init_1.cliInit('app', 'typescript', false, undefined /* canUseNetwork */, workDir);
        // Check that package.json and bin/ got created in the current directory
        expect(await fs.pathExists(path.join(workDir, 'package.json'))).toBeTruthy();
        expect(await fs.pathExists(path.join(workDir, 'bin'))).toBeTruthy();
    });
    test('verify "future flags" are added to cdk.json', async () => {
        // This is a lot to test, and it can be slow-ish, especially when ran with other tests.
        jest.setTimeout(30000);
        for (const templ of await init_1.availableInitTemplates()) {
            for (const lang of templ.languages) {
                await withTempDir(async (tmpDir) => {
                    await init_1.cliInit(templ.name, lang, 
                    /* canUseNetwork */ false, 
                    /* generateOnly */ true, tmpDir);
                    // ok if template doesn't have a cdk.json file (e.g. the "lib" template)
                    if (!await fs.pathExists(path.join(tmpDir, 'cdk.json'))) {
                        return;
                    }
                    const config = await fs.readJson(path.join(tmpDir, 'cdk.json'));
                    const context = config.context || {};
                    for (const [key, expected] of Object.entries(cxapi.FUTURE_FLAGS)) {
                        const actual = context[key];
                        expect(actual).toEqual(expected);
                    }
                });
            }
        }
    });
});
test('when no version number is present (e.g., local development), the v1 templates are chosen by default', async () => {
    mockMajorVersion = '0.0.0';
    jest.resetAllMocks();
    expect((await init_1.availableInitTemplates()).length).toBeGreaterThan(0);
});
function cliTest(name, handler) {
    test(name, () => withTempDir(handler));
}
async function withTempDir(cb) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aws-cdk-test'));
    try {
        await cb(tmpDir);
    }
    finally {
        await fs.remove(tmpDir);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW5pdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7R0FJRztBQUNILElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqQyxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCO0NBQ3RDLENBQUMsQ0FBQyxDQUFDO0FBRUoseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qix5Q0FBeUM7QUFDekMsK0JBQStCO0FBQy9CLHNDQUE4RDtBQUU5RCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUU7SUFDdEQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLGdCQUFnQixHQUFHLEdBQUcsWUFBWSxNQUFNLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLHFDQUFxQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMvRCxNQUFNLGNBQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEYsd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMzRCxNQUFNLGNBQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEYsd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMzRCxNQUFNLGNBQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEYsd0VBQXdFO1FBQ3hFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVB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LENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ2xDO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUdBQXFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDckgsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBQzNCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUVyQixNQUFNLENBQUMsQ0FBQyxNQUFNLDZCQUFzQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLE9BQU8sQ0FBQyxJQUFZLEVBQUUsT0FBNkM7SUFDMUUsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxFQUF3QztJQUNqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUN4RSxJQUFJO1FBQ0YsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEI7WUFBUztRQUNSLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN6QjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBpbml0IHRlbXBsYXRlcyByZWx5IG9uIHBhcnNpbmcgdGhlIGN1cnJlbnQgbWFqb3IgdmVyc2lvbiB0byBmaW5kIHRoZSBjb3JyZWN0IHRlbXBsYXRlIGRpcmVjdG9yeS5cbiAqIER1cmluZyB0ZXN0cywgdGhlIGN1cnJlbnQgcGFja2FnZSB2ZXJzaW9uIGlzICcwLjAuMCcsIHJhdGhlciB0aGFuIGEgc3BlY2lmaWMgdmVyc2lvbi5cbiAqIFRoZSBiZWxvdyBtb2NrcyB0aGUgdmVyc2lvbk51bWJlciB0byByZXR1cm4gdGhlIG1ham9yIHZlcnNpb24gKGFuZCBzbyBpbml0IHRlbXBsYXRlIHZlcnNpb24pIHNwZWNpZmllZC5cbiAqL1xubGV0IG1vY2tNYWpvclZlcnNpb24gPSAnMS4wLjAnO1xuamVzdC5tb2NrKCcuLi9saWIvdmVyc2lvbicsICgpID0+ICh7XG4gIHZlcnNpb25OdW1iZXI6ICgpID0+IG1vY2tNYWpvclZlcnNpb24sXG59KSk7XG5cbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBjeGFwaSBmcm9tICdAYXdzLWNkay9jeC1hcGknO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHsgYXZhaWxhYmxlSW5pdFRlbXBsYXRlcywgY2xpSW5pdCB9IGZyb20gJy4uL2xpYi9pbml0JztcblxuZGVzY3JpYmUuZWFjaChbJzEnLCAnMiddKSgndiVzIHRlc3RzJywgKG1ham9yVmVyc2lvbikgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBtb2NrTWFqb3JWZXJzaW9uID0gYCR7bWFqb3JWZXJzaW9ufS4wLjBgO1xuICAgIGplc3QucmVzZXRBbGxNb2NrcygpO1xuICB9KTtcblxuICBjbGlUZXN0KCdjcmVhdGUgYSBUeXBlU2NyaXB0IGxpYnJhcnkgcHJvamVjdCcsIGFzeW5jICh3b3JrRGlyKSA9PiB7XG4gICAgYXdhaXQgY2xpSW5pdCgnbGliJywgJ3R5cGVzY3JpcHQnLCBmYWxzZSwgdW5kZWZpbmVkIC8qIGNhblVzZU5ldHdvcmsgKi8sIHdvcmtEaXIpO1xuXG4gICAgLy8gQ2hlY2sgdGhhdCBwYWNrYWdlLmpzb24gYW5kIGxpYi8gZ290IGNyZWF0ZWQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgZXhwZWN0KGF3YWl0IGZzLnBhdGhFeGlzdHMocGF0aC5qb2luKHdvcmtEaXIsICdwYWNrYWdlLmpzb24nKSkpLnRvQmVUcnV0aHkoKTtcbiAgICBleHBlY3QoYXdhaXQgZnMucGF0aEV4aXN0cyhwYXRoLmpvaW4od29ya0RpciwgJ2xpYicpKSkudG9CZVRydXRoeSgpO1xuICB9KTtcblxuICBjbGlUZXN0KCdjcmVhdGUgYSBUeXBlU2NyaXB0IGFwcCBwcm9qZWN0JywgYXN5bmMgKHdvcmtEaXIpID0+IHtcbiAgICBhd2FpdCBjbGlJbml0KCdhcHAnLCAndHlwZXNjcmlwdCcsIGZhbHNlLCB1bmRlZmluZWQgLyogY2FuVXNlTmV0d29yayAqLywgd29ya0Rpcik7XG5cbiAgICAvLyBDaGVjayB0aGF0IHBhY2thZ2UuanNvbiBhbmQgYmluLyBnb3QgY3JlYXRlZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlcbiAgICBleHBlY3QoYXdhaXQgZnMucGF0aEV4aXN0cyhwYXRoLmpvaW4od29ya0RpciwgJ3BhY2thZ2UuanNvbicpKSkudG9CZVRydXRoeSgpO1xuICAgIGV4cGVjdChhd2FpdCBmcy5wYXRoRXhpc3RzKHBhdGguam9pbih3b3JrRGlyLCAnYmluJykpKS50b0JlVHJ1dGh5KCk7XG4gIH0pO1xuXG4gIGNsaVRlc3QoJ2NyZWF0ZSBhIEphdmFTY3JpcHQgYXBwIHByb2plY3QnLCBhc3luYyAod29ya0RpcikgPT4ge1xuICAgIGF3YWl0IGNsaUluaXQoJ2FwcCcsICdqYXZhc2NyaXB0JywgZmFsc2UsIHVuZGVmaW5lZCAvKiBjYW5Vc2VOZXR3b3JrICovLCB3b3JrRGlyKTtcblxuICAgIC8vIENoZWNrIHRoYXQgcGFja2FnZS5qc29uIGFuZCBiaW4vIGdvdCBjcmVhdGVkIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgIGV4cGVjdChhd2FpdCBmcy5wYXRoRXhpc3RzKHBhdGguam9pbih3b3JrRGlyLCAncGFja2FnZS5qc29uJykpKS50b0JlVHJ1dGh5KCk7XG4gICAgZXhwZWN0KGF3YWl0IGZzLnBhdGhFeGlzdHMocGF0aC5qb2luKHdvcmtEaXIsICdiaW4nKSkpLnRvQmVUcnV0aHkoKTtcbiAgICBleHBlY3QoYXdhaXQgZnMucGF0aEV4aXN0cyhwYXRoLmpvaW4od29ya0RpciwgJy5naXQnKSkpLnRvQmVUcnV0aHkoKTtcbiAgfSk7XG5cbiAgY2xpVGVzdCgnLS1nZW5lcmF0ZS1vbmx5IHNob3VsZCBza2lwIGdpdCBpbml0JywgYXN5bmMgKHdvcmtEaXIpID0+IHtcbiAgICBhd2FpdCBjbGlJbml0KCdhcHAnLCAnamF2YXNjcmlwdCcsIGZhbHNlLCB0cnVlLCB3b3JrRGlyKTtcblxuICAgIC8vIENoZWNrIHRoYXQgcGFja2FnZS5qc29uIGFuZCBiaW4vIGdvdCBjcmVhdGVkIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgIGV4cGVjdChhd2FpdCBmcy5wYXRoRXhpc3RzKHBhdGguam9pbih3b3JrRGlyLCAncGFja2FnZS5qc29uJykpKS50b0JlVHJ1dGh5KCk7XG4gICAgZXhwZWN0KGF3YWl0IGZzLnBhdGhFeGlzdHMocGF0aC5qb2luKHdvcmtEaXIsICdiaW4nKSkpLnRvQmVUcnV0aHkoKTtcbiAgICBleHBlY3QoYXdhaXQgZnMucGF0aEV4aXN0cyhwYXRoLmpvaW4od29ya0RpciwgJy5naXQnKSkpLnRvQmVGYWxzeSgpO1xuICB9KTtcblxuICBjbGlUZXN0KCdnaXQgZGlyZWN0b3J5IGRvZXMgbm90IHRocm93IG9mZiB0aGUgaW5pdGVyIScsIGFzeW5jICh3b3JrRGlyKSA9PiB7XG4gICAgZnMubWtkaXJTeW5jKHBhdGguam9pbih3b3JrRGlyLCAnLmdpdCcpKTtcblxuICAgIGF3YWl0IGNsaUluaXQoJ2FwcCcsICd0eXBlc2NyaXB0JywgZmFsc2UsIHVuZGVmaW5lZCAvKiBjYW5Vc2VOZXR3b3JrICovLCB3b3JrRGlyKTtcblxuICAgIC8vIENoZWNrIHRoYXQgcGFja2FnZS5qc29uIGFuZCBiaW4vIGdvdCBjcmVhdGVkIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgIGV4cGVjdChhd2FpdCBmcy5wYXRoRXhpc3RzKHBhdGguam9pbih3b3JrRGlyLCAncGFja2FnZS5qc29uJykpKS50b0JlVHJ1dGh5KCk7XG4gICAgZXhwZWN0KGF3YWl0IGZzLnBhdGhFeGlzdHMocGF0aC5qb2luKHdvcmtEaXIsICdiaW4nKSkpLnRvQmVUcnV0aHkoKTtcbiAgfSk7XG5cbiAgdGVzdCgndmVyaWZ5IFwiZnV0dXJlIGZsYWdzXCIgYXJlIGFkZGVkIHRvIGNkay5qc29uJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIFRoaXMgaXMgYSBsb3QgdG8gdGVzdCwgYW5kIGl0IGNhbiBiZSBzbG93LWlzaCwgZXNwZWNpYWxseSB3aGVuIHJhbiB3aXRoIG90aGVyIHRlc3RzLlxuICAgIGplc3Quc2V0VGltZW91dCgzMF8wMDApO1xuXG4gICAgZm9yIChjb25zdCB0ZW1wbCBvZiBhd2FpdCBhdmFpbGFibGVJbml0VGVtcGxhdGVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgbGFuZyBvZiB0ZW1wbC5sYW5ndWFnZXMpIHtcbiAgICAgICAgYXdhaXQgd2l0aFRlbXBEaXIoYXN5bmMgdG1wRGlyID0+IHtcbiAgICAgICAgICBhd2FpdCBjbGlJbml0KHRlbXBsLm5hbWUsIGxhbmcsXG4gICAgICAgICAgICAvKiBjYW5Vc2VOZXR3b3JrICovIGZhbHNlLFxuICAgICAgICAgICAgLyogZ2VuZXJhdGVPbmx5ICovIHRydWUsXG4gICAgICAgICAgICB0bXBEaXIpO1xuXG4gICAgICAgICAgLy8gb2sgaWYgdGVtcGxhdGUgZG9lc24ndCBoYXZlIGEgY2RrLmpzb24gZmlsZSAoZS5nLiB0aGUgXCJsaWJcIiB0ZW1wbGF0ZSlcbiAgICAgICAgICBpZiAoIWF3YWl0IGZzLnBhdGhFeGlzdHMocGF0aC5qb2luKHRtcERpciwgJ2Nkay5qc29uJykpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgZnMucmVhZEpzb24ocGF0aC5qb2luKHRtcERpciwgJ2Nkay5qc29uJykpO1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb25maWcuY29udGV4dCB8fCB7fTtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGV4cGVjdGVkXSBvZiBPYmplY3QuZW50cmllcyhjeGFwaS5GVVRVUkVfRkxBR1MpKSB7XG4gICAgICAgICAgICBjb25zdCBhY3R1YWwgPSBjb250ZXh0W2tleV07XG4gICAgICAgICAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKGV4cGVjdGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcblxudGVzdCgnd2hlbiBubyB2ZXJzaW9uIG51bWJlciBpcyBwcmVzZW50IChlLmcuLCBsb2NhbCBkZXZlbG9wbWVudCksIHRoZSB2MSB0ZW1wbGF0ZXMgYXJlIGNob3NlbiBieSBkZWZhdWx0JywgYXN5bmMgKCkgPT4ge1xuICBtb2NrTWFqb3JWZXJzaW9uID0gJzAuMC4wJztcbiAgamVzdC5yZXNldEFsbE1vY2tzKCk7XG5cbiAgZXhwZWN0KChhd2FpdCBhdmFpbGFibGVJbml0VGVtcGxhdGVzKCkpLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApO1xufSk7XG5cbmZ1bmN0aW9uIGNsaVRlc3QobmFtZTogc3RyaW5nLCBoYW5kbGVyOiAoZGlyOiBzdHJpbmcpID0+IHZvaWQgfCBQcm9taXNlPGFueT4pOiB2b2lkIHtcbiAgdGVzdChuYW1lLCAoKSA9PiB3aXRoVGVtcERpcihoYW5kbGVyKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdpdGhUZW1wRGlyKGNiOiAoZGlyOiBzdHJpbmcpID0+IHZvaWQgfCBQcm9taXNlPGFueT4pIHtcbiAgY29uc3QgdG1wRGlyID0gYXdhaXQgZnMubWtkdGVtcChwYXRoLmpvaW4ob3MudG1wZGlyKCksICdhd3MtY2RrLXRlc3QnKSk7XG4gIHRyeSB7XG4gICAgYXdhaXQgY2IodG1wRGlyKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBhd2FpdCBmcy5yZW1vdmUodG1wRGlyKTtcbiAgfVxufVxuIl19