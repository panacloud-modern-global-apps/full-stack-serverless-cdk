import { APIGatewayProxyEvent } from "aws-lambda";
const randomWords = require("random-words");

exports.handler = async (event: APIGatewayProxyEvent) => {
  // Generating random word
  const myWord = randomWords();
  return myWord;
};
