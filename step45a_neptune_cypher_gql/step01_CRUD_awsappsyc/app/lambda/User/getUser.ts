const axios = require('axios');
const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';


async function getUser(id: string) {
    let query = `MATCH (n:user {id: '${id}'}) RETURN n`;


    try {
        const fetch = await axios.post(url, `query=${query}`);


        const result = JSON.stringify(fetch.data.results);
        const data = JSON.parse(result);


        let modifiedData = {
            "id":   data[0].n['~id'],
                 ...data[0].n['~properties']
        };


        return modifiedData;
    }
    catch (err) {
        console.log('ERROR', err);
        return null;
    }
}

export default getUser;