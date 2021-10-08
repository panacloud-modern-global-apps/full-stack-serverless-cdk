const axios = require('axios');
const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';


async function allUsers() {
    let query = `MATCH (n:user) RETURN n`;


    try {
        const fetch = await axios.post(url, `query=${query}`);


        const result = JSON.stringify(fetch.data.results);
        const data = JSON.parse(result);


        let modifiedData = Array();
        for(const [i, v] of data.entries()) {         //for each vertex
            let obj = {
                "id":   data[i].n['~id'],
                     ...data[i].n['~properties']
            };

            modifiedData.push(obj);
        }


        return modifiedData;
    }
    catch (err) {
        console.log('ERROR', err);
        return null;
    }
}

export default allUsers;