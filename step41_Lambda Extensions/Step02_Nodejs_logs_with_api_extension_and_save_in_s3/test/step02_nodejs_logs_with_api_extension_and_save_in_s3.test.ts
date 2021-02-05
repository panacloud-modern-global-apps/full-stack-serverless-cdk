import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Step02NodejsLogsWithApiExtensionAndSaveInS3 from '../lib/step02_nodejs_logs_with_api_extension_and_save_in_s3-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Step02NodejsLogsWithApiExtensionAndSaveInS3.Step02NodejsLogsWithApiExtensionAndSaveInS3Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
