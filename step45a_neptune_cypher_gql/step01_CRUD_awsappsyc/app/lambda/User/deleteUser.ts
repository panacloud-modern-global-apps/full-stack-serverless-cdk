const axios = require('axios');
const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';


async function deleteUser(id: string) {
    let query = `MATCH (n: user {id: '${id}'}) DETACH DELETE n`;


    try {
        await axios.post(url, `query=${query}`);
        return id;
    }
    catch (err) {
        console.log('ERROR', err);
        return null;
    }
}

export default deleteUser;