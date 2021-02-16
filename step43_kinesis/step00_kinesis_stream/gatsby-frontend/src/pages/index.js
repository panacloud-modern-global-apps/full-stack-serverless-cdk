import React from "react"
import config from '../aws-exports'

var AWS = require('aws-sdk');
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: config.aws_cognito_identity_pool_id,  
});

AWS.config.region = config.aws_project_region;


export default function Home() {
    
  // Set Scrollable height
  const scrollableHeight = 400;    
  let recordData = [];
  let TID = null;

  function callme(event) {      
      const scrollableElement = event.target;
      clearTimeout(TID);
      // Prevent creating a record while a user is actively scrolling
      TID = setTimeout(function () {
      
        // calculate percentage        
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
            urlSite: window.location.href,
            scrollTopPercentage: scrollTopPercentage,
            scrollBottomPercentage: scrollBottomPercentage,
            time: new Date(),
          }),
          PartitionKey: "partition-" + AWS.config.credentials.identityId,
        };
        recordData.push(record);
      }, 100);  
  }

  // get credentials
  AWS.config.credentials.get(function (err) {    
  if (err) {
    alert("Error retrieving credentials.");
    console.error(err);
    return;
  }
  else{
    console.log("credentials retrieved successfully....")
  }
  
  // create Amazon Kinesis service object
  const kinesis = new AWS.Kinesis({
    apiVersion: "2013-12-02",
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
          StreamName: config.aws_stream_name,
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
    }, 2000);
    
  })    
  return (
    <>
    <h1 style={{textAlign:'center'}}>Scroll the text to generate data and send to stream!</h1>    
    <div id="para" style={{width: 800, height: 400, border:'solid 2px #6200ff', overflow: 'auto', margin: 'auto', textAlign: 'center'}} onScroll={callme} >
        <div style={{width: 800, height: 800}}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae nulla eget nisl bibendum feugiat. Fusce rhoncus felis at ultricies luctus. Vivamus fermentum cursus sem at interdum. Proin vel lobortis nulla. Aenean rutrum odio in tellus semper rhoncus. Nam eu felis ac augue dapibus laoreet vel in erat. Vivamus vitae mollis turpis. Integer sagittis dictum odio. Duis nec sapien diam. In imperdiet sem nec ante laoreet, vehicula facilisis sem placerat. Duis ut metus egestas, ullamcorper neque et, accumsan quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
          </p>                
        </div>
    </div>
  </>
)}
