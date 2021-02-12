
[Lambda Extensions API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html)

[Node Process Object Explained](https://www.freecodecamp.org/news/node-process-object-explained/)

### Create a simple lambda function with layer.

```javascript
const sendfunc = new lambda.Function(this, "sendlog", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "hello.handler",
      memorySize: 1024,
      layers: [lambdaLayer],
    });
```

```javascript
const lambdaLayer = new lambda.LayerVersion(this, "asd", {
      code: lambda.Code.fromAsset("lambda-layers"),

    });
```
* As we already mentioned lambda extension is deployed as lambda layer.In lambda layer folder we placed a folder named extensions(This name is necessary otherwise it will be considered as lambda layer).In extensions folder we created a shell script.In shell script file we import folder which contain our extension logic.We are implementing a simple external extension in this example.

* In extensions folder give read and write permessions to shell file by running this cmd (chmod 777 filename)

[How create shell file in windows](https://www.youtube.com/watch?v=0Dv94qlpmd4&ab_channel=Tutplus24)

[How create shell file in Linux](https://www.youtube.com/watch?v=eiBVlxxu3so&ab_channel=KrisOcchipinti)

```javascript
const fetch = require('node-fetch');
const {basename} = require('path');

const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension`;

async function register() {
    const res = await fetch(`${baseUrl}/register`, {
        method: 'post',
        body: JSON.stringify({
            'events': [
                'INVOKE',
                'SHUTDOWN'
            ],
        }),
        headers: {
            'Content-Type': 'application/json',
            'Lambda-Extension-Name': basename(__dirname),
        }
    });

    if (!res.ok) {
        console.error('register failed', await res.text());
    }

    return res.headers.get('lambda-extension-identifier');
}

async function next(extensionId) {
    const res = await fetch(`${baseUrl}/event/next`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Lambda-Extension-Identifier': extensionId,
        }
    });

    if (!res.ok) {
        console.error('next failed', await res.text());
        return null;
    }

    return await res.json();
}

module.exports = {
    register,
    next,
};
```
## Register
During Extension init, all extensions need to register with Lambda to receive events. Lambda uses the full file name of the extension to validate that the extension has completed the bootstrap sequence. Therefore, each Register API call must include the Lambda-Extension-Name header with the full file name of the extension.

Internal extensions are started and stopped by the runtime process, so they are not permitted to register for the Shutdown event.
**Path** – /extension/register
**Method – POST**
**Headers**
Lambda-Extension-Name – The full file name of the extension. Required: yes. Type: string.
**Body parameters**
events – Array of the events to register for. Required: no. Type: array of strings. Valid strings: INVOKE, SHUTDOWN.
**Response headers**
Lambda-Extension-Identifier – Generated unique agent identifier (UUID string) that is required for all subsequent requests.

## Next
Extensions send a Next API request to receive the next event, which can be an Invoke event or a Shutdown event. The response body contains the payload, which is a JSON document that contains event data.

The extension sends a Next API request to signal that it is ready to receive new events. This is a blocking call.

Do not set a timeout on the GET call, as the extension can be suspended for a period of time until there is an event to return.

**Path** – /extension/event/next

**Method – GET**

**Parameters**

Lambda-Extension-Identifier – Unique identifier for extension (UUID string). Required: yes. Type: UUID string.

**Response header**

Lambda-Extension-Identifier – Unique agent identifier (UUID string).


```javascript
#!/usr/bin/env node
const { register, next } = require('./extensions-api');

const EventType = {
    INVOKE: 'INVOKE',
    SHUTDOWN: 'SHUTDOWN',
};

function handleShutdown(event) {
    console.log('shutdown', { event });
    process.exit(0);
}

function handleInvoke(event) {
    console.log('invoke');
}

( async function main() {
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    console.log('hello from extension');

    console.log('register');
    const extensionId = await register();
    console.log('extensionId', extensionId);

    // execute extensions logic

    while (true) {
        console.log('next');
        const event = await next(extensionId);
        switch (event.eventType) {
            case EventType.SHUTDOWN:
                handleShutdown(event);
                break;
            case EventType.INVOKE:
                handleInvoke(event);
                break;
            default:
                throw new Error('unknown event: ' + event.eventType);
        }
    }
})();

```




