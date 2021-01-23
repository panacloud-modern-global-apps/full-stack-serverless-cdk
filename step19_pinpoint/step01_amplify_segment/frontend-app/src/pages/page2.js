import React from "react"
import Analytics from '@aws-amplify/analytics';
import Auth from '@aws-amplify/auth';


const amplifyConfig = {
  Auth: {
    identityPoolId: 'COGNITO_IDENTITY_POOL_ID',
    region: 'us-west-2'
  }
}
//Initialize Amplify
Auth.configure(amplifyConfig);

const analyticsConfig = {
  AWSPinpoint: {
        // Amazon Pinpoint App Client ID
        appId: 'PINPOITN_PROJECT_ID', // change it to your project id
        // Amazon service region
        region: 'us-west-2',
        mandatorySignIn: false,
  }
}

Analytics.configure(analyticsConfig)

export default function Page2() {
    Analytics.record({
      name: 'Page',
      attributes: { genre: 'Rock', year: '1920' }
  });
  return (
    <div>
      <div>
        We are on Page 2 detection
      </div>
      <div>
        <button onClick={()=>{
            console.log("Button clicked sending record");
            Analytics.record({
              name: 'Page2ButtonClickedHome',
              attributes: { name: 'SubmitDataNew' }
            });
        }}>Click Here for Page 2 Event</button>
      </div>
    </div>
  )
}
