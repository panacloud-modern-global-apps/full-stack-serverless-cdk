const { DynamoDB } = require("aws-sdk");

exports.handler = async (event: any) => {
  const dynamo = new DynamoDB();

  var generateId = Date.now();
  var idString = generateId.toString();

  const params = {
    TableName: process.env.DynamoTable,
    Item: {
      id: { S: idString },
      message: { S: event.detail.event },
    },
  };
  try {
    await dynamo.putItem(params).promise();
    return { operationSuccessful: true };
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return { operationSuccessful: false };
  }
};
