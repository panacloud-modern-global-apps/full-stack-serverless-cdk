"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAvailableTemplates = exports.availableInitLanguages = exports.availableInitTemplates = exports.InitTemplate = exports.cliInit = void 0;
const childProcess = require("child_process");
const path = require("path");
const cxapi = require("@aws-cdk/cx-api");
const colors = require("colors/safe");
const fs = require("fs-extra");
const semver = require("semver");
const logging_1 = require("./logging");
const directories_1 = require("./util/directories");
const version_1 = require("./version");
/* eslint-disable @typescript-eslint/no-var-requires */ // Packages don't have @types module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const camelCase = require('camelcase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const decamelize = require('decamelize');
/**
 * Initialize a CDK package in the current directory
 */
async function cliInit(type, language, canUseNetwork = true, generateOnly = false, workDir = process.cwd()) {
    if (!type && !language) {
        await printAvailableTemplates();
        return;
    }
    type = type || 'default'; // "default" is the default type (and maps to "app")
    const template = (await availableInitTemplates()).find(t => t.hasName(type));
    if (!template) {
        await printAvailableTemplates(language);
        throw new Error(`Unknown init template: ${type}`);
    }
    if (!language && template.languages.length === 1) {
        language = template.languages[0];
        logging_1.warning(`No --language was provided, but '${type}' supports only '${language}', so defaulting to --language=${language}`);
    }
    if (!language) {
        logging_1.print(`Available languages for ${colors.green(type)}: ${template.languages.map(l => colors.blue(l)).join(', ')}`);
        throw new Error('No language was selected');
    }
    await initializeProject(template, language, canUseNetwork, generateOnly, workDir);
}
exports.cliInit = cliInit;
/**
 * Returns the name of the Python executable for this OS
 */
function pythonExecutable() {
    let python = 'python3';
    if (process.platform === 'win32') {
        python = 'python';
    }
    return python;
}
const INFO_DOT_JSON = 'info.json';
class InitTemplate {
    constructor(basePath, name, languages, info) {
        this.basePath = basePath;
        this.name = name;
        this.languages = languages;
        this.aliases = new Set();
        this.description = info.description;
        for (const alias of info.aliases || []) {
            this.aliases.add(alias);
        }
    }
    static async fromName(templatesDir, name) {
        const basePath = path.join(templatesDir, name);
        const languages = (await listDirectory(basePath)).filter(f => f !== INFO_DOT_JSON);
        const info = await fs.readJson(path.join(basePath, INFO_DOT_JSON));
        return new InitTemplate(basePath, name, languages, info);
    }
    /**
     * @param name the name that is being checked
     * @returns ``true`` if ``name`` is the name of this template or an alias of it.
     */
    hasName(name) {
        return name === this.name || this.aliases.has(name);
    }
    /**
     * Creates a new instance of this ``InitTemplate`` for a given language to a specified folder.
     *
     * @param language    the language to instantiate this template with
     * @param targetDirectory the directory where the template is to be instantiated into
     */
    async install(language, targetDirectory) {
        if (this.languages.indexOf(language) === -1) {
            logging_1.error(`The ${colors.blue(language)} language is not supported for ${colors.green(this.name)} `
                + `(it supports: ${this.languages.map(l => colors.blue(l)).join(', ')})`);
            throw new Error(`Unsupported language: ${language}`);
        }
        const sourceDirectory = path.join(this.basePath, language);
        const hookTempDirectory = path.join(targetDirectory, 'tmp');
        await fs.mkdir(hookTempDirectory);
        await this.installFiles(sourceDirectory, targetDirectory, {
            name: decamelize(path.basename(path.resolve(targetDirectory))),
        });
        await this.applyFutureFlags(targetDirectory);
        await this.invokeHooks(hookTempDirectory, targetDirectory);
        await fs.remove(hookTempDirectory);
    }
    async installFiles(sourceDirectory, targetDirectory, project) {
        for (const file of await fs.readdir(sourceDirectory)) {
            const fromFile = path.join(sourceDirectory, file);
            const toFile = path.join(targetDirectory, this.expand(file, project));
            if ((await fs.stat(fromFile)).isDirectory()) {
                await fs.mkdir(toFile);
                await this.installFiles(fromFile, toFile, project);
                continue;
            }
            else if (file.match(/^.*\.template\.[^.]+$/)) {
                await this.installProcessed(fromFile, toFile.replace(/\.template(\.[^.]+)$/, '$1'), project);
                continue;
            }
            else if (file.match(/^.*\.hook\.(d.)?[^.]+$/)) {
                await this.installProcessed(fromFile, path.join(targetDirectory, 'tmp', file), project);
                continue;
            }
            else {
                await fs.copy(fromFile, toFile);
            }
        }
    }
    /**
     * @summary   Invoke any javascript hooks that exist in the template.
     * @description Sometimes templates need more complex logic than just replacing tokens. A 'hook' is
     *        any file that ends in .hook.js. It should export a single function called "invoke"
     *        that accepts a single string parameter. When the template is installed, each hook
     *        will be invoked, passing the target directory as the only argument. Hooks are invoked
     *        in lexical order.
     */
    async invokeHooks(sourceDirectory, targetDirectory) {
        const files = await fs.readdir(sourceDirectory);
        files.sort(); // Sorting allows template authors to control the order in which hooks are invoked.
        for (const file of files) {
            if (file.match(/^.*\.hook\.js$/)) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const invoke = require(path.join(sourceDirectory, file)).invoke;
                await invoke(targetDirectory);
            }
        }
    }
    async installProcessed(templatePath, toFile, project) {
        const template = await fs.readFile(templatePath, { encoding: 'utf-8' });
        await fs.writeFile(toFile, this.expand(template, project));
    }
    expand(template, project) {
        const MATCH_VER_BUILD = /\+[a-f0-9]+$/; // Matches "+BUILD" in "x.y.z-beta+BUILD"
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const cdkVersion = require('../package.json').version.replace(MATCH_VER_BUILD, '');
        return template.replace(/%name%/g, project.name)
            .replace(/%name\.camelCased%/g, camelCase(project.name))
            .replace(/%name\.PascalCased%/g, camelCase(project.name, { pascalCase: true }))
            .replace(/%cdk-version%/g, cdkVersion)
            .replace(/%cdk-home%/g, directories_1.cdkHomeDir())
            .replace(/%name\.PythonModule%/g, project.name.replace(/-/g, '_'))
            .replace(/%python-executable%/g, pythonExecutable())
            .replace(/%name\.StackName%/g, project.name.replace(/[^A-Za-z0-9-]/g, '-'));
    }
    /**
     * Adds context variables to `cdk.json` in the generated project directory to
     * enable future behavior for new projects.
     */
    async applyFutureFlags(projectDir) {
        const cdkJson = path.join(projectDir, 'cdk.json');
        if (!await fs.pathExists(cdkJson)) {
            return;
        }
        const config = await fs.readJson(cdkJson);
        config.context = {
            ...config.context,
            ...cxapi.FUTURE_FLAGS,
        };
        await fs.writeJson(cdkJson, config, { spaces: 2 });
    }
}
exports.InitTemplate = InitTemplate;
function versionedTemplatesDir() {
    return new Promise(async (resolve) => {
        let currentVersion = version_1.versionNumber();
        // If the CLI is invoked from source (i.e., developement), rather than from a packaged distribution,
        // the version number will be '0.0.0'. We will (currently) default to the v1 templates in this case.
        if (currentVersion === '0.0.0') {
            currentVersion = '1.0.0';
        }
        const majorVersion = semver.major(currentVersion);
        resolve(path.join(__dirname, 'init-templates', `v${majorVersion}`));
    });
}
async function availableInitTemplates() {
    return new Promise(async (resolve) => {
        const templatesDir = await versionedTemplatesDir();
        const templateNames = await listDirectory(templatesDir);
        const templates = new Array();
        for (const templateName of templateNames) {
            templates.push(await InitTemplate.fromName(templatesDir, templateName));
        }
        resolve(templates);
    });
}
exports.availableInitTemplates = availableInitTemplates;
async function availableInitLanguages() {
    return new Promise(async (resolve) => {
        const templates = await availableInitTemplates();
        const result = new Set();
        for (const template of templates) {
            for (const language of template.languages) {
                result.add(language);
            }
        }
        resolve([...result]);
    });
}
exports.availableInitLanguages = availableInitLanguages;
/**
 * @param dirPath is the directory to be listed.
 * @returns the list of file or directory names contained in ``dirPath``, excluding any dot-file, and sorted.
 */
async function listDirectory(dirPath) {
    return (await fs.readdir(dirPath))
        .filter(p => !p.startsWith('.'))
        .sort();
}
async function printAvailableTemplates(language) {
    logging_1.print('Available templates:');
    for (const template of await availableInitTemplates()) {
        if (language && template.languages.indexOf(language) === -1) {
            continue;
        }
        logging_1.print(`* ${colors.green(template.name)}: ${template.description}`);
        const languageArg = language ? colors.bold(language)
            : template.languages.length > 1 ? `[${template.languages.map(t => colors.bold(t)).join('|')}]`
                : colors.bold(template.languages[0]);
        logging_1.print(`   └─ ${colors.blue(`cdk init ${colors.bold(template.name)} --language=${languageArg}`)}`);
    }
}
exports.printAvailableTemplates = printAvailableTemplates;
async function initializeProject(template, language, canUseNetwork, generateOnly, workDir) {
    await assertIsEmptyDirectory(workDir);
    logging_1.print(`Applying project template ${colors.green(template.name)} for ${colors.blue(language)}`);
    await template.install(language, workDir);
    if (await fs.pathExists('README.md')) {
        logging_1.print(colors.green(await fs.readFile('README.md', { encoding: 'utf-8' })));
    }
    if (!generateOnly) {
        await initializeGitRepository(workDir);
        await postInstall(language, canUseNetwork, workDir);
    }
    logging_1.print('✅ All done!');
}
async function assertIsEmptyDirectory(workDir) {
    const files = await fs.readdir(workDir);
    if (files.filter(f => !f.startsWith('.')).length !== 0) {
        throw new Error('`cdk init` cannot be run in a non-empty directory!');
    }
}
async function initializeGitRepository(workDir) {
    if (await isInGitRepository(workDir)) {
        return;
    }
    logging_1.print('Initializing a new git repository...');
    try {
        await execute('git', ['init'], { cwd: workDir });
        await execute('git', ['add', '.'], { cwd: workDir });
        await execute('git', ['commit', '--message="Initial commit"', '--no-gpg-sign'], { cwd: workDir });
    }
    catch (e) {
        logging_1.warning('Unable to initialize git repository for your project.');
    }
}
async function postInstall(language, canUseNetwork, workDir) {
    switch (language) {
        case 'javascript':
            return postInstallJavascript(canUseNetwork, workDir);
        case 'typescript':
            return postInstallTypescript(canUseNetwork, workDir);
        case 'java':
            return postInstallJava(canUseNetwork, workDir);
        case 'python':
            return postInstallPython(workDir);
    }
}
async function postInstallJavascript(canUseNetwork, cwd) {
    return postInstallTypescript(canUseNetwork, cwd);
}
async function postInstallTypescript(canUseNetwork, cwd) {
    const command = 'npm';
    if (!canUseNetwork) {
        logging_1.warning(`Please run '${command} install'!`);
        return;
    }
    logging_1.print(`Executing ${colors.green(`${command} install`)}...`);
    try {
        await execute(command, ['install'], { cwd });
    }
    catch (e) {
        logging_1.warning(`${command} install failed: ` + e.message);
    }
}
async function postInstallJava(canUseNetwork, cwd) {
    const mvnPackageWarning = 'Please run \'mvn package\'!';
    if (!canUseNetwork) {
        logging_1.warning(mvnPackageWarning);
        return;
    }
    logging_1.print('Executing \'mvn package\'');
    try {
        await execute('mvn', ['package'], { cwd });
    }
    catch (e) {
        logging_1.warning('Unable to package compiled code as JAR');
        logging_1.warning(mvnPackageWarning);
    }
}
async function postInstallPython(cwd) {
    const python = pythonExecutable();
    logging_1.warning(`Please run '${python} -m venv .venv'!`);
    logging_1.print(`Executing ${colors.green('Creating virtualenv...')}`);
    try {
        await execute(python, ['-m venv', '.venv'], { cwd });
    }
    catch (e) {
        logging_1.warning('Unable to create virtualenv automatically');
        logging_1.warning(`Please run '${python} -m venv .venv'!`);
    }
}
/**
 * @param dir a directory to be checked
 * @returns true if ``dir`` is within a git repository.
 */
async function isInGitRepository(dir) {
    while (true) {
        if (await fs.pathExists(path.join(dir, '.git'))) {
            return true;
        }
        if (isRoot(dir)) {
            return false;
        }
        dir = path.dirname(dir);
    }
}
/**
 * @param dir a directory to be checked.
 * @returns true if ``dir`` is the root of a filesystem.
 */
function isRoot(dir) {
    return path.dirname(dir) === dir;
}
/**
 * Executes `command`. STDERR is emitted in real-time.
 *
 * If command exits with non-zero exit code, an exceprion is thrown and includes
 * the contents of STDOUT.
 *
 * @returns STDOUT (if successful).
 */
async function execute(cmd, args, { cwd }) {
    const child = childProcess.spawn(cmd, args, { cwd, shell: true, stdio: ['ignore', 'pipe', 'inherit'] });
    let stdout = '';
    child.stdout.on('data', chunk => stdout += chunk.toString());
    return new Promise((ok, fail) => {
        child.once('error', err => fail(err));
        child.once('exit', status => {
            if (status === 0) {
                return ok(stdout);
            }
            else {
                process.stderr.write(stdout);
                return fail(new Error(`${cmd} exited with status ${status}`));
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQThDO0FBQzlDLDZCQUE2QjtBQUM3Qix5Q0FBeUM7QUFDekMsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsdUNBQWtEO0FBQ2xELG9EQUFnRDtBQUNoRCx1Q0FBMEM7QUFJMUMsdURBQXVELENBQUMsb0NBQW9DO0FBQzVGLGlFQUFpRTtBQUNqRSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsaUVBQWlFO0FBQ2pFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV6Qzs7R0FFRztBQUNJLEtBQUssVUFBVSxPQUFPLENBQUMsSUFBYSxFQUFFLFFBQWlCLEVBQUUsYUFBYSxHQUFHLElBQUksRUFBRSxZQUFZLEdBQUcsS0FBSyxFQUFFLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFO0lBQ2pJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDdEIsTUFBTSx1QkFBdUIsRUFBRSxDQUFDO1FBQ2hDLE9BQU87S0FDUjtJQUVELElBQUksR0FBRyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsb0RBQW9EO0lBRTlFLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxzQkFBc0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlFLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixNQUFNLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLElBQUksRUFBRSxDQUFDLENBQUM7S0FDbkQ7SUFDRCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENB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c3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCAqIGFzIGNvbG9ycyBmcm9tICdjb2xvcnMvc2FmZSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IGVycm9yLCBwcmludCwgd2FybmluZyB9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQgeyBjZGtIb21lRGlyIH0gZnJvbSAnLi91dGlsL2RpcmVjdG9yaWVzJztcbmltcG9ydCB7IHZlcnNpb25OdW1iZXIgfSBmcm9tICcuL3ZlcnNpb24nO1xuXG5leHBvcnQgdHlwZSBJbnZva2VIb29rID0gKHRhcmdldERpcmVjdG9yeTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzICovIC8vIFBhY2thZ2VzIGRvbid0IGhhdmUgQHR5cGVzIG1vZHVsZVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbmNvbnN0IGNhbWVsQ2FzZSA9IHJlcXVpcmUoJ2NhbWVsY2FzZScpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbmNvbnN0IGRlY2FtZWxpemUgPSByZXF1aXJlKCdkZWNhbWVsaXplJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIENESyBwYWNrYWdlIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xpSW5pdCh0eXBlPzogc3RyaW5nLCBsYW5ndWFnZT86IHN0cmluZywgY2FuVXNlTmV0d29yayA9IHRydWUsIGdlbmVyYXRlT25seSA9IGZhbHNlLCB3b3JrRGlyID0gcHJvY2Vzcy5jd2QoKSkge1xuICBpZiAoIXR5cGUgJiYgIWxhbmd1YWdlKSB7XG4gICAgYXdhaXQgcHJpbnRBdmFpbGFibGVUZW1wbGF0ZXMoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0eXBlID0gdHlwZSB8fCAnZGVmYXVsdCc7IC8vIFwiZGVmYXVsdFwiIGlzIHRoZSBkZWZhdWx0IHR5cGUgKGFuZCBtYXBzIHRvIFwiYXBwXCIpXG5cbiAgY29uc3QgdGVtcGxhdGUgPSAoYXdhaXQgYXZhaWxhYmxlSW5pdFRlbXBsYXRlcygpKS5maW5kKHQgPT4gdC5oYXNOYW1lKHR5cGUhKSk7XG4gIGlmICghdGVtcGxhdGUpIHtcbiAgICBhd2FpdCBwcmludEF2YWlsYWJsZVRlbXBsYXRlcyhsYW5ndWFnZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGluaXQgdGVtcGxhdGU6ICR7dHlwZX1gKTtcbiAgfVxuICBpZiAoIWxhbmd1YWdlICYmIHRlbXBsYXRlLmxhbmd1YWdlcy5sZW5ndGggPT09IDEpIHtcbiAgICBsYW5ndWFnZSA9IHRlbXBsYXRlLmxhbmd1YWdlc1swXTtcbiAgICB3YXJuaW5nKGBObyAtLWxhbmd1YWdlIHdhcyBwcm92aWRlZCwgYnV0ICcke3R5cGV9JyBzdXBwb3J0cyBvbmx5ICcke2xhbmd1YWdlfScsIHNvIGRlZmF1bHRpbmcgdG8gLS1sYW5ndWFnZT0ke2xhbmd1YWdlfWApO1xuICB9XG4gIGlmICghbGFuZ3VhZ2UpIHtcbiAgICBwcmludChgQXZhaWxhYmxlIGxhbmd1YWdlcyBmb3IgJHtjb2xvcnMuZ3JlZW4odHlwZSl9OiAke3RlbXBsYXRlLmxhbmd1YWdlcy5tYXAobCA9PiBjb2xvcnMuYmx1ZShsKSkuam9pbignLCAnKX1gKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGxhbmd1YWdlIHdhcyBzZWxlY3RlZCcpO1xuICB9XG5cbiAgYXdhaXQgaW5pdGlhbGl6ZVByb2plY3QodGVtcGxhdGUsIGxhbmd1YWdlLCBjYW5Vc2VOZXR3b3JrLCBnZW5lcmF0ZU9ubHksIHdvcmtEaXIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIFB5dGhvbiBleGVjdXRhYmxlIGZvciB0aGlzIE9TXG4gKi9cbmZ1bmN0aW9uIHB5dGhvbkV4ZWN1dGFibGUoKSB7XG4gIGxldCBweXRob24gPSAncHl0aG9uMyc7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgcHl0aG9uID0gJ3B5dGhvbic7XG4gIH1cbiAgcmV0dXJuIHB5dGhvbjtcbn1cbmNvbnN0IElORk9fRE9UX0pTT04gPSAnaW5mby5qc29uJztcblxuZXhwb3J0IGNsYXNzIEluaXRUZW1wbGF0ZSB7XG4gIHB1YmxpYyBzdGF0aWMgYXN5bmMgZnJvbU5hbWUodGVtcGxhdGVzRGlyOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGJhc2VQYXRoID0gcGF0aC5qb2luKHRlbXBsYXRlc0RpciwgbmFtZSk7XG4gICAgY29uc3QgbGFuZ3VhZ2VzID0gKGF3YWl0IGxpc3REaXJlY3RvcnkoYmFzZVBhdGgpKS5maWx0ZXIoZiA9PiBmICE9PSBJTkZPX0RPVF9KU09OKTtcbiAgICBjb25zdCBpbmZvID0gYXdhaXQgZnMucmVhZEpzb24ocGF0aC5qb2luKGJhc2VQYXRoLCBJTkZPX0RPVF9KU09OKSk7XG4gICAgcmV0dXJuIG5ldyBJbml0VGVtcGxhdGUoYmFzZVBhdGgsIG5hbWUsIGxhbmd1YWdlcywgaW5mbyk7XG4gIH1cblxuICBwdWJsaWMgcmVhZG9ubHkgZGVzY3JpcHRpb246IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGFsaWFzZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGJhc2VQYXRoOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGFuZ3VhZ2VzOiBzdHJpbmdbXSxcbiAgICBpbmZvOiBhbnkpIHtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gaW5mby5kZXNjcmlwdGlvbjtcbiAgICBmb3IgKGNvbnN0IGFsaWFzIG9mIGluZm8uYWxpYXNlcyB8fCBbXSkge1xuICAgICAgdGhpcy5hbGlhc2VzLmFkZChhbGlhcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIHRoYXQgaXMgYmVpbmcgY2hlY2tlZFxuICAgKiBAcmV0dXJucyBgYHRydWVgYCBpZiBgYG5hbWVgYCBpcyB0aGUgbmFtZSBvZiB0aGlzIHRlbXBsYXRlIG9yIGFuIGFsaWFzIG9mIGl0LlxuICAgKi9cbiAgcHVibGljIGhhc05hbWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG5hbWUgPT09IHRoaXMubmFtZSB8fCB0aGlzLmFsaWFzZXMuaGFzKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhpcyBgYEluaXRUZW1wbGF0ZWBgIGZvciBhIGdpdmVuIGxhbmd1YWdlIHRvIGEgc3BlY2lmaWVkIGZvbGRlci5cbiAgICpcbiAgICogQHBhcmFtIGxhbmd1YWdlICAgIHRoZSBsYW5ndWFnZSB0byBpbnN0YW50aWF0ZSB0aGlzIHRlbXBsYXRlIHdpdGhcbiAgICogQHBhcmFtIHRhcmdldERpcmVjdG9yeSB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSB0ZW1wbGF0ZSBpcyB0byBiZSBpbnN0YW50aWF0ZWQgaW50b1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGluc3RhbGwobGFuZ3VhZ2U6IHN0cmluZywgdGFyZ2V0RGlyZWN0b3J5OiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5sYW5ndWFnZXMuaW5kZXhPZihsYW5ndWFnZSkgPT09IC0xKSB7XG4gICAgICBlcnJvcihgVGhlICR7Y29sb3JzLmJsdWUobGFuZ3VhZ2UpfSBsYW5ndWFnZSBpcyBub3Qgc3VwcG9ydGVkIGZvciAke2NvbG9ycy5ncmVlbih0aGlzLm5hbWUpfSBgXG4gICAgICAgICAgKyBgKGl0IHN1cHBvcnRzOiAke3RoaXMubGFuZ3VhZ2VzLm1hcChsID0+IGNvbG9ycy5ibHVlKGwpKS5qb2luKCcsICcpfSlgKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgbGFuZ3VhZ2U6ICR7bGFuZ3VhZ2V9YCk7XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZURpcmVjdG9yeSA9IHBhdGguam9pbih0aGlzLmJhc2VQYXRoLCBsYW5ndWFnZSk7XG4gICAgY29uc3QgaG9va1RlbXBEaXJlY3RvcnkgPSBwYXRoLmpvaW4odGFyZ2V0RGlyZWN0b3J5LCAndG1wJyk7XG4gICAgYXdhaXQgZnMubWtkaXIoaG9va1RlbXBEaXJlY3RvcnkpO1xuICAgIGF3YWl0IHRoaXMuaW5zdGFsbEZpbGVzKHNvdXJjZURpcmVjdG9yeSwgdGFyZ2V0RGlyZWN0b3J5LCB7XG4gICAgICBuYW1lOiBkZWNhbWVsaXplKHBhdGguYmFzZW5hbWUocGF0aC5yZXNvbHZlKHRhcmdldERpcmVjdG9yeSkpKSxcbiAgICB9KTtcbiAgICBhd2FpdCB0aGlzLmFwcGx5RnV0dXJlRmxhZ3ModGFyZ2V0RGlyZWN0b3J5KTtcbiAgICBhd2FpdCB0aGlzLmludm9rZUhvb2tzKGhvb2tUZW1wRGlyZWN0b3J5LCB0YXJnZXREaXJlY3RvcnkpO1xuICAgIGF3YWl0IGZzLnJlbW92ZShob29rVGVtcERpcmVjdG9yeSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluc3RhbGxGaWxlcyhzb3VyY2VEaXJlY3Rvcnk6IHN0cmluZywgdGFyZ2V0RGlyZWN0b3J5OiBzdHJpbmcsIHByb2plY3Q6IFByb2plY3RJbmZvKSB7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGF3YWl0IGZzLnJlYWRkaXIoc291cmNlRGlyZWN0b3J5KSkge1xuICAgICAgY29uc3QgZnJvbUZpbGUgPSBwYXRoLmpvaW4oc291cmNlRGlyZWN0b3J5LCBmaWxlKTtcbiAgICAgIGNvbnN0IHRvRmlsZSA9IHBhdGguam9pbih0YXJnZXREaXJlY3RvcnksIHRoaXMuZXhwYW5kKGZpbGUsIHByb2plY3QpKTtcbiAgICAgIGlmICgoYXdhaXQgZnMuc3RhdChmcm9tRmlsZSkpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgYXdhaXQgZnMubWtkaXIodG9GaWxlKTtcbiAgICAgICAgYXdhaXQgdGhpcy5pbnN0YWxsRmlsZXMoZnJvbUZpbGUsIHRvRmlsZSwgcHJvamVjdCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChmaWxlLm1hdGNoKC9eLipcXC50ZW1wbGF0ZVxcLlteLl0rJC8pKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5zdGFsbFByb2Nlc3NlZChmcm9tRmlsZSwgdG9GaWxlLnJlcGxhY2UoL1xcLnRlbXBsYXRlKFxcLlteLl0rKSQvLCAnJDEnKSwgcHJvamVjdCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChmaWxlLm1hdGNoKC9eLipcXC5ob29rXFwuKGQuKT9bXi5dKyQvKSkge1xuICAgICAgICBhd2FpdCB0aGlzLmluc3RhbGxQcm9jZXNzZWQoZnJvbUZpbGUsIHBhdGguam9pbih0YXJnZXREaXJlY3RvcnksICd0bXAnLCBmaWxlKSwgcHJvamVjdCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZnMuY29weShmcm9tRmlsZSwgdG9GaWxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgICBJbnZva2UgYW55IGphdmFzY3JpcHQgaG9va3MgdGhhdCBleGlzdCBpbiB0aGUgdGVtcGxhdGUuXG4gICAqIEBkZXNjcmlwdGlvbiBTb21ldGltZXMgdGVtcGxhdGVzIG5lZWQgbW9yZSBjb21wbGV4IGxvZ2ljIHRoYW4ganVzdCByZXBsYWNpbmcgdG9rZW5zLiBBICdob29rJyBpc1xuICAgKiAgICAgICAgYW55IGZpbGUgdGhhdCBlbmRzIGluIC5ob29rLmpzLiBJdCBzaG91bGQgZXhwb3J0IGEgc2luZ2xlIGZ1bmN0aW9uIGNhbGxlZCBcImludm9rZVwiXG4gICAqICAgICAgICB0aGF0IGFjY2VwdHMgYSBzaW5nbGUgc3RyaW5nIHBhcmFtZXRlci4gV2hlbiB0aGUgdGVtcGxhdGUgaXMgaW5zdGFsbGVkLCBlYWNoIGhvb2tcbiAgICogICAgICAgIHdpbGwgYmUgaW52b2tlZCwgcGFzc2luZyB0aGUgdGFyZ2V0IGRpcmVjdG9yeSBhcyB0aGUgb25seSBhcmd1bWVudC4gSG9va3MgYXJlIGludm9rZWRcbiAgICogICAgICAgIGluIGxleGljYWwgb3JkZXIuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGludm9rZUhvb2tzKHNvdXJjZURpcmVjdG9yeTogc3RyaW5nLCB0YXJnZXREaXJlY3Rvcnk6IHN0cmluZykge1xuICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgZnMucmVhZGRpcihzb3VyY2VEaXJlY3RvcnkpO1xuICAgIGZpbGVzLnNvcnQoKTsgLy8gU29ydGluZyBhbGxvd3MgdGVtcGxhdGUgYXV0aG9ycyB0byBjb250cm9sIHRoZSBvcmRlciBpbiB3aGljaCBob29rcyBhcmUgaW52b2tlZC5cblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKGZpbGUubWF0Y2goL14uKlxcLmhvb2tcXC5qcyQvKSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICBjb25zdCBpbnZva2U6IEludm9rZUhvb2sgPSByZXF1aXJlKHBhdGguam9pbihzb3VyY2VEaXJlY3RvcnksIGZpbGUpKS5pbnZva2U7XG4gICAgICAgIGF3YWl0IGludm9rZSh0YXJnZXREaXJlY3RvcnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5zdGFsbFByb2Nlc3NlZCh0ZW1wbGF0ZVBhdGg6IHN0cmluZywgdG9GaWxlOiBzdHJpbmcsIHByb2plY3Q6IFByb2plY3RJbmZvKSB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBhd2FpdCBmcy5yZWFkRmlsZSh0ZW1wbGF0ZVBhdGgsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHRvRmlsZSwgdGhpcy5leHBhbmQodGVtcGxhdGUsIHByb2plY3QpKTtcbiAgfVxuXG4gIHByaXZhdGUgZXhwYW5kKHRlbXBsYXRlOiBzdHJpbmcsIHByb2plY3Q6IFByb2plY3RJbmZvKSB7XG4gICAgY29uc3QgTUFUQ0hfVkVSX0JVSUxEID0gL1xcK1thLWYwLTldKyQvOyAvLyBNYXRjaGVzIFwiK0JVSUxEXCIgaW4gXCJ4Lnkuei1iZXRhK0JVSUxEXCJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgIGNvbnN0IGNka1ZlcnNpb24gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uLnJlcGxhY2UoTUFUQ0hfVkVSX0JVSUxELCAnJyk7XG4gICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoLyVuYW1lJS9nLCBwcm9qZWN0Lm5hbWUpXG4gICAgICAucmVwbGFjZSgvJW5hbWVcXC5jYW1lbENhc2VkJS9nLCBjYW1lbENhc2UocHJvamVjdC5uYW1lKSlcbiAgICAgIC5yZXBsYWNlKC8lbmFtZVxcLlBhc2NhbENhc2VkJS9nLCBjYW1lbENhc2UocHJvamVjdC5uYW1lLCB7IHBhc2NhbENhc2U6IHRydWUgfSkpXG4gICAgICAucmVwbGFjZSgvJWNkay12ZXJzaW9uJS9nLCBjZGtWZXJzaW9uKVxuICAgICAgLnJlcGxhY2UoLyVjZGstaG9tZSUvZywgY2RrSG9tZURpcigpKVxuICAgICAgLnJlcGxhY2UoLyVuYW1lXFwuUHl0aG9uTW9kdWxlJS9nLCBwcm9qZWN0Lm5hbWUucmVwbGFjZSgvLS9nLCAnXycpKVxuICAgICAgLnJlcGxhY2UoLyVweXRob24tZXhlY3V0YWJsZSUvZywgcHl0aG9uRXhlY3V0YWJsZSgpKVxuICAgICAgLnJlcGxhY2UoLyVuYW1lXFwuU3RhY2tOYW1lJS9nLCBwcm9qZWN0Lm5hbWUucmVwbGFjZSgvW15BLVphLXowLTktXS9nLCAnLScpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGNvbnRleHQgdmFyaWFibGVzIHRvIGBjZGsuanNvbmAgaW4gdGhlIGdlbmVyYXRlZCBwcm9qZWN0IGRpcmVjdG9yeSB0b1xuICAgKiBlbmFibGUgZnV0dXJlIGJlaGF2aW9yIGZvciBuZXcgcHJvamVjdHMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGFwcGx5RnV0dXJlRmxhZ3MocHJvamVjdERpcjogc3RyaW5nKSB7XG4gICAgY29uc3QgY2RrSnNvbiA9IHBhdGguam9pbihwcm9qZWN0RGlyLCAnY2RrLmpzb24nKTtcbiAgICBpZiAoIWF3YWl0IGZzLnBhdGhFeGlzdHMoY2RrSnNvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBmcy5yZWFkSnNvbihjZGtKc29uKTtcbiAgICBjb25maWcuY29udGV4dCA9IHtcbiAgICAgIC4uLmNvbmZpZy5jb250ZXh0LFxuICAgICAgLi4uY3hhcGkuRlVUVVJFX0ZMQUdTLFxuICAgIH07XG5cbiAgICBhd2FpdCBmcy53cml0ZUpzb24oY2RrSnNvbiwgY29uZmlnLCB7IHNwYWNlczogMiB9KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgUHJvamVjdEluZm8ge1xuICAvKiogVGhlIHZhbHVlIHVzZWQgZm9yICVuYW1lJSAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIHZlcnNpb25lZFRlbXBsYXRlc0RpcigpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgbGV0IGN1cnJlbnRWZXJzaW9uID0gdmVyc2lvbk51bWJlcigpO1xuICAgIC8vIElmIHRoZSBDTEkgaXMgaW52b2tlZCBmcm9tIHNvdXJjZSAoaS5lLiwgZGV2ZWxvcGVtZW50KSwgcmF0aGVyIHRoYW4gZnJvbSBhIHBhY2thZ2VkIGRpc3RyaWJ1dGlvbixcbiAgICAvLyB0aGUgdmVyc2lvbiBudW1iZXIgd2lsbCBiZSAnMC4wLjAnLiBXZSB3aWxsIChjdXJyZW50bHkpIGRlZmF1bHQgdG8gdGhlIHYxIHRlbXBsYXRlcyBpbiB0aGlzIGNhc2UuXG4gICAgaWYgKGN1cnJlbnRWZXJzaW9uID09PSAnMC4wLjAnKSB7XG4gICAgICBjdXJyZW50VmVyc2lvbiA9ICcxLjAuMCc7XG4gICAgfVxuICAgIGNvbnN0IG1ham9yVmVyc2lvbiA9IHNlbXZlci5tYWpvcihjdXJyZW50VmVyc2lvbik7XG4gICAgcmVzb2x2ZShwYXRoLmpvaW4oX19kaXJuYW1lLCAnaW5pdC10ZW1wbGF0ZXMnLCBgdiR7bWFqb3JWZXJzaW9ufWApKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdmFpbGFibGVJbml0VGVtcGxhdGVzKCk6IFByb21pc2U8SW5pdFRlbXBsYXRlW10+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IHRlbXBsYXRlc0RpciA9IGF3YWl0IHZlcnNpb25lZFRlbXBsYXRlc0RpcigpO1xuICAgIGNvbnN0IHRlbXBsYXRlTmFtZXMgPSBhd2FpdCBsaXN0RGlyZWN0b3J5KHRlbXBsYXRlc0Rpcik7XG4gICAgY29uc3QgdGVtcGxhdGVzID0gbmV3IEFycmF5PEluaXRUZW1wbGF0ZT4oKTtcbiAgICBmb3IgKGNvbnN0IHRlbXBsYXRlTmFtZSBvZiB0ZW1wbGF0ZU5hbWVzKSB7XG4gICAgICB0ZW1wbGF0ZXMucHVzaChhd2FpdCBJbml0VGVtcGxhdGUuZnJvbU5hbWUodGVtcGxhdGVzRGlyLCB0ZW1wbGF0ZU5hbWUpKTtcbiAgICB9XG4gICAgcmVzb2x2ZSh0ZW1wbGF0ZXMpO1xuICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdmFpbGFibGVJbml0TGFuZ3VhZ2VzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IHRlbXBsYXRlcyA9IGF3YWl0IGF2YWlsYWJsZUluaXRUZW1wbGF0ZXMoKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIG9mIHRlbXBsYXRlcykge1xuICAgICAgZm9yIChjb25zdCBsYW5ndWFnZSBvZiB0ZW1wbGF0ZS5sYW5ndWFnZXMpIHtcbiAgICAgICAgcmVzdWx0LmFkZChsYW5ndWFnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc29sdmUoWy4uLnJlc3VsdF0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gZGlyUGF0aCBpcyB0aGUgZGlyZWN0b3J5IHRvIGJlIGxpc3RlZC5cbiAqIEByZXR1cm5zIHRoZSBsaXN0IG9mIGZpbGUgb3IgZGlyZWN0b3J5IG5hbWVzIGNvbnRhaW5lZCBpbiBgYGRpclBhdGhgYCwgZXhjbHVkaW5nIGFueSBkb3QtZmlsZSwgYW5kIHNvcnRlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gbGlzdERpcmVjdG9yeShkaXJQYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChhd2FpdCBmcy5yZWFkZGlyKGRpclBhdGgpKVxuICAgIC5maWx0ZXIocCA9PiAhcC5zdGFydHNXaXRoKCcuJykpXG4gICAgLnNvcnQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50QXZhaWxhYmxlVGVtcGxhdGVzKGxhbmd1YWdlPzogc3RyaW5nKSB7XG4gIHByaW50KCdBdmFpbGFibGUgdGVtcGxhdGVzOicpO1xuICBmb3IgKGNvbnN0IHRlbXBsYXRlIG9mIGF3YWl0IGF2YWlsYWJsZUluaXRUZW1wbGF0ZXMoKSkge1xuICAgIGlmIChsYW5ndWFnZSAmJiB0ZW1wbGF0ZS5sYW5ndWFnZXMuaW5kZXhPZihsYW5ndWFnZSkgPT09IC0xKSB7IGNvbnRpbnVlOyB9XG4gICAgcHJpbnQoYCogJHtjb2xvcnMuZ3JlZW4odGVtcGxhdGUubmFtZSl9OiAke3RlbXBsYXRlLmRlc2NyaXB0aW9ufWApO1xuICAgIGNvbnN0IGxhbmd1YWdlQXJnID0gbGFuZ3VhZ2UgPyBjb2xvcnMuYm9sZChsYW5ndWFnZSlcbiAgICAgIDogdGVtcGxhdGUubGFuZ3VhZ2VzLmxlbmd0aCA+IDEgPyBgWyR7dGVtcGxhdGUubGFuZ3VhZ2VzLm1hcCh0ID0+IGNvbG9ycy5ib2xkKHQpKS5qb2luKCd8Jyl9XWBcbiAgICAgICAgOiBjb2xvcnMuYm9sZCh0ZW1wbGF0ZS5sYW5ndWFnZXNbMF0pO1xuICAgIHByaW50KGAgICDilJTilIAgJHtjb2xvcnMuYmx1ZShgY2RrIGluaXQgJHtjb2xvcnMuYm9sZCh0ZW1wbGF0ZS5uYW1lKX0gLS1sYW5ndWFnZT0ke2xhbmd1YWdlQXJnfWApfWApO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVQcm9qZWN0KHRlbXBsYXRlOiBJbml0VGVtcGxhdGUsIGxhbmd1YWdlOiBzdHJpbmcsIGNhblVzZU5ldHdvcms6IGJvb2xlYW4sIGdlbmVyYXRlT25seTogYm9vbGVhbiwgd29ya0Rpcjogc3RyaW5nKSB7XG4gIGF3YWl0IGFzc2VydElzRW1wdHlEaXJlY3Rvcnkod29ya0Rpcik7XG4gIHByaW50KGBBcHBseWluZyBwcm9qZWN0IHRlbXBsYXRlICR7Y29sb3JzLmdyZWVuKHRlbXBsYXRlLm5hbWUpfSBmb3IgJHtjb2xvcnMuYmx1ZShsYW5ndWFnZSl9YCk7XG4gIGF3YWl0IHRlbXBsYXRlLmluc3RhbGwobGFuZ3VhZ2UsIHdvcmtEaXIpO1xuICBpZiAoYXdhaXQgZnMucGF0aEV4aXN0cygnUkVBRE1FLm1kJykpIHtcbiAgICBwcmludChjb2xvcnMuZ3JlZW4oYXdhaXQgZnMucmVhZEZpbGUoJ1JFQURNRS5tZCcsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSkpKTtcbiAgfVxuXG4gIGlmICghZ2VuZXJhdGVPbmx5KSB7XG4gICAgYXdhaXQgaW5pdGlhbGl6ZUdpdFJlcG9zaXRvcnkod29ya0Rpcik7XG4gICAgYXdhaXQgcG9zdEluc3RhbGwobGFuZ3VhZ2UsIGNhblVzZU5ldHdvcmssIHdvcmtEaXIpO1xuICB9XG5cbiAgcHJpbnQoJ+KchSBBbGwgZG9uZSEnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0SXNFbXB0eURpcmVjdG9yeSh3b3JrRGlyOiBzdHJpbmcpIHtcbiAgY29uc3QgZmlsZXMgPSBhd2FpdCBmcy5yZWFkZGlyKHdvcmtEaXIpO1xuICBpZiAoZmlsZXMuZmlsdGVyKGYgPT4gIWYuc3RhcnRzV2l0aCgnLicpKS5sZW5ndGggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BjZGsgaW5pdGAgY2Fubm90IGJlIHJ1biBpbiBhIG5vbi1lbXB0eSBkaXJlY3RvcnkhJyk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUdpdFJlcG9zaXRvcnkod29ya0Rpcjogc3RyaW5nKSB7XG4gIGlmIChhd2FpdCBpc0luR2l0UmVwb3NpdG9yeSh3b3JrRGlyKSkgeyByZXR1cm47IH1cbiAgcHJpbnQoJ0luaXRpYWxpemluZyBhIG5ldyBnaXQgcmVwb3NpdG9yeS4uLicpO1xuICB0cnkge1xuICAgIGF3YWl0IGV4ZWN1dGUoJ2dpdCcsIFsnaW5pdCddLCB7IGN3ZDogd29ya0RpciB9KTtcbiAgICBhd2FpdCBleGVjdXRlKCdnaXQnLCBbJ2FkZCcsICcuJ10sIHsgY3dkOiB3b3JrRGlyIH0pO1xuICAgIGF3YWl0IGV4ZWN1dGUoJ2dpdCcsIFsnY29tbWl0JywgJy0tbWVzc2FnZT1cIkluaXRpYWwgY29tbWl0XCInLCAnLS1uby1ncGctc2lnbiddLCB7IGN3ZDogd29ya0RpciB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHdhcm5pbmcoJ1VuYWJsZSB0byBpbml0aWFsaXplIGdpdCByZXBvc2l0b3J5IGZvciB5b3VyIHByb2plY3QuJyk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcG9zdEluc3RhbGwobGFuZ3VhZ2U6IHN0cmluZywgY2FuVXNlTmV0d29yazogYm9vbGVhbiwgd29ya0Rpcjogc3RyaW5nKSB7XG4gIHN3aXRjaCAobGFuZ3VhZ2UpIHtcbiAgICBjYXNlICdqYXZhc2NyaXB0JzpcbiAgICAgIHJldHVybiBwb3N0SW5zdGFsbEphdmFzY3JpcHQoY2FuVXNlTmV0d29yaywgd29ya0Rpcik7XG4gICAgY2FzZSAndHlwZXNjcmlwdCc6XG4gICAgICByZXR1cm4gcG9zdEluc3RhbGxUeXBlc2NyaXB0KGNhblVzZU5ldHdvcmssIHdvcmtEaXIpO1xuICAgIGNhc2UgJ2phdmEnOlxuICAgICAgcmV0dXJuIHBvc3RJbnN0YWxsSmF2YShjYW5Vc2VOZXR3b3JrLCB3b3JrRGlyKTtcbiAgICBjYXNlICdweXRob24nOlxuICAgICAgcmV0dXJuIHBvc3RJbnN0YWxsUHl0aG9uKHdvcmtEaXIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RJbnN0YWxsSmF2YXNjcmlwdChjYW5Vc2VOZXR3b3JrOiBib29sZWFuLCBjd2Q6IHN0cmluZykge1xuICByZXR1cm4gcG9zdEluc3RhbGxUeXBlc2NyaXB0KGNhblVzZU5ldHdvcmssIGN3ZCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RJbnN0YWxsVHlwZXNjcmlwdChjYW5Vc2VOZXR3b3JrOiBib29sZWFuLCBjd2Q6IHN0cmluZykge1xuICBjb25zdCBjb21tYW5kID0gJ25wbSc7XG5cbiAgaWYgKCFjYW5Vc2VOZXR3b3JrKSB7XG4gICAgd2FybmluZyhgUGxlYXNlIHJ1biAnJHtjb21tYW5kfSBpbnN0YWxsJyFgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBwcmludChgRXhlY3V0aW5nICR7Y29sb3JzLmdyZWVuKGAke2NvbW1hbmR9IGluc3RhbGxgKX0uLi5gKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjdXRlKGNvbW1hbmQsIFsnaW5zdGFsbCddLCB7IGN3ZCB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHdhcm5pbmcoYCR7Y29tbWFuZH0gaW5zdGFsbCBmYWlsZWQ6IGAgKyBlLm1lc3NhZ2UpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RJbnN0YWxsSmF2YShjYW5Vc2VOZXR3b3JrOiBib29sZWFuLCBjd2Q6IHN0cmluZykge1xuICBjb25zdCBtdm5QYWNrYWdlV2FybmluZyA9ICdQbGVhc2UgcnVuIFxcJ212biBwYWNrYWdlXFwnISc7XG4gIGlmICghY2FuVXNlTmV0d29yaykge1xuICAgIHdhcm5pbmcobXZuUGFja2FnZVdhcm5pbmcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHByaW50KCdFeGVjdXRpbmcgXFwnbXZuIHBhY2thZ2VcXCcnKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjdXRlKCdtdm4nLCBbJ3BhY2thZ2UnXSwgeyBjd2QgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB3YXJuaW5nKCdVbmFibGUgdG8gcGFja2FnZSBjb21waWxlZCBjb2RlIGFzIEpBUicpO1xuICAgIHdhcm5pbmcobXZuUGFja2FnZVdhcm5pbmcpO1xuICB9XG5cbn1cblxuYXN5bmMgZnVuY3Rpb24gcG9zdEluc3RhbGxQeXRob24oY3dkOiBzdHJpbmcpIHtcbiAgY29uc3QgcHl0aG9uID0gcHl0aG9uRXhlY3V0YWJsZSgpO1xuICB3YXJuaW5nKGBQbGVhc2UgcnVuICcke3B5dGhvbn0gLW0gdmVudiAudmVudichYCk7XG4gIHByaW50KGBFeGVjdXRpbmcgJHtjb2xvcnMuZ3JlZW4oJ0NyZWF0aW5nIHZpcnR1YWxlbnYuLi4nKX1gKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjdXRlKHB5dGhvbiwgWyctbSB2ZW52JywgJy52ZW52J10sIHsgY3dkIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgd2FybmluZygnVW5hYmxlIHRvIGNyZWF0ZSB2aXJ0dWFsZW52IGF1dG9tYXRpY2FsbHknKTtcbiAgICB3YXJuaW5nKGBQbGVhc2UgcnVuICcke3B5dGhvbn0gLW0gdmVudiAudmVudichYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gZGlyIGEgZGlyZWN0b3J5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIHRydWUgaWYgYGBkaXJgYCBpcyB3aXRoaW4gYSBnaXQgcmVwb3NpdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNJbkdpdFJlcG9zaXRvcnkoZGlyOiBzdHJpbmcpIHtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoYXdhaXQgZnMucGF0aEV4aXN0cyhwYXRoLmpvaW4oZGlyLCAnLmdpdCcpKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmIChpc1Jvb3QoZGlyKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBkaXIgPSBwYXRoLmRpcm5hbWUoZGlyKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSBkaXIgYSBkaXJlY3RvcnkgdG8gYmUgY2hlY2tlZC5cbiAqIEByZXR1cm5zIHRydWUgaWYgYGBkaXJgYCBpcyB0aGUgcm9vdCBvZiBhIGZpbGVzeXN0ZW0uXG4gKi9cbmZ1bmN0aW9uIGlzUm9vdChkaXI6IHN0cmluZykge1xuICByZXR1cm4gcGF0aC5kaXJuYW1lKGRpcikgPT09IGRpcjtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBgY29tbWFuZGAuIFNUREVSUiBpcyBlbWl0dGVkIGluIHJlYWwtdGltZS5cbiAqXG4gKiBJZiBjb21tYW5kIGV4aXRzIHdpdGggbm9uLXplcm8gZXhpdCBjb2RlLCBhbiBleGNlcHJpb24gaXMgdGhyb3duIGFuZCBpbmNsdWRlc1xuICogdGhlIGNvbnRlbnRzIG9mIFNURE9VVC5cbiAqXG4gKiBAcmV0dXJucyBTVERPVVQgKGlmIHN1Y2Nlc3NmdWwpLlxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlKGNtZDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSwgeyBjd2QgfTogeyBjd2Q6IHN0cmluZyB9KSB7XG4gIGNvbnN0IGNoaWxkID0gY2hpbGRQcm9jZXNzLnNwYXduKGNtZCwgYXJncywgeyBjd2QsIHNoZWxsOiB0cnVlLCBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdpbmhlcml0J10gfSk7XG4gIGxldCBzdGRvdXQgPSAnJztcbiAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgY2h1bmsgPT4gc3Rkb3V0ICs9IGNodW5rLnRvU3RyaW5nKCkpO1xuICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigob2ssIGZhaWwpID0+IHtcbiAgICBjaGlsZC5vbmNlKCdlcnJvcicsIGVyciA9PiBmYWlsKGVycikpO1xuICAgIGNoaWxkLm9uY2UoJ2V4aXQnLCBzdGF0dXMgPT4ge1xuICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2soc3Rkb3V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHN0ZG91dCk7XG4gICAgICAgIHJldHVybiBmYWlsKG5ldyBFcnJvcihgJHtjbWR9IGV4aXRlZCB3aXRoIHN0YXR1cyAke3N0YXR1c31gKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuIl19