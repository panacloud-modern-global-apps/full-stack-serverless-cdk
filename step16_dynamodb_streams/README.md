# DynamoDB Streams

## Sources
- [DynamoDB Streams Use Cases and Design Patterns - 2017](https://aws.amazon.com/blogs/database/dynamodb-streams-use-cases-and-design-patterns/#:~:text=DynamoDB%20Streams%20is%20a%20powerful,for%20up%20to%2024%20hours.)
- [AWS Docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
- [Example use cases video](https://www.youtube.com/watch?v=OjppS4RWWt8)
## Introduction

Streams stores all updates made to records in a dynamodb table for upto 24 hours. It also keeps track of the order in which the updates were made.

There are 4 options regarding what information is stored in the stream. This is called `view type`:
1. KEYS_ONLY
2. NEW_IMAGE
3. OLD_IMAGE
4. NEW_AND_OLD_IMAGES