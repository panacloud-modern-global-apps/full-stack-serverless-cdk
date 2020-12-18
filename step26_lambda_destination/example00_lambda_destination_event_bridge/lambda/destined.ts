// import * as AWS from "aws-sdk";

exports.handler = async (event: any) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    
    return {
        source: 'event-success',
        action: 'data',
        data: "Hello world"
    };
}