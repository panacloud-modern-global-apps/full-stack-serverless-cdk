const faker = require('faker');

exports.lambdaHandler = async (event: any) => {
  const randomName = faker.name.findName();
  console.log(randomName)

  const response = {
    statusCode: 200,
    body: randomName,
  };
  return response;
};
