import { APIGatewayEvent } from "aws-lambda";

exports.handler = async (event: APIGatewayEvent) => {
  return {
    statusCode: 200,
    body: "Hello World",
  };
};
