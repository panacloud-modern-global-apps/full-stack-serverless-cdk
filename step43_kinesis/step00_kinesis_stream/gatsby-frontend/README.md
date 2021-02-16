# Dependencies:
npm i aws-sdk

# Implementation
We will be communicating with Cognito Identity Pool. Provide credentials in aws-exports.js file. To get these credentials backend code need to be deployed first. Once its deployed successfully then we can get identity-pool-id and stream-name from console. Replace the values in aws-exports.js file

// aws-exports.js;

const config = {
    'aws_project_region': 'us-east-1',
    'aws_cognito_identity_pool_id': 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    'aws_stream_name': 'my-first-stream'
};

export default config;

# Execution

open url in browser: http://localhost:8000

scroll the text to generate stream data. With every scroll a new record will be added in stream. After every second stream data will be send to backend
