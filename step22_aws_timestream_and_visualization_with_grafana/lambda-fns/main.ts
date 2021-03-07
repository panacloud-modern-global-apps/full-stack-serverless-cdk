const AWS = require('aws-sdk');
const https = require('https');

exports.handler = async (event: any) => {
  const body = JSON.parse(event.body);
  try {
    /**
     * Recommended Timestream write client SDK configuration:
     *  - Set SDK retry count to 10.
     *  - Use SDK DEFAULT_BACKOFF_STRATEGY
     *  - Set RequestTimeout to 20 seconds .
     *  - Set max connections to 5000 or higher.
     */
    const agent = new https.Agent({
      maxSockets: 5000,
    });

    const writeClient = new AWS.TimestreamWrite({
      maxRetries: 10,
      httpOptions: {
        timeout: 20000,
        agent: agent,
      },
    });

    const method = event.httpMethod;

    if (method === 'POST') {
      const currentTime = Date.now().toString(); // Unix time in milliseconds

      const dimensions = [
        { Name: 'region', Value: 'us-east-1' },
        { Name: 'az', Value: 'az1' },
        { Name: 'hostname', Value: 'host3' },
      ];

      const cpuUtilization = {
        Dimensions: dimensions,
        MeasureName: 'cpu_utilization',
        MeasureValue: `${body.cpu}`,
        MeasureValueType: 'DOUBLE',
        Time: currentTime.toString(),
      };

      const memoryUtilization = {
        Dimensions: dimensions,
        MeasureName: 'memory_utilization',
        MeasureValue: `${body.memory}`,
        MeasureValueType: 'DOUBLE',
        Time: currentTime.toString(),
      };

      const records = [cpuUtilization, memoryUtilization];

      const params = {
        DatabaseName: process.env.TS_DATABASE_NAME,
        TableName: process.env.TS_TABLE_NAME,
        Records: records,
      };

      await writeClient.writeRecords(params).promise();

    }

    return {
      "isBase64Encoded" : true,
      "statusCode": 200,
      "headers": { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      "body": "Saved"
    }
  } catch (err) {
    console.log(err);
    return {
      "isBase64Encoded" : false,
      "statusCode": 422,
      "headers": { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      "body": "Failed"
    }
  }
};
