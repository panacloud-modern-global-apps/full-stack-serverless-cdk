## Introduction 
So far we have learned about how to enable X-Ray Tracing in lambda, How to view traces data of different Segments using X-Ray. In this step we are going to learn about more features of X-Ray i.e 
- Subsegments
- Annotations
- Metadata
- Groups

### Subsegments:
A segment can break down the data about the work done into subsegments. Subsegments provide more granular timing information and details about downstream calls that your application made to fulfill the original request. A subsegment can contain additional details about a call to an AWS service, an external HTTP API, or an SQL database. You can even define arbitrary subsegments to instrument specific functions or lines of code in your application.
### Annotations and metadata:
When you instrument your application, the X-Ray SDK records information about incoming and outgoing requests, the AWS resources used, and the application itself. You can add other information to the segment document as annotations and metadata. Annotations and metadata are aggregated at the trace level, and can be added to any segment or subsegment.

**Annotations** are simple key-value pairs that are indexed for use with filter expressions. Use annotations to record data that you want to use to group traces in the console, or when calling the GetTraceSummaries API.


**Metadata** are key-value pairs with values of any type, including objects and lists, but that are not indexed. Use metadata to record data you want to store in the trace but don't need to use for searching traces.

### Groups:
Extending filter expressions, X-Ray also supports the group feature. Using a filter expression, you can define criteria by which to accept traces into the group.

### Resources
- [Subsegments](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-subsegments)
- [Annotations and metadata](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-annotations)
- [Groups](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-groups)

  