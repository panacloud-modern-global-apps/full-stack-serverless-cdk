const axios = require('axios');

exports.handler = async (event: any, context: any) => {
    const result = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    return result.data;
}