const randomName = require('node-random-name');

exports.getName = () => {
    return randomName();
};