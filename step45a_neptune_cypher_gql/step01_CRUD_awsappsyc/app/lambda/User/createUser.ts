const axios = require('axios');
const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';


const { nanoid } = require('nanoid');
import User from './type';


async function createUser(user: User) {
    let query = `CREATE (:user {id: '${nanoid()}', name: '${user.name}', age: ${user.age}})`;


    try {
        await axios.post(url, `query=${query}`);
        return user.name;
    }
    catch (err) {
        console.log('ERROR', err);
        return null;
    }
}

export default createUser;