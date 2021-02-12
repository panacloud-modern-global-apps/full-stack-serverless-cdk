# Lambda Extension
![AWS WAF Diagram](lambda_ext.png)
[Lambda Extensions](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-extensions-in-preview/) help solve a common request from customers to make it easier to integrate their existing tools with Lambda. Previously, customers told us that integrating Lambda with their preferred tools required additional operational and configuration tasks. In addition, tools such as log agents, which are long-running processes, could not easily run on Lambda. 
Extensions are a new way for tools to integrate deeply into the Lambda environment. There is no complex installation or configuration, and this simplified experience makes it easier for you to use your preferred tools across your application portfolio today. You can use extensions for use-cases such as:

* Capturing diagnostic information before, during, and after function invocation
* Automatically instrumenting your code without needing code changes
* Fetching configuration settings or secrets before the function invocation
* Detecting and alerting on function activity through hardened security agents, which can run as separate processes from the function

## AWS Lambda Ready Partners extensions available at launch
Today, you can use extensions with the following AWS and AWS Lambda Ready Partner’s tools, and there are more to come:
* AppDynamics
* Check Point
* Datadog
* Dynatrace
* Epsagon
* HashiCorp Vault
* Lumigo
* New Relic 
* Thundra
* AWS AppConfig
* Amazon CloudWatch Lambda Insights

## Extensions can run in either of two modes – internal and external.

* Internal extensions allow you to configure the runtime environment and modify the startup of the runtime process. Internal extensions use language-specific environment variables and wrapper scripts, and start and shut down within the runtime process. Internal extensions run as separate threads within the runtime process, which starts and stops them.

* An external extension runs as an independent process in the execution environment and continues to run after the function invoke is fully processed. An external extension must register for the Shutdown event, which triggers the extension to shut down. Because external extensions run as processes, you can write them in a different language than the function.

## Lambda Extensions API
The Extensions API builds on the existing Runtime API, which provides an HTTP API for custom runtimes to receive invocation events from Lambda. As an extension author, you can use the Extensions API to register for function and execution environment lifecycle events. In response to these events, you can start new processes or run logic.

![AWS WAF Diagram](ext-env.png)

## Key Points to remember in development of Lambda Extension

* We will deploy Lambda Extension as lambda layers.
* Give Name extensions to folder of lambda layer so it will automatically pick it as extension.
* Lambda look only for one file in your extension folder so we will be using shell script file.In shell script file we will provide location about our extension

## Referance Articles
[Introducing AWS Lambda Extensions](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-extensions-in-preview/)

[AWS Lambda Logs API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-logs-api.html)

[Lambda Extensions API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html)

[Using Lambda extensions](https://docs.aws.amazon.com/lambda/latest/dg/using-extensions.html)

[Building Extensions for AWS Lambda](https://aws.amazon.com/blogs/compute/building-extensions-for-aws-lambda-in-preview/)

[Easily integrate Lambda Extensions with your favorite observability and security tools](https://www.youtube.com/watch?v=6XIIKSJpMIQ&ab_channel=ServerlessLand)

[AWS This Week: AWS Lambda Extensions, AWS Architecture Center redesign, and more!](https://www.youtube.com/watch?v=Kd9OQWJCpV4&ab_channel=ACloudGuru)
[What are AWS Lambda Extensions and How It will Foster Serverless?](https://blog.thundra.io/what-are-aws-lambda-extensions-and-how-it-will-foster-serverless)
[AWS Lambda Extensions: What are they and why do they matter](https://lumigo.io/blog/aws-lambda-extensions-what-are-they-and-why-do-they-matter/)

### Read all Articles carefully