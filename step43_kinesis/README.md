# Kinesis Overview

Amazon Kinesis makes it easy to collect, process, and analyze real-time, streaming data so you can get timely insights and react quickly to new information. Amazon Kinesis offers key capabilities to cost-effectively process streaming data at any scale, along with the flexibility to choose the tools that best suit the requirements of your application. With Amazon Kinesis, you can ingest real-time data such as video, audio, application logs, website clickstreams, and IoT telemetry data for machine learning, analytics, and other applications. Amazon Kinesis enables you to process and analyze data as it arrives and respond instantly instead of having to wait until all your data is collected before the processing can begin.

[Further Reading](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-kinesis-readme.html)

[What is Streaming Data?](https://aws.amazon.com/streaming-data/#:~:text=Streaming%20data%20includes%20a%20wide,devices%20or%20instrumentation%20in%20data)


![Optional Text](https://d2908q01vomqb2.cloudfront.net/da4b9237bacccdf19c0760cab7aec4a8359010b0/2018/08/16/diagram-how-it-works-kinesis-data-streams.249630c459ffe210d013ad06a0f6899ebea1304b.png)

# Important Features

- Great for application logs, metrics, IoT, clickstreams
- Great for 'real-time' big data
- Great for streaming processing frameworks (Spark NiFi, etc)
- Streams are divided in ordered Shard/ Partitions
- The number of shards can evolve over time (reshard/ merge)
- Records are ordered per shard
- Data Retentaion is 24 hours by default, max can go up to 7 days
- Data can be reprocessed
- Multiple applications can consume the same stream
- Real time processing with scale of throughput
- Once data is inserted in Kinesis it can't be deleted (immutable)
- Kinesis is a managed alternative to Apache kafka

# Billing
- Please note that kinesis is not a free service
- One stream is made of many different shards
- Billing is per shard provisioned
- [see pricing details here](https://aws.amazon.com/kinesis/data-streams/pricing/)


# AWS Kinesis Capabilities
1. Data Streams to collect and process large amount of data in real time
2. Data Firehose to capture, transform and load streaming data in Buckets, Redshift, or DynamoDB
3. Data Analytics to filter, aggregate and transform streaming data for advanced analytics
4. Video Streams to stream live video from devices to AWS Cloud

# What is Shard? 

Shard is the base throughput unit of an Amazon Kinesis data stream. You specify the number of shards needed within your stream based on your throughput requirements. They are actually data partitions. You are charged for each shard at an hourly rate.
