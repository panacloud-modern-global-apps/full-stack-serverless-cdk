const randomWords = require("random-words");

exports.handler = async (event) => {
  // Generating random word
  console.log(event)
  const myWord = randomWords();
  return myWord;
};
