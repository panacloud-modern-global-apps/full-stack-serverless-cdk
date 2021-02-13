AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "us-west-1:ba886766-af41-4d4b-881b-1830f2d1ac67",  
});

AWS.config.region = "us-west-1";
// We're going to partition Amazon Kinesis records based on an identity.
// We need to get credentials first, then attach our event listeners.
AWS.config.credentials.get(function (err) {
  // attach event listener
  if (err) {
    alert("Error retrieving credentials.");
    console.error(err);
    return;
  }
  else{
    console.log("credentials retrieve successfully....")
  }
  
  // create Amazon Kinesis service object
  const kinesis = new AWS.Kinesis({
    apiVersion: "2013-12-02",
  });
  
  // Get the ID of the Web page element.
  const blogContent = window.document.getElementById("BlogContent");

  // Get Scrollable height
  const scrollableHeight = blogContent.clientHeight;

  let recordData = [];
  let TID = null;
  blogContent.addEventListener("click", function (event) {
    
    clearTimeout(TID);
    // Prevent creating a record while a user is actively scrolling
    TID = setTimeout(function () {
      // calculate percentage
      const scrollableElement = event.target;
      const scrollHeight = scrollableElement.scrollHeight;
      const scrollTop = scrollableElement.scrollTop;

      const scrollTopPercentage = Math.round((scrollTop / scrollHeight) * 100);
      const scrollBottomPercentage = Math.round(
        ((scrollTop + scrollableHeight) / scrollHeight) * 100
      );

      // Create the Amazon Kinesis record
      console.log("create record..")
      const record = {
        Data: JSON.stringify({
          blog: window.location.href,
          scrollTopPercentage: scrollTopPercentage,
          scrollBottomPercentage: scrollBottomPercentage,
          time: new Date(),
        }),
        PartitionKey: "partition-" + AWS.config.credentials.identityId,
      };
      recordData.push(record);
    }, 100);
  });
  
  // upload data to Amazon Kinesis every second if data exists
  setInterval(function () {
    if (!recordData.length) {
      return;
    }
    // upload data to Amazon Kinesis
    console.log("upload data to kinesis")
    kinesis.putRecords(
      {
        Records: recordData,
        StreamName: "my-first-stream",
      },
      function (err, data) {
        if (err) {
          console.error(err);
        }
        else{
          console.log("data: ", data)
        }
      }
    );
    // clear record data
    recordData = [];
  }, 5000);
  
});
