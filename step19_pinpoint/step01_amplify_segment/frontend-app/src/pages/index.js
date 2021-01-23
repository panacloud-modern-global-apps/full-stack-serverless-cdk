import React, { useState } from "react"
import Analytics from '@aws-amplify/analytics';
import Auth from '@aws-amplify/auth';
import { navigate } from "gatsby";


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

export default function Home() {
  Analytics.updateEndpoint({
    userAttributes: {
      interests: ['football', 'basketball', 'AWS']
      // ...
    },
    attributes: {
      // Custom attributes that your app reports to Amazon Pinpoint. You can use these attributes as selection criteria when you create a segment.
      hobbies: ['piano', 'hiking'],
  },
  })
    Analytics.record({
      name: 'Home',
      attributes: { genre: 'Rock', year: '1989' }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("")
  return (
    <div>
      <div>
        Hello world!
      </div>
      <div>
        <label>Name: <input type="text" onChange={(e)=>setName(e.target.value)} /></label><br/>
        <label>Email: <input type="text" onChange={(e)=>setEmail(e.target.value)} /></label>
      </div>
      <div>
        <button onClick={()=>{
            console.log("Button clicked sending record");
            Analytics.record({
              name: 'ButtonClickedHome',
              attributes: { name: name, email: email }
            });
        }}>Click Here</button>
      </div>
      <div>
        <button onClick={()=>{
            console.log("Button clicked sending record");
            Analytics.record({
              name: 'MoveToPage2',
              attributes: { name: 'Page2Movement' }
            });
            navigate('/page2');
        }}>Go to Page 2</button>
      </div>
    </div>
  )
}
