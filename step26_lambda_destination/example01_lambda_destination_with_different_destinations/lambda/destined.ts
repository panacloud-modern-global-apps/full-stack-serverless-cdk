exports.handler = async (event: any) => {
    console.log('Received event:', event.Records[0].Sns);
    const {Success} = JSON.parse(event.Records[0].Sns.Message);
    console.log(Success)
    if (Success) {
        console.log("Success");
        return {
            success: true,
            Message: "Hello World from SNS"
        };
    }
    console.log("Failure");
    throw new Error("Failure from event, Success = false, I am failing!");

};