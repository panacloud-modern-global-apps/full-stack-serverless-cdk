const random_name = require('/opt/randomName');
const axios = require('axios');

exports.handler = async (event: any, context: any) => {

    const name = random_name.getName();
    const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

    console.log("Random Name ==>", name);
    console.log("Random Fetch ==>", result.data);

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: {
            randomName: name,
            randomFetch: result.data,
        },
    }

}
