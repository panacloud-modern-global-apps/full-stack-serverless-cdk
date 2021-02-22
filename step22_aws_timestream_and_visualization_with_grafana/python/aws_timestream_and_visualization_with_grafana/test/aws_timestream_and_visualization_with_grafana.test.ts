import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsTimestreamAndVisualizationWithGrafana from '../lib/aws_timestream_and_visualization_with_grafana-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AwsTimestreamAndVisualizationWithGrafana.AwsTimestreamAndVisualizationWithGrafanaStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
