# Kinesis 

Amazon Kinesis makes it easy to collect, process, and analyze real-time, streaming data so you can get timely insights and react quickly to new information. Amazon Kinesis offers key capabilities to cost-effectively process streaming data at any scale, along with the flexibility to choose the tools that best suit the requirements of your application. With Amazon Kinesis, you can ingest real-time data such as video, audio, application logs, website clickstreams, and IoT telemetry data for machine learning, analytics, and other applications. Amazon Kinesis enables you to process and analyze data as it arrives and respond instantly instead of having to wait until all your data is collected before the processing can begin.

# Shard (data partitions)

Shard is the base throughput unit of an Amazon Kinesis data stream. You specify the number of shards needed within your stream based on your throughput requirements. You are charged for each shard at an hourly rate.


# Important Features

- kinesis is a managed alternative to Apache kafka
- great for application logs, metrics, IoT, clickstreams
- great for 'real-time' big data
- great for streaming processing frameworks (Spark NiFi, etc)
- streams are divided in ordered Shard/ Partitions
- Data Retentaion is 24 hours by default, max can go up to 7 days
- data can be reprocessed
- Multiple applications can consume the same stream
- Real time processing with scale of throughput
- Once data is inserted in Kinesis it can't be deleted (immutable)

# Billing
- One stream is made of many different shards
- Billing is per shard provisioned
- Batching available or per message calls
- the number of shards can evolve over time (reshard/ merge)
- records are ordered per shard
