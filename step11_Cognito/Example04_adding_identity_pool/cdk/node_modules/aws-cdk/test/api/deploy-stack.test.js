"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../../lib");
const util_1 = require("../util");
const mock_sdk_1 = require("../util/mock-sdk");
const FAKE_STACK = util_1.testStack({
    stackName: 'withouterrors',
});
const FAKE_STACK_WITH_PARAMETERS = util_1.testStack({
    stackName: 'withparameters',
    template: {
        Parameters: {
            HasValue: { Type: 'String' },
            HasDefault: { Type: 'String', Default: 'TheDefault' },
            OtherParameter: { Type: 'String' },
        },
    },
});
const FAKE_STACK_TERMINATION_PROTECTION = util_1.testStack({
    stackName: 'termination-protection',
    template: util_1.DEFAULT_FAKE_TEMPLATE,
    terminationProtection: true,
});
let sdk;
let sdkProvider;
let cfnMocks;
beforeEach(() => {
    sdkProvider = new mock_sdk_1.MockSdkProvider();
    sdk = new mock_sdk_1.MockSdk();
    cfnMocks = {
        describeStackEvents: jest.fn().mockReturnValue({}),
        describeStacks: jest.fn()
            // First call, no stacks exist
            .mockImplementationOnce(() => ({ Stacks: [] }))
            // Second call, stack has been created
            .mockImplementationOnce(() => ({
            Stacks: [
                {
                    StackStatus: 'CREATE_COMPLETE',
                    StackStatusReason: 'It is magic',
                    EnableTerminationProtection: false,
                },
            ],
        })),
        createChangeSet: jest.fn((_o) => ({})),
        deleteChangeSet: jest.fn((_o) => ({})),
        describeChangeSet: jest.fn((_o) => ({
            Status: 'CREATE_COMPLETE',
            Changes: [],
        })),
        executeChangeSet: jest.fn((_o) => ({})),
        deleteStack: jest.fn((_o) => ({})),
        getTemplate: jest.fn((_o) => ({ TemplateBody: JSON.stringify(util_1.DEFAULT_FAKE_TEMPLATE) })),
        updateTerminationProtection: jest.fn((_o) => ({ StackId: 'stack-id' })),
    };
    sdk.stubCloudFormation(cfnMocks);
});
test('do deploy executable change set with 0 changes', async () => {
    // WHEN
    const ret = await lib_1.deployStack({
        stack: FAKE_STACK,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        sdk,
        sdkProvider,
    });
    // THEN
    expect(ret.noOp).toBeFalsy();
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
});
test('correctly passes CFN parameters, ignoring ones with empty values', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {
            A: 'A-value',
            B: 'B=value',
            C: undefined,
            D: '',
        },
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        Parameters: [
            { ParameterKey: 'A', ParameterValue: 'A-value' },
            { ParameterKey: 'B', ParameterValue: 'B=value' },
        ],
    }));
});
test('reuse previous parameters if requested', async () => {
    // GIVEN
    givenStackExists({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'TheValue' },
            { ParameterKey: 'HasDefault', ParameterValue: 'TheOldValue' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK_WITH_PARAMETERS,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {
            OtherParameter: 'SomeValue',
        },
        usePreviousParameters: true,
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        Parameters: [
            { ParameterKey: 'HasValue', UsePreviousValue: true },
            { ParameterKey: 'HasDefault', UsePreviousValue: true },
            { ParameterKey: 'OtherParameter', ParameterValue: 'SomeValue' },
        ],
    }));
});
test('do not reuse previous parameters if not requested', async () => {
    // GIVEN
    givenStackExists({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'TheValue' },
            { ParameterKey: 'HasDefault', ParameterValue: 'TheOldValue' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK_WITH_PARAMETERS,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {
            HasValue: 'SomeValue',
            OtherParameter: 'SomeValue',
        },
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'SomeValue' },
            { ParameterKey: 'OtherParameter', ParameterValue: 'SomeValue' },
        ],
    }));
});
test('throw exception if not enough parameters supplied', async () => {
    // GIVEN
    givenStackExists({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'TheValue' },
            { ParameterKey: 'HasDefault', ParameterValue: 'TheOldValue' },
        ],
    });
    // WHEN
    await expect(lib_1.deployStack({
        stack: FAKE_STACK_WITH_PARAMETERS,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {
            OtherParameter: 'SomeValue',
        },
    })).rejects.toThrow(/CloudFormation Parameters are missing a value/);
});
test('deploy is skipped if template did not change', async () => {
    // GIVEN
    givenStackExists();
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.executeChangeSet).not.toBeCalled();
});
test('deploy is skipped if parameters are the same', async () => {
    // GIVEN
    givenTemplateIs(FAKE_STACK_WITH_PARAMETERS.template);
    givenStackExists({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'HasValue' },
            { ParameterKey: 'HasDefault', ParameterValue: 'HasDefault' },
            { ParameterKey: 'OtherParameter', ParameterValue: 'OtherParameter' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK_WITH_PARAMETERS,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {},
        usePreviousParameters: true,
    });
    // THEN
    expect(cfnMocks.createChangeSet).not.toHaveBeenCalled();
});
test('deploy is not skipped if parameters are different', async () => {
    // GIVEN
    givenTemplateIs(FAKE_STACK_WITH_PARAMETERS.template);
    givenStackExists({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'HasValue' },
            { ParameterKey: 'HasDefault', ParameterValue: 'HasDefault' },
            { ParameterKey: 'OtherParameter', ParameterValue: 'OtherParameter' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK_WITH_PARAMETERS,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        parameters: {
            HasValue: 'NewValue',
        },
        usePreviousParameters: true,
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        Parameters: [
            { ParameterKey: 'HasValue', ParameterValue: 'NewValue' },
            { ParameterKey: 'HasDefault', UsePreviousValue: true },
            { ParameterKey: 'OtherParameter', UsePreviousValue: true },
        ],
    }));
});
test('if existing stack failed to create, it is deleted and recreated', async () => {
    // GIVEN
    givenStackExists({ StackStatus: 'ROLLBACK_COMPLETE' }, // This is for the initial check
    { StackStatus: 'DELETE_COMPLETE' }, // Poll the successful deletion
    { StackStatus: 'CREATE_COMPLETE' });
    givenTemplateIs({
        DifferentThan: 'TheDefault',
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.deleteStack).toHaveBeenCalled();
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        ChangeSetType: 'CREATE',
    }));
});
test('if existing stack failed to create, it is deleted and recreated even if the template did not change', async () => {
    // GIVEN
    givenStackExists({ StackStatus: 'ROLLBACK_COMPLETE' }, // This is for the initial check
    { StackStatus: 'DELETE_COMPLETE' }, // Poll the successful deletion
    { StackStatus: 'CREATE_COMPLETE' });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.deleteStack).toHaveBeenCalled();
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        ChangeSetType: 'CREATE',
    }));
});
test('deploy not skipped if template did not change and --force is applied', async () => {
    // GIVEN
    givenStackExists();
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        force: true,
    });
    // THEN
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
});
test('deploy is skipped if template and tags did not change', async () => {
    // GIVEN
    givenStackExists({
        Tags: [
            { Key: 'Key1', Value: 'Value1' },
            { Key: 'Key2', Value: 'Value2' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        tags: [
            { Key: 'Key1', Value: 'Value1' },
            { Key: 'Key2', Value: 'Value2' },
        ],
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.createChangeSet).not.toBeCalled();
    expect(cfnMocks.executeChangeSet).not.toBeCalled();
    expect(cfnMocks.describeStacks).toHaveBeenCalledWith({ StackName: 'withouterrors' });
    expect(cfnMocks.getTemplate).toHaveBeenCalledWith({ StackName: 'withouterrors', TemplateStage: 'Original' });
});
test('deploy not skipped if template did not change but tags changed', async () => {
    // GIVEN
    givenStackExists({
        Tags: [
            { Key: 'Key', Value: 'Value' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        tags: [
            {
                Key: 'Key',
                Value: 'NewValue',
            },
        ],
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalled();
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
    expect(cfnMocks.describeChangeSet).toHaveBeenCalled();
    expect(cfnMocks.describeStacks).toHaveBeenCalledWith({ StackName: 'withouterrors' });
    expect(cfnMocks.getTemplate).toHaveBeenCalledWith({ StackName: 'withouterrors', TemplateStage: 'Original' });
});
test('deployStack reports no change if describeChangeSet returns specific error', async () => {
    var _a;
    (_a = cfnMocks.describeChangeSet) === null || _a === void 0 ? void 0 : _a.mockImplementation(() => ({
        Status: 'FAILED',
        StatusReason: 'No updates are to be performed.',
    }));
    // WHEN
    const deployResult = await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(deployResult.noOp).toEqual(true);
});
test('deploy not skipped if template did not change but one tag removed', async () => {
    // GIVEN
    givenStackExists({
        Tags: [
            { Key: 'Key1', Value: 'Value1' },
            { Key: 'Key2', Value: 'Value2' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        tags: [
            { Key: 'Key1', Value: 'Value1' },
        ],
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalled();
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
    expect(cfnMocks.describeChangeSet).toHaveBeenCalled();
    expect(cfnMocks.describeStacks).toHaveBeenCalledWith({ StackName: 'withouterrors' });
    expect(cfnMocks.getTemplate).toHaveBeenCalledWith({ StackName: 'withouterrors', TemplateStage: 'Original' });
});
test('deploy is not skipped if stack is in a _FAILED state', async () => {
    // GIVEN
    givenStackExists({
        StackStatus: 'DELETE_FAILED',
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
        usePreviousParameters: true,
    }).catch(() => { });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalled();
});
test('existing stack in UPDATE_ROLLBACK_COMPLETE state can be updated', async () => {
    // GIVEN
    givenStackExists({ StackStatus: 'UPDATE_ROLLBACK_COMPLETE' }, // This is for the initial check
    { StackStatus: 'UPDATE_COMPLETE' });
    givenTemplateIs({ changed: 123 });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.deleteStack).not.toHaveBeenCalled();
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        ChangeSetType: 'UPDATE',
    }));
});
test('deploy not skipped if template changed', async () => {
    // GIVEN
    givenStackExists();
    givenTemplateIs({ changed: 123 });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
});
test('not executed and no error if --no-execute is given', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        execute: false,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.executeChangeSet).not.toHaveBeenCalled();
});
test('use S3 url for stack deployment if present in Stack Artifact', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: util_1.testStack({
            stackName: 'withouterrors',
            properties: {
                stackTemplateAssetObjectUrl: 'https://use-me-use-me/',
            },
        }),
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        TemplateURL: 'https://use-me-use-me/',
    }));
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
});
test('use REST API S3 url with substituted placeholders if manifest url starts with s3://', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: util_1.testStack({
            stackName: 'withouterrors',
            properties: {
                stackTemplateAssetObjectUrl: 's3://use-me-use-me-${AWS::AccountId}/object',
            },
        }),
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        TemplateURL: 'https://s3.bermuda-triangle-1337.amazonaws.com/use-me-use-me-123456789/object',
    }));
    expect(cfnMocks.executeChangeSet).toHaveBeenCalled();
});
test('changeset is created when stack exists in REVIEW_IN_PROGRESS status', async () => {
    // GIVEN
    givenStackExists({
        StackStatus: 'REVIEW_IN_PROGRESS',
        Tags: [
            { Key: 'Key1', Value: 'Value1' },
            { Key: 'Key2', Value: 'Value2' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        execute: false,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        ChangeSetType: 'CREATE',
        StackName: 'withouterrors',
    }));
    expect(cfnMocks.executeChangeSet).not.toHaveBeenCalled();
});
test('changeset is updated when stack exists in CREATE_COMPLETE status', async () => {
    // GIVEN
    givenStackExists({
        Tags: [
            { Key: 'Key1', Value: 'Value1' },
            { Key: 'Key2', Value: 'Value2' },
        ],
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        execute: false,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.createChangeSet).toHaveBeenCalledWith(expect.objectContaining({
        ChangeSetType: 'UPDATE',
        StackName: 'withouterrors',
    }));
    expect(cfnMocks.executeChangeSet).not.toHaveBeenCalled();
});
test('deploy with termination protection enabled', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK_TERMINATION_PROTECTION,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.updateTerminationProtection).toHaveBeenCalledWith(expect.objectContaining({
        EnableTerminationProtection: true,
    }));
});
test('updateTerminationProtection not called when termination protection is undefined', async () => {
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.updateTerminationProtection).not.toHaveBeenCalled();
});
test('updateTerminationProtection called when termination protection is undefined and stack has termination protection', async () => {
    // GIVEN
    givenStackExists({
        EnableTerminationProtection: true,
    });
    // WHEN
    await lib_1.deployStack({
        stack: FAKE_STACK,
        sdk,
        sdkProvider,
        resolvedEnvironment: mock_sdk_1.mockResolvedEnvironment(),
    });
    // THEN
    expect(cfnMocks.updateTerminationProtection).toHaveBeenCalledWith(expect.objectContaining({
        EnableTerminationProtection: false,
    }));
});
/**
 * Set up the mocks so that it looks like the stack exists to start with
 *
 * The last element of this array will be continuously repeated.
 */
function givenStackExists(...overrides) {
    cfnMocks.describeStacks.mockReset();
    if (overrides.length === 0) {
        overrides = [{}];
    }
    const baseResponse = {
        StackName: 'mock-stack-name',
        StackId: 'mock-stack-id',
        CreationTime: new Date(),
        StackStatus: 'CREATE_COMPLETE',
        EnableTerminationProtection: false,
    };
    for (const override of overrides.slice(0, overrides.length - 1)) {
        cfnMocks.describeStacks.mockImplementationOnce(() => ({
            Stacks: [{ ...baseResponse, ...override }],
        }));
    }
    cfnMocks.describeStacks.mockImplementation(() => ({
        Stacks: [{ ...baseResponse, ...overrides[overrides.length - 1] }],
    }));
}
function givenTemplateIs(template) {
    cfnMocks.getTemplate.mockReset();
    cfnMocks.getTemplate.mockReturnValue({
        TemplateBody: JSON.stringify(template),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZXBsb3ktc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUF3QztBQUN4QyxrQ0FBMkQ7QUFDM0QsK0NBQXdIO0FBRXhILE1BQU0sVUFBVSxHQUFHLGdCQUFTLENBQUM7SUFDM0IsU0FBUyxFQUFFLGVBQWU7Q0FDM0IsQ0FBQyxDQUFDO0FBRUgsTUFBTSwwQkFBMEIsR0FBRyxnQkFBUyxDQUFDO0lBQzNDLFNBQVMsRUFBRSxnQkFBZ0I7SUFDM0IsUUFBUSxFQUFFO1FBQ1IsVUFBVSxFQUFFO1lBQ1YsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUM1QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUU7WUFDckQsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtTQUNuQztLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxpQ0FBaUMsR0FBRyxnQkFBUyxDQUFDO0lBQ2xELFNBQVMsRUFBRSx3QkFBd0I7SUFDbkMsUUFBUSxFQUFFLDRCQUFxQjtJQUMvQixxQkFBcUIsRUFBRSxJQUFJO0NBQzVCLENBQUMsQ0FBQztBQUVILElBQUksR0FBWSxDQUFDO0FBQ2pCLElBQUksV0FBNEIsQ0FBQztBQUNqQyxJQUFJLFFBQStELENBQUM7QUFDcEUsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLFdBQVcsR0FBRyxJQUFJLDBCQUFlLEVBQUUsQ0FBQztJQUNwQyxHQUFHLEdBQUcsSUFBSSxrQkFBTyxFQUFFLENBQUM7SUFFcEIsUUFBUSxHQUFHO1FBQ1QsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDbEQsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDdkIsOEJBQThCO2FBQzdCLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvQyxzQ0FBc0M7YUFDckMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM3QixNQUFNLEVBQUU7Z0JBQ047b0JBQ0UsV0FBVyxFQUFFLGlCQUFpQjtvQkFDOUIsaUJBQWlCLEVBQUUsYUFBYTtvQkFDaEMsMkJBQTJCLEVBQUUsS0FBSztpQkFDbkM7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUNMLGVBQWUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLGVBQWUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUMsQ0FBQztRQUNILGdCQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RiwyQkFBMkIsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7S0FDeEUsQ0FBQztJQUNGLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFlLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxnREFBZ0QsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPO0lBQ1AsTUFBTSxHQUFHLEdBQUcsTUFBTSxpQkFBVyxDQUFDO1FBQzVCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO1FBQzlDLEdBQUc7UUFDSCxXQUFXO0tBQ1osQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdkQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDbEYsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsVUFBVTtRQUNqQixHQUFHO1FBQ0gsV0FBVztRQUNYLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO1FBQzlDLFVBQVUsRUFBRTtZQUNWLENBQUMsRUFBRSxTQUFTO1lBQ1osQ0FBQyxFQUFFLFNBQVM7WUFDWixDQUFDLEVBQUUsU0FBUztZQUNaLENBQUMsRUFBRSxFQUFFO1NBQ047S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDNUUsVUFBVSxFQUFFO1lBQ1YsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUU7WUFDaEQsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUU7U0FDakQ7S0FDRixDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3hELFFBQVE7SUFDUixnQkFBZ0IsQ0FBQztRQUNmLFVBQVUsRUFBRTtZQUNWLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO1lBQ3hELEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFO1NBQzlEO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMsVUFBVSxFQUFFO1lBQ1YsY0FBYyxFQUFFLFdBQVc7U0FDNUI7UUFDRCxxQkFBcUIsRUFBRSxJQUFJO0tBQzVCLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RSxVQUFVLEVBQUU7WUFDVixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFO1lBQ3BELEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUU7WUFDdEQsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRTtTQUNoRTtLQUNGLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsbURBQW1ELEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDbkUsUUFBUTtJQUNSLGdCQUFnQixDQUFDO1FBQ2YsVUFBVSxFQUFFO1lBQ1YsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7WUFDeEQsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUU7U0FDOUQ7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtRQUM5QyxVQUFVLEVBQUU7WUFDVixRQUFRLEVBQUUsV0FBVztZQUNyQixjQUFjLEVBQUUsV0FBVztTQUM1QjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RSxVQUFVLEVBQUU7WUFDVixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRTtZQUN6RCxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFO1NBQ2hFO0tBQ0YsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtREFBbUQsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNuRSxRQUFRO0lBQ1IsZ0JBQWdCLENBQUM7UUFDZixVQUFVLEVBQUU7WUFDVixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRTtZQUN4RCxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRTtTQUM5RDtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLE1BQU0sQ0FBQyxpQkFBVyxDQUFDO1FBQ3ZCLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtRQUM5QyxVQUFVLEVBQUU7WUFDVixjQUFjLEVBQUUsV0FBVztTQUM1QjtLQUNGLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUN2RSxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyw4Q0FBOEMsRUFBRSxLQUFLLElBQUksRUFBRTtJQUM5RCxRQUFRO0lBQ1IsZ0JBQWdCLEVBQUUsQ0FBQztJQUVuQixPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsOENBQThDLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDOUQsUUFBUTtJQUNSLGVBQWUsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyRCxnQkFBZ0IsQ0FBQztRQUNmLFVBQVUsRUFBRTtZQUNWLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO1lBQ3hELEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFO1lBQzVELEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRTtTQUNyRTtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFXLENBQUM7UUFDaEIsS0FBSyxFQUFFLDBCQUEwQjtRQUNqQyxHQUFHO1FBQ0gsV0FBVztRQUNYLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO1FBQzlDLFVBQVUsRUFBRSxFQUFFO1FBQ2QscUJBQXFCLEVBQUUsSUFBSTtLQUM1QixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMxRCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtREFBbUQsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNuRSxRQUFRO0lBQ1IsZUFBZSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JELGdCQUFnQixDQUFDO1FBQ2YsVUFBVSxFQUFFO1lBQ1YsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7WUFDeEQsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDNUQsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFO1NBQ3JFO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMsVUFBVSxFQUFFO1lBQ1YsUUFBUSxFQUFFLFVBQVU7U0FDckI7UUFDRCxxQkFBcUIsRUFBRSxJQUFJO0tBQzVCLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RSxVQUFVLEVBQUU7WUFDVixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRTtZQUN4RCxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFO1lBQ3RELEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRTtTQUMzRDtLQUNGLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsaUVBQWlFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDakYsUUFBUTtJQUNSLGdCQUFnQixDQUNkLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLEVBQUUsZ0NBQWdDO0lBQ3RFLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsK0JBQStCO0lBQ25FLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLENBQ25DLENBQUM7SUFDRixlQUFlLENBQUM7UUFDZCxhQUFhLEVBQUUsWUFBWTtLQUM1QixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNoRCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUM1RSxhQUFhLEVBQUUsUUFBUTtLQUN4QixDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHFHQUFxRyxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3JILFFBQVE7SUFDUixnQkFBZ0IsQ0FDZCxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxFQUFFLGdDQUFnQztJQUN0RSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLCtCQUErQjtJQUNuRSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxDQUNuQyxDQUFDO0lBRUYsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsVUFBVTtRQUNqQixHQUFHO1FBQ0gsV0FBVztRQUNYLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO0tBQy9DLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDaEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDNUUsYUFBYSxFQUFFLFFBQVE7S0FDeEIsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxzRUFBc0UsRUFBRSxLQUFLLElBQUksRUFBRTtJQUN0RixRQUFRO0lBQ1IsZ0JBQWdCLEVBQUUsQ0FBQztJQUVuQixPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMsS0FBSyxFQUFFLElBQUk7S0FDWixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdkQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdkUsUUFBUTtJQUNSLGdCQUFnQixDQUFDO1FBQ2YsSUFBSSxFQUFFO1lBQ0osRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7WUFDaEMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7U0FDakM7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLElBQUksRUFBRTtZQUNKLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO1NBQ2pDO1FBQ0QsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtLQUMvQyxDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7SUFDckYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDL0csQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsZ0VBQWdFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDaEYsUUFBUTtJQUNSLGdCQUFnQixDQUFDO1FBQ2YsSUFBSSxFQUFFO1lBQ0osRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7U0FDL0I7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMsSUFBSSxFQUFFO1lBQ0o7Z0JBQ0UsR0FBRyxFQUFFLEtBQUs7Z0JBQ1YsS0FBSyxFQUFFLFVBQVU7YUFDbEI7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDcEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDckQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDdEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQy9HLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDJFQUEyRSxFQUFFLEtBQUssSUFBSSxFQUFFOztJQUMzRixNQUFBLFFBQVEsQ0FBQyxpQkFBaUIsMENBQUUsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwRCxNQUFNLEVBQUUsUUFBUTtRQUNoQixZQUFZLEVBQUUsaUNBQWlDO0tBQ2hELENBQUMsRUFBRTtJQUVKLE9BQU87SUFDUCxNQUFNLFlBQVksR0FBRyxNQUFNLGlCQUFXLENBQUM7UUFDckMsS0FBSyxFQUFFLFVBQVU7UUFDakIsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtLQUMvQyxDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsbUVBQW1FLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDbkYsUUFBUTtJQUNSLGdCQUFnQixDQUFDO1FBQ2YsSUFBSSxFQUFFO1lBQ0osRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7WUFDaEMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7U0FDakM7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMsSUFBSSxFQUFFO1lBQ0osRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7U0FDakM7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3JELE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3RELE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztJQUNyRixNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUMvRyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLLElBQUksRUFBRTtJQUN0RSxRQUFRO0lBQ1IsZ0JBQWdCLENBQUM7UUFDZixXQUFXLEVBQUUsZUFBZTtLQUM3QixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7UUFDOUMscUJBQXFCLEVBQUUsSUFBSTtLQUM1QixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO0lBRW5CLE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsaUVBQWlFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDakYsUUFBUTtJQUNSLGdCQUFnQixDQUNkLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixFQUFFLEVBQUUsZ0NBQWdDO0lBQzdFLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLENBQ25DLENBQUM7SUFDRixlQUFlLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUVsQyxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDcEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDNUUsYUFBYSxFQUFFLFFBQVE7S0FDeEIsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLElBQUksRUFBRTtJQUN4RCxRQUFRO0lBQ1IsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixlQUFlLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUVsQyxPQUFPO0lBQ1AsTUFBTSxpQkFBVyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3ZELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3BFLE9BQU87SUFDUCxNQUFNLGlCQUFXLENBQUM7UUFDaEIsS0FBSyxFQUFFLFVBQVU7UUFDakIsR0FBRztRQUNILFdBQVc7UUFDWCxPQUFPLEVBQUUsS0FBSztRQUNkLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO0tBQy9DLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsOERBQThELEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDOUUsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsZ0JBQVMsQ0FBQztZQUNmLFNBQVMsRUFBRSxlQUFlO1lBQzFCLFVBQVUsRUFBRTtnQkFDViwyQkFBMkIsRUFBRSx3QkFBd0I7YUFDdEQ7U0FDRixDQUFDO1FBQ0YsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtLQUMvQyxDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDNUUsV0FBVyxFQUFFLHdCQUF3QjtLQUN0QyxDQUFDLENBQUMsQ0FBQztJQUNKLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3ZELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHFGQUFxRixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3JHLE9BQU87SUFDUCxNQUFNLGlCQUFXLENBQUM7UUFDaEIsS0FBSyxFQUFFLGdCQUFTLENBQUM7WUFDZixTQUFTLEVBQUUsZUFBZTtZQUMxQixVQUFVLEVBQUU7Z0JBQ1YsMkJBQTJCLEVBQUUsNkNBQTZDO2FBQzNFO1NBQ0YsQ0FBQztRQUNGLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQzVFLFdBQVcsRUFBRSwrRUFBK0U7S0FDN0YsQ0FBQyxDQUFDLENBQUM7SUFDSixNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN2RCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxxRUFBcUUsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNyRixRQUFRO0lBQ1IsZ0JBQWdCLENBQUM7UUFDZixXQUFXLEVBQUUsb0JBQW9CO1FBQ2pDLElBQUksRUFBRTtZQUNKLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO1NBQ2pDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsVUFBVTtRQUNqQixHQUFHO1FBQ0gsV0FBVztRQUNYLE9BQU8sRUFBRSxLQUFLO1FBQ2QsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsb0JBQW9CLENBQ25ELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUN0QixhQUFhLEVBQUUsUUFBUTtRQUN2QixTQUFTLEVBQUUsZUFBZTtLQUMzQixDQUFDLENBQ0gsQ0FBQztJQUNGLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMzRCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxrRUFBa0UsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNsRixRQUFRO0lBQ1IsZ0JBQWdCLENBQUM7UUFDZixJQUFJLEVBQUU7WUFDSixFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtZQUNoQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtTQUNqQztLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFXLENBQUM7UUFDaEIsS0FBSyxFQUFFLFVBQVU7UUFDakIsR0FBRztRQUNILFdBQVc7UUFDWCxPQUFPLEVBQUUsS0FBSztRQUNkLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO0tBQy9DLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUNuRCxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDdEIsYUFBYSxFQUFFLFFBQVE7UUFDdkIsU0FBUyxFQUFFLGVBQWU7S0FDM0IsQ0FBQyxDQUNILENBQUM7SUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsNENBQTRDLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDNUQsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLEdBQUc7UUFDSCxXQUFXO1FBQ1gsbUJBQW1CLEVBQUUsa0NBQXVCLEVBQUU7S0FDL0MsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDeEYsMkJBQTJCLEVBQUUsSUFBSTtLQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLGlGQUFpRixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ2pHLE9BQU87SUFDUCxNQUFNLGlCQUFXLENBQUM7UUFDaEIsS0FBSyxFQUFFLFVBQVU7UUFDakIsR0FBRztRQUNILFdBQVc7UUFDWCxtQkFBbUIsRUFBRSxrQ0FBdUIsRUFBRTtLQUMvQyxDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLGtIQUFrSCxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ2xJLFFBQVE7SUFDUixnQkFBZ0IsQ0FBQztRQUNmLDJCQUEyQixFQUFFLElBQUk7S0FDbEMsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQVcsQ0FBQztRQUNoQixLQUFLLEVBQUUsVUFBVTtRQUNqQixHQUFHO1FBQ0gsV0FBVztRQUNYLG1CQUFtQixFQUFFLGtDQUF1QixFQUFFO0tBQy9DLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQ3hGLDJCQUEyQixFQUFFLEtBQUs7S0FDbkMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsU0FBbUQ7SUFDOUUsUUFBUSxDQUFDLGNBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUVyQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzFCLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsTUFBTSxZQUFZLEdBQUc7UUFDbkIsU0FBUyxFQUFFLGlCQUFpQjtRQUM1QixPQUFPLEVBQUUsZUFBZTtRQUN4QixZQUFZLEVBQUUsSUFBSSxJQUFJLEVBQUU7UUFDeEIsV0FBVyxFQUFFLGlCQUFpQjtRQUM5QiwyQkFBMkIsRUFBRSxLQUFLO0tBQ25DLENBQUM7SUFFRixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDL0QsUUFBUSxDQUFDLGNBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxRQUFRLEVBQUUsQ0FBQztTQUMzQyxDQUFDLENBQUMsQ0FBQztLQUNMO0lBQ0QsUUFBUSxDQUFDLGNBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0tBQ2xFLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLFFBQWE7SUFDcEMsUUFBUSxDQUFDLFdBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNsQyxRQUFRLENBQUMsV0FBWSxDQUFDLGVBQWUsQ0FBQztRQUNwQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7S0FDdkMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlcGxveVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliJztcbmltcG9ydCB7IERFRkFVTFRfRkFLRV9URU1QTEFURSwgdGVzdFN0YWNrIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBNb2NrZWRPYmplY3QsIG1vY2tSZXNvbHZlZEVudmlyb25tZW50LCBNb2NrU2RrLCBNb2NrU2RrUHJvdmlkZXIsIFN5bmNIYW5kbGVyU3Vic2V0T2YgfSBmcm9tICcuLi91dGlsL21vY2stc2RrJztcblxuY29uc3QgRkFLRV9TVEFDSyA9IHRlc3RTdGFjayh7XG4gIHN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnLFxufSk7XG5cbmNvbnN0IEZBS0VfU1RBQ0tfV0lUSF9QQVJBTUVURVJTID0gdGVzdFN0YWNrKHtcbiAgc3RhY2tOYW1lOiAnd2l0aHBhcmFtZXRlcnMnLFxuICB0ZW1wbGF0ZToge1xuICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgIEhhc1ZhbHVlOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgICBIYXNEZWZhdWx0OiB7IFR5cGU6ICdTdHJpbmcnLCBEZWZhdWx0OiAnVGhlRGVmYXVsdCcgfSxcbiAgICAgIE90aGVyUGFyYW1ldGVyOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuXG5jb25zdCBGQUtFX1NUQUNLX1RFUk1JTkFUSU9OX1BST1RFQ1RJT04gPSB0ZXN0U3RhY2soe1xuICBzdGFja05hbWU6ICd0ZXJtaW5hdGlvbi1wcm90ZWN0aW9uJyxcbiAgdGVtcGxhdGU6IERFRkFVTFRfRkFLRV9URU1QTEFURSxcbiAgdGVybWluYXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxufSk7XG5cbmxldCBzZGs6IE1vY2tTZGs7XG5sZXQgc2RrUHJvdmlkZXI6IE1vY2tTZGtQcm92aWRlcjtcbmxldCBjZm5Nb2NrczogTW9ja2VkT2JqZWN0PFN5bmNIYW5kbGVyU3Vic2V0T2Y8QVdTLkNsb3VkRm9ybWF0aW9uPj47XG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgc2RrUHJvdmlkZXIgPSBuZXcgTW9ja1Nka1Byb3ZpZGVyKCk7XG4gIHNkayA9IG5ldyBNb2NrU2RrKCk7XG5cbiAgY2ZuTW9ja3MgPSB7XG4gICAgZGVzY3JpYmVTdGFja0V2ZW50czogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSksXG4gICAgZGVzY3JpYmVTdGFja3M6IGplc3QuZm4oKVxuICAgICAgLy8gRmlyc3QgY2FsbCwgbm8gc3RhY2tzIGV4aXN0XG4gICAgICAubW9ja0ltcGxlbWVudGF0aW9uT25jZSgoKSA9PiAoeyBTdGFja3M6IFtdIH0pKVxuICAgICAgLy8gU2Vjb25kIGNhbGwsIHN0YWNrIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgIC5tb2NrSW1wbGVtZW50YXRpb25PbmNlKCgpID0+ICh7XG4gICAgICAgIFN0YWNrczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIFN0YWNrU3RhdHVzOiAnQ1JFQVRFX0NPTVBMRVRFJyxcbiAgICAgICAgICAgIFN0YWNrU3RhdHVzUmVhc29uOiAnSXQgaXMgbWFnaWMnLFxuICAgICAgICAgICAgRW5hYmxlVGVybWluYXRpb25Qcm90ZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSkpLFxuICAgIGNyZWF0ZUNoYW5nZVNldDogamVzdC5mbigoX28pID0+ICh7fSkpLFxuICAgIGRlbGV0ZUNoYW5nZVNldDogamVzdC5mbigoX28pID0+ICh7fSkpLFxuICAgIGRlc2NyaWJlQ2hhbmdlU2V0OiBqZXN0LmZuKChfbykgPT4gKHtcbiAgICAgIFN0YXR1czogJ0NSRUFURV9DT01QTEVURScsXG4gICAgICBDaGFuZ2VzOiBbXSxcbiAgICB9KSksXG4gICAgZXhlY3V0ZUNoYW5nZVNldDogamVzdC5mbigoX28pID0+ICh7fSkpLFxuICAgIGRlbGV0ZVN0YWNrOiBqZXN0LmZuKChfbykgPT4gKHt9KSksXG4gICAgZ2V0VGVtcGxhdGU6IGplc3QuZm4oKF9vKSA9PiAoeyBUZW1wbGF0ZUJvZHk6IEpTT04uc3RyaW5naWZ5KERFRkFVTFRfRkFLRV9URU1QTEFURSkgfSkpLFxuICAgIHVwZGF0ZVRlcm1pbmF0aW9uUHJvdGVjdGlvbjogamVzdC5mbigoX28pID0+ICh7IFN0YWNrSWQ6ICdzdGFjay1pZCcgfSkpLFxuICB9O1xuICBzZGsuc3R1YkNsb3VkRm9ybWF0aW9uKGNmbk1vY2tzIGFzIGFueSk7XG59KTtcblxudGVzdCgnZG8gZGVwbG95IGV4ZWN1dGFibGUgY2hhbmdlIHNldCB3aXRoIDAgY2hhbmdlcycsIGFzeW5jICgpID0+IHtcbiAgLy8gV0hFTlxuICBjb25zdCByZXQgPSBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0ssXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KHJldC5ub09wKS50b0JlRmFsc3koKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmV4ZWN1dGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdjb3JyZWN0bHkgcGFzc2VzIENGTiBwYXJhbWV0ZXJzLCBpZ25vcmluZyBvbmVzIHdpdGggZW1wdHkgdmFsdWVzJywgYXN5bmMgKCkgPT4ge1xuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBBOiAnQS12YWx1ZScsXG4gICAgICBCOiAnQj12YWx1ZScsXG4gICAgICBDOiB1bmRlZmluZWQsXG4gICAgICBEOiAnJyxcbiAgICB9LFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChjZm5Nb2Nrcy5jcmVhdGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICBQYXJhbWV0ZXJzOiBbXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0EnLCBQYXJhbWV0ZXJWYWx1ZTogJ0EtdmFsdWUnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0InLCBQYXJhbWV0ZXJWYWx1ZTogJ0I9dmFsdWUnIH0sXG4gICAgXSxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ3JldXNlIHByZXZpb3VzIHBhcmFtZXRlcnMgaWYgcmVxdWVzdGVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKHtcbiAgICBQYXJhbWV0ZXJzOiBbXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0hhc1ZhbHVlJywgUGFyYW1ldGVyVmFsdWU6ICdUaGVWYWx1ZScgfSxcbiAgICAgIHsgUGFyYW1ldGVyS2V5OiAnSGFzRGVmYXVsdCcsIFBhcmFtZXRlclZhbHVlOiAnVGhlT2xkVmFsdWUnIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0tfV0lUSF9QQVJBTUVURVJTLFxuICAgIHNkayxcbiAgICBzZGtQcm92aWRlcixcbiAgICByZXNvbHZlZEVudmlyb25tZW50OiBtb2NrUmVzb2x2ZWRFbnZpcm9ubWVudCgpLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIE90aGVyUGFyYW1ldGVyOiAnU29tZVZhbHVlJyxcbiAgICB9LFxuICAgIHVzZVByZXZpb3VzUGFyYW1ldGVyczogdHJ1ZSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgUGFyYW1ldGVyczogW1xuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNWYWx1ZScsIFVzZVByZXZpb3VzVmFsdWU6IHRydWUgfSxcbiAgICAgIHsgUGFyYW1ldGVyS2V5OiAnSGFzRGVmYXVsdCcsIFVzZVByZXZpb3VzVmFsdWU6IHRydWUgfSxcbiAgICAgIHsgUGFyYW1ldGVyS2V5OiAnT3RoZXJQYXJhbWV0ZXInLCBQYXJhbWV0ZXJWYWx1ZTogJ1NvbWVWYWx1ZScgfSxcbiAgICBdLFxuICB9KSk7XG59KTtcblxudGVzdCgnZG8gbm90IHJldXNlIHByZXZpb3VzIHBhcmFtZXRlcnMgaWYgbm90IHJlcXVlc3RlZCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgUGFyYW1ldGVyczogW1xuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNWYWx1ZScsIFBhcmFtZXRlclZhbHVlOiAnVGhlVmFsdWUnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0hhc0RlZmF1bHQnLCBQYXJhbWV0ZXJWYWx1ZTogJ1RoZU9sZFZhbHVlJyB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLX1dJVEhfUEFSQU1FVEVSUyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBIYXNWYWx1ZTogJ1NvbWVWYWx1ZScsXG4gICAgICBPdGhlclBhcmFtZXRlcjogJ1NvbWVWYWx1ZScsXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgUGFyYW1ldGVyczogW1xuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNWYWx1ZScsIFBhcmFtZXRlclZhbHVlOiAnU29tZVZhbHVlJyB9LFxuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdPdGhlclBhcmFtZXRlcicsIFBhcmFtZXRlclZhbHVlOiAnU29tZVZhbHVlJyB9LFxuICAgIF0sXG4gIH0pKTtcbn0pO1xuXG50ZXN0KCd0aHJvdyBleGNlcHRpb24gaWYgbm90IGVub3VnaCBwYXJhbWV0ZXJzIHN1cHBsaWVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKHtcbiAgICBQYXJhbWV0ZXJzOiBbXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0hhc1ZhbHVlJywgUGFyYW1ldGVyVmFsdWU6ICdUaGVWYWx1ZScgfSxcbiAgICAgIHsgUGFyYW1ldGVyS2V5OiAnSGFzRGVmYXVsdCcsIFBhcmFtZXRlclZhbHVlOiAnVGhlT2xkVmFsdWUnIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBleHBlY3QoZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLX1dJVEhfUEFSQU1FVEVSUyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICBPdGhlclBhcmFtZXRlcjogJ1NvbWVWYWx1ZScsXG4gICAgfSxcbiAgfSkpLnJlamVjdHMudG9UaHJvdygvQ2xvdWRGb3JtYXRpb24gUGFyYW1ldGVycyBhcmUgbWlzc2luZyBhIHZhbHVlLyk7XG59KTtcblxudGVzdCgnZGVwbG95IGlzIHNraXBwZWQgaWYgdGVtcGxhdGUgZGlkIG5vdCBjaGFuZ2UnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGdpdmVuU3RhY2tFeGlzdHMoKTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkubm90LnRvQmVDYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdkZXBsb3kgaXMgc2tpcHBlZCBpZiBwYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5UZW1wbGF0ZUlzKEZBS0VfU1RBQ0tfV0lUSF9QQVJBTUVURVJTLnRlbXBsYXRlKTtcbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgUGFyYW1ldGVyczogW1xuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNWYWx1ZScsIFBhcmFtZXRlclZhbHVlOiAnSGFzVmFsdWUnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0hhc0RlZmF1bHQnLCBQYXJhbWV0ZXJWYWx1ZTogJ0hhc0RlZmF1bHQnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ090aGVyUGFyYW1ldGVyJywgUGFyYW1ldGVyVmFsdWU6ICdPdGhlclBhcmFtZXRlcicgfSxcbiAgICBdLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDS19XSVRIX1BBUkFNRVRFUlMsXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gICAgcGFyYW1ldGVyczoge30sXG4gICAgdXNlUHJldmlvdXNQYXJhbWV0ZXJzOiB0cnVlLFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChjZm5Nb2Nrcy5jcmVhdGVDaGFuZ2VTZXQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnZGVwbG95IGlzIG5vdCBza2lwcGVkIGlmIHBhcmFtZXRlcnMgYXJlIGRpZmZlcmVudCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5UZW1wbGF0ZUlzKEZBS0VfU1RBQ0tfV0lUSF9QQVJBTUVURVJTLnRlbXBsYXRlKTtcbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgUGFyYW1ldGVyczogW1xuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNWYWx1ZScsIFBhcmFtZXRlclZhbHVlOiAnSGFzVmFsdWUnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ0hhc0RlZmF1bHQnLCBQYXJhbWV0ZXJWYWx1ZTogJ0hhc0RlZmF1bHQnIH0sXG4gICAgICB7IFBhcmFtZXRlcktleTogJ090aGVyUGFyYW1ldGVyJywgUGFyYW1ldGVyVmFsdWU6ICdPdGhlclBhcmFtZXRlcicgfSxcbiAgICBdLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDS19XSVRIX1BBUkFNRVRFUlMsXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgSGFzVmFsdWU6ICdOZXdWYWx1ZScsXG4gICAgfSxcbiAgICB1c2VQcmV2aW91c1BhcmFtZXRlcnM6IHRydWUsXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLmNyZWF0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgIFBhcmFtZXRlcnM6IFtcbiAgICAgIHsgUGFyYW1ldGVyS2V5OiAnSGFzVmFsdWUnLCBQYXJhbWV0ZXJWYWx1ZTogJ05ld1ZhbHVlJyB9LFxuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdIYXNEZWZhdWx0JywgVXNlUHJldmlvdXNWYWx1ZTogdHJ1ZSB9LFxuICAgICAgeyBQYXJhbWV0ZXJLZXk6ICdPdGhlclBhcmFtZXRlcicsIFVzZVByZXZpb3VzVmFsdWU6IHRydWUgfSxcbiAgICBdLFxuICB9KSk7XG59KTtcblxudGVzdCgnaWYgZXhpc3Rpbmcgc3RhY2sgZmFpbGVkIHRvIGNyZWF0ZSwgaXQgaXMgZGVsZXRlZCBhbmQgcmVjcmVhdGVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKFxuICAgIHsgU3RhY2tTdGF0dXM6ICdST0xMQkFDS19DT01QTEVURScgfSwgLy8gVGhpcyBpcyBmb3IgdGhlIGluaXRpYWwgY2hlY2tcbiAgICB7IFN0YWNrU3RhdHVzOiAnREVMRVRFX0NPTVBMRVRFJyB9LCAvLyBQb2xsIHRoZSBzdWNjZXNzZnVsIGRlbGV0aW9uXG4gICAgeyBTdGFja1N0YXR1czogJ0NSRUFURV9DT01QTEVURScgfSwgLy8gUG9sbCB0aGUgcmVjcmVhdGlvblxuICApO1xuICBnaXZlblRlbXBsYXRlSXMoe1xuICAgIERpZmZlcmVudFRoYW46ICdUaGVEZWZhdWx0JyxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0ssXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLmRlbGV0ZVN0YWNrKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gIGV4cGVjdChjZm5Nb2Nrcy5jcmVhdGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICBDaGFuZ2VTZXRUeXBlOiAnQ1JFQVRFJyxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ2lmIGV4aXN0aW5nIHN0YWNrIGZhaWxlZCB0byBjcmVhdGUsIGl0IGlzIGRlbGV0ZWQgYW5kIHJlY3JlYXRlZCBldmVuIGlmIHRoZSB0ZW1wbGF0ZSBkaWQgbm90IGNoYW5nZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyhcbiAgICB7IFN0YWNrU3RhdHVzOiAnUk9MTEJBQ0tfQ09NUExFVEUnIH0sIC8vIFRoaXMgaXMgZm9yIHRoZSBpbml0aWFsIGNoZWNrXG4gICAgeyBTdGFja1N0YXR1czogJ0RFTEVURV9DT01QTEVURScgfSwgLy8gUG9sbCB0aGUgc3VjY2Vzc2Z1bCBkZWxldGlvblxuICAgIHsgU3RhY2tTdGF0dXM6ICdDUkVBVEVfQ09NUExFVEUnIH0sIC8vIFBvbGwgdGhlIHJlY3JlYXRpb25cbiAgKTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZGVsZXRlU3RhY2spLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmNyZWF0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgIENoYW5nZVNldFR5cGU6ICdDUkVBVEUnLFxuICB9KSk7XG59KTtcblxudGVzdCgnZGVwbG95IG5vdCBza2lwcGVkIGlmIHRlbXBsYXRlIGRpZCBub3QgY2hhbmdlIGFuZCAtLWZvcmNlIGlzIGFwcGxpZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGdpdmVuU3RhY2tFeGlzdHMoKTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICBmb3JjZTogdHJ1ZSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2RlcGxveSBpcyBza2lwcGVkIGlmIHRlbXBsYXRlIGFuZCB0YWdzIGRpZCBub3QgY2hhbmdlJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKHtcbiAgICBUYWdzOiBbXG4gICAgICB7IEtleTogJ0tleTEnLCBWYWx1ZTogJ1ZhbHVlMScgfSxcbiAgICAgIHsgS2V5OiAnS2V5MicsIFZhbHVlOiAnVmFsdWUyJyB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLLFxuICAgIHRhZ3M6IFtcbiAgICAgIHsgS2V5OiAnS2V5MScsIFZhbHVlOiAnVmFsdWUxJyB9LFxuICAgICAgeyBLZXk6ICdLZXkyJywgVmFsdWU6ICdWYWx1ZTInIH0sXG4gICAgXSxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS5ub3QudG9CZUNhbGxlZCgpO1xuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkubm90LnRvQmVDYWxsZWQoKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmRlc2NyaWJlU3RhY2tzKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7IFN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnIH0pO1xuICBleHBlY3QoY2ZuTW9ja3MuZ2V0VGVtcGxhdGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHsgU3RhY2tOYW1lOiAnd2l0aG91dGVycm9ycycsIFRlbXBsYXRlU3RhZ2U6ICdPcmlnaW5hbCcgfSk7XG59KTtcblxudGVzdCgnZGVwbG95IG5vdCBza2lwcGVkIGlmIHRlbXBsYXRlIGRpZCBub3QgY2hhbmdlIGJ1dCB0YWdzIGNoYW5nZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGdpdmVuU3RhY2tFeGlzdHMoe1xuICAgIFRhZ3M6IFtcbiAgICAgIHsgS2V5OiAnS2V5JywgVmFsdWU6ICdWYWx1ZScgfSxcbiAgICBdLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgICB0YWdzOiBbXG4gICAgICB7XG4gICAgICAgIEtleTogJ0tleScsXG4gICAgICAgIFZhbHVlOiAnTmV3VmFsdWUnLFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChjZm5Nb2Nrcy5jcmVhdGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmV4ZWN1dGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmRlc2NyaWJlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gIGV4cGVjdChjZm5Nb2Nrcy5kZXNjcmliZVN0YWNrcykudG9IYXZlQmVlbkNhbGxlZFdpdGgoeyBTdGFja05hbWU6ICd3aXRob3V0ZXJyb3JzJyB9KTtcbiAgZXhwZWN0KGNmbk1vY2tzLmdldFRlbXBsYXRlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7IFN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnLCBUZW1wbGF0ZVN0YWdlOiAnT3JpZ2luYWwnIH0pO1xufSk7XG5cbnRlc3QoJ2RlcGxveVN0YWNrIHJlcG9ydHMgbm8gY2hhbmdlIGlmIGRlc2NyaWJlQ2hhbmdlU2V0IHJldHVybnMgc3BlY2lmaWMgZXJyb3InLCBhc3luYyAoKSA9PiB7XG4gIGNmbk1vY2tzLmRlc2NyaWJlQ2hhbmdlU2V0Py5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4gKHtcbiAgICBTdGF0dXM6ICdGQUlMRUQnLFxuICAgIFN0YXR1c1JlYXNvbjogJ05vIHVwZGF0ZXMgYXJlIHRvIGJlIHBlcmZvcm1lZC4nLFxuICB9KSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lSZXN1bHQgPSBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0ssXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVJlc3VsdC5ub09wKS50b0VxdWFsKHRydWUpO1xufSk7XG5cbnRlc3QoJ2RlcGxveSBub3Qgc2tpcHBlZCBpZiB0ZW1wbGF0ZSBkaWQgbm90IGNoYW5nZSBidXQgb25lIHRhZyByZW1vdmVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKHtcbiAgICBUYWdzOiBbXG4gICAgICB7IEtleTogJ0tleTEnLCBWYWx1ZTogJ1ZhbHVlMScgfSxcbiAgICAgIHsgS2V5OiAnS2V5MicsIFZhbHVlOiAnVmFsdWUyJyB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLLFxuICAgIHNkayxcbiAgICBzZGtQcm92aWRlcixcbiAgICByZXNvbHZlZEVudmlyb25tZW50OiBtb2NrUmVzb2x2ZWRFbnZpcm9ubWVudCgpLFxuICAgIHRhZ3M6IFtcbiAgICAgIHsgS2V5OiAnS2V5MScsIFZhbHVlOiAnVmFsdWUxJyB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLmNyZWF0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICBleHBlY3QoY2ZuTW9ja3MuZGVzY3JpYmVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmRlc2NyaWJlU3RhY2tzKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7IFN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnIH0pO1xuICBleHBlY3QoY2ZuTW9ja3MuZ2V0VGVtcGxhdGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHsgU3RhY2tOYW1lOiAnd2l0aG91dGVycm9ycycsIFRlbXBsYXRlU3RhZ2U6ICdPcmlnaW5hbCcgfSk7XG59KTtcblxudGVzdCgnZGVwbG95IGlzIG5vdCBza2lwcGVkIGlmIHN0YWNrIGlzIGluIGEgX0ZBSUxFRCBzdGF0ZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgU3RhY2tTdGF0dXM6ICdERUxFVEVfRkFJTEVEJyxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0ssXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gICAgdXNlUHJldmlvdXNQYXJhbWV0ZXJzOiB0cnVlLFxuICB9KS5jYXRjaCgoKSA9PiB7fSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnZXhpc3Rpbmcgc3RhY2sgaW4gVVBEQVRFX1JPTExCQUNLX0NPTVBMRVRFIHN0YXRlIGNhbiBiZSB1cGRhdGVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKFxuICAgIHsgU3RhY2tTdGF0dXM6ICdVUERBVEVfUk9MTEJBQ0tfQ09NUExFVEUnIH0sIC8vIFRoaXMgaXMgZm9yIHRoZSBpbml0aWFsIGNoZWNrXG4gICAgeyBTdGFja1N0YXR1czogJ1VQREFURV9DT01QTEVURScgfSwgLy8gUG9sbCB0aGUgdXBkYXRlXG4gICk7XG4gIGdpdmVuVGVtcGxhdGVJcyh7IGNoYW5nZWQ6IDEyMyB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZGVsZXRlU3RhY2spLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gIGV4cGVjdChjZm5Nb2Nrcy5jcmVhdGVDaGFuZ2VTZXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICBDaGFuZ2VTZXRUeXBlOiAnVVBEQVRFJyxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ2RlcGxveSBub3Qgc2tpcHBlZCBpZiB0ZW1wbGF0ZSBjaGFuZ2VkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBnaXZlblN0YWNrRXhpc3RzKCk7XG4gIGdpdmVuVGVtcGxhdGVJcyh7IGNoYW5nZWQ6IDEyMyB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ25vdCBleGVjdXRlZCBhbmQgbm8gZXJyb3IgaWYgLS1uby1leGVjdXRlIGlzIGdpdmVuJywgYXN5bmMgKCkgPT4ge1xuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgZXhlY3V0ZTogZmFsc2UsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCd1c2UgUzMgdXJsIGZvciBzdGFjayBkZXBsb3ltZW50IGlmIHByZXNlbnQgaW4gU3RhY2sgQXJ0aWZhY3QnLCBhc3luYyAoKSA9PiB7XG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiB0ZXN0U3RhY2soe1xuICAgICAgc3RhY2tOYW1lOiAnd2l0aG91dGVycm9ycycsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHN0YWNrVGVtcGxhdGVBc3NldE9iamVjdFVybDogJ2h0dHBzOi8vdXNlLW1lLXVzZS1tZS8nLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3VzZS1tZS11c2UtbWUvJyxcbiAgfSkpO1xuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ3VzZSBSRVNUIEFQSSBTMyB1cmwgd2l0aCBzdWJzdGl0dXRlZCBwbGFjZWhvbGRlcnMgaWYgbWFuaWZlc3QgdXJsIHN0YXJ0cyB3aXRoIHMzOi8vJywgYXN5bmMgKCkgPT4ge1xuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogdGVzdFN0YWNrKHtcbiAgICAgIHN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBzdGFja1RlbXBsYXRlQXNzZXRPYmplY3RVcmw6ICdzMzovL3VzZS1tZS11c2UtbWUtJHtBV1M6OkFjY291bnRJZH0vb2JqZWN0JyxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLmNyZWF0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgIFRlbXBsYXRlVVJMOiAnaHR0cHM6Ly9zMy5iZXJtdWRhLXRyaWFuZ2xlLTEzMzcuYW1hem9uYXdzLmNvbS91c2UtbWUtdXNlLW1lLTEyMzQ1Njc4OS9vYmplY3QnLFxuICB9KSk7XG4gIGV4cGVjdChjZm5Nb2Nrcy5leGVjdXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnY2hhbmdlc2V0IGlzIGNyZWF0ZWQgd2hlbiBzdGFjayBleGlzdHMgaW4gUkVWSUVXX0lOX1BST0dSRVNTIHN0YXR1cycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgU3RhY2tTdGF0dXM6ICdSRVZJRVdfSU5fUFJPR1JFU1MnLFxuICAgIFRhZ3M6IFtcbiAgICAgIHsgS2V5OiAnS2V5MScsIFZhbHVlOiAnVmFsdWUxJyB9LFxuICAgICAgeyBLZXk6ICdLZXkyJywgVmFsdWU6ICdWYWx1ZTInIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBkZXBsb3lTdGFjayh7XG4gICAgc3RhY2s6IEZBS0VfU1RBQ0ssXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIGV4ZWN1dGU6IGZhbHNlLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLmNyZWF0ZUNoYW5nZVNldCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXG4gICAgZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgICAgQ2hhbmdlU2V0VHlwZTogJ0NSRUFURScsXG4gICAgICBTdGFja05hbWU6ICd3aXRob3V0ZXJyb3JzJyxcbiAgICB9KSxcbiAgKTtcbiAgZXhwZWN0KGNmbk1vY2tzLmV4ZWN1dGVDaGFuZ2VTZXQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnY2hhbmdlc2V0IGlzIHVwZGF0ZWQgd2hlbiBzdGFjayBleGlzdHMgaW4gQ1JFQVRFX0NPTVBMRVRFIHN0YXR1cycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgVGFnczogW1xuICAgICAgeyBLZXk6ICdLZXkxJywgVmFsdWU6ICdWYWx1ZTEnIH0sXG4gICAgICB7IEtleTogJ0tleTInLCBWYWx1ZTogJ1ZhbHVlMicgfSxcbiAgICBdLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgZXhlY3V0ZTogZmFsc2UsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MuY3JlYXRlQ2hhbmdlU2V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChcbiAgICBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICBDaGFuZ2VTZXRUeXBlOiAnVVBEQVRFJyxcbiAgICAgIFN0YWNrTmFtZTogJ3dpdGhvdXRlcnJvcnMnLFxuICAgIH0pLFxuICApO1xuICBleHBlY3QoY2ZuTW9ja3MuZXhlY3V0ZUNoYW5nZVNldCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdkZXBsb3kgd2l0aCB0ZXJtaW5hdGlvbiBwcm90ZWN0aW9uIGVuYWJsZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLX1RFUk1JTkFUSU9OX1BST1RFQ1RJT04sXG4gICAgc2RrLFxuICAgIHNka1Byb3ZpZGVyLFxuICAgIHJlc29sdmVkRW52aXJvbm1lbnQ6IG1vY2tSZXNvbHZlZEVudmlyb25tZW50KCksXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGNmbk1vY2tzLnVwZGF0ZVRlcm1pbmF0aW9uUHJvdGVjdGlvbikudG9IYXZlQmVlbkNhbGxlZFdpdGgoZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgIEVuYWJsZVRlcm1pbmF0aW9uUHJvdGVjdGlvbjogdHJ1ZSxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ3VwZGF0ZVRlcm1pbmF0aW9uUHJvdGVjdGlvbiBub3QgY2FsbGVkIHdoZW4gdGVybWluYXRpb24gcHJvdGVjdGlvbiBpcyB1bmRlZmluZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIFdIRU5cbiAgYXdhaXQgZGVwbG95U3RhY2soe1xuICAgIHN0YWNrOiBGQUtFX1NUQUNLLFxuICAgIHNkayxcbiAgICBzZGtQcm92aWRlcixcbiAgICByZXNvbHZlZEVudmlyb25tZW50OiBtb2NrUmVzb2x2ZWRFbnZpcm9ubWVudCgpLFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChjZm5Nb2Nrcy51cGRhdGVUZXJtaW5hdGlvblByb3RlY3Rpb24pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgndXBkYXRlVGVybWluYXRpb25Qcm90ZWN0aW9uIGNhbGxlZCB3aGVuIHRlcm1pbmF0aW9uIHByb3RlY3Rpb24gaXMgdW5kZWZpbmVkIGFuZCBzdGFjayBoYXMgdGVybWluYXRpb24gcHJvdGVjdGlvbicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgZ2l2ZW5TdGFja0V4aXN0cyh7XG4gICAgRW5hYmxlVGVybWluYXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGRlcGxveVN0YWNrKHtcbiAgICBzdGFjazogRkFLRV9TVEFDSyxcbiAgICBzZGssXG4gICAgc2RrUHJvdmlkZXIsXG4gICAgcmVzb2x2ZWRFbnZpcm9ubWVudDogbW9ja1Jlc29sdmVkRW52aXJvbm1lbnQoKSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoY2ZuTW9ja3MudXBkYXRlVGVybWluYXRpb25Qcm90ZWN0aW9uKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgRW5hYmxlVGVybWluYXRpb25Qcm90ZWN0aW9uOiBmYWxzZSxcbiAgfSkpO1xufSk7XG5cbi8qKlxuICogU2V0IHVwIHRoZSBtb2NrcyBzbyB0aGF0IGl0IGxvb2tzIGxpa2UgdGhlIHN0YWNrIGV4aXN0cyB0byBzdGFydCB3aXRoXG4gKlxuICogVGhlIGxhc3QgZWxlbWVudCBvZiB0aGlzIGFycmF5IHdpbGwgYmUgY29udGludW91c2x5IHJlcGVhdGVkLlxuICovXG5mdW5jdGlvbiBnaXZlblN0YWNrRXhpc3RzKC4uLm92ZXJyaWRlczogQXJyYXk8UGFydGlhbDxBV1MuQ2xvdWRGb3JtYXRpb24uU3RhY2s+Pikge1xuICBjZm5Nb2Nrcy5kZXNjcmliZVN0YWNrcyEubW9ja1Jlc2V0KCk7XG5cbiAgaWYgKG92ZXJyaWRlcy5sZW5ndGggPT09IDApIHtcbiAgICBvdmVycmlkZXMgPSBbe31dO1xuICB9XG5cbiAgY29uc3QgYmFzZVJlc3BvbnNlID0ge1xuICAgIFN0YWNrTmFtZTogJ21vY2stc3RhY2stbmFtZScsXG4gICAgU3RhY2tJZDogJ21vY2stc3RhY2staWQnLFxuICAgIENyZWF0aW9uVGltZTogbmV3IERhdGUoKSxcbiAgICBTdGFja1N0YXR1czogJ0NSRUFURV9DT01QTEVURScsXG4gICAgRW5hYmxlVGVybWluYXRpb25Qcm90ZWN0aW9uOiBmYWxzZSxcbiAgfTtcblxuICBmb3IgKGNvbnN0IG92ZXJyaWRlIG9mIG92ZXJyaWRlcy5zbGljZSgwLCBvdmVycmlkZXMubGVuZ3RoIC0gMSkpIHtcbiAgICBjZm5Nb2Nrcy5kZXNjcmliZVN0YWNrcyEubW9ja0ltcGxlbWVudGF0aW9uT25jZSgoKSA9PiAoe1xuICAgICAgU3RhY2tzOiBbeyAuLi5iYXNlUmVzcG9uc2UsIC4uLm92ZXJyaWRlIH1dLFxuICAgIH0pKTtcbiAgfVxuICBjZm5Nb2Nrcy5kZXNjcmliZVN0YWNrcyEubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+ICh7XG4gICAgU3RhY2tzOiBbeyAuLi5iYXNlUmVzcG9uc2UsIC4uLm92ZXJyaWRlc1tvdmVycmlkZXMubGVuZ3RoIC0gMV0gfV0sXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gZ2l2ZW5UZW1wbGF0ZUlzKHRlbXBsYXRlOiBhbnkpIHtcbiAgY2ZuTW9ja3MuZ2V0VGVtcGxhdGUhLm1vY2tSZXNldCgpO1xuICBjZm5Nb2Nrcy5nZXRUZW1wbGF0ZSEubW9ja1JldHVyblZhbHVlKHtcbiAgICBUZW1wbGF0ZUJvZHk6IEpTT04uc3RyaW5naWZ5KHRlbXBsYXRlKSxcbiAgfSk7XG59Il19