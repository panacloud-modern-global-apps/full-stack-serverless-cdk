import { APIGatewayEvent } from "aws-lambda";

exports.handler = async (event: APIGatewayEvent) => {
  return {
    status: 200,
    body: "Hello World",
  };
};
