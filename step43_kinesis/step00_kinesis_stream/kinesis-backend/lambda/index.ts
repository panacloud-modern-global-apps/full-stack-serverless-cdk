
    exports.handler = function(event:any, context:any) {
        console.log('Loading function');
        console.log(JSON.stringify(event, null, 2));
        event.Records.forEach(function(record:any) {
            // Kinesis data is base64 encoded so decode here
            var payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii');
            console.log('Decoded payload:', payload);
        });
    };
