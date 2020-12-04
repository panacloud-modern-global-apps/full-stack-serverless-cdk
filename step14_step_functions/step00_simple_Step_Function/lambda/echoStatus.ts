type event = {
  operationSuccessful: Boolean;
};

module.exports.handler = function (event: event) {
  console.log(event);

  if (event.operationSuccessful) {
    console.log("The data was added successfully");
  } else {
    console.log("The data was not added to the database");
  }
};
