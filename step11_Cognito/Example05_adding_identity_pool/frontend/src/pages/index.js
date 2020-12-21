import React, {useEffect, useState} from "react"
import {AmplifyAuthenticator, AmplifySignOut} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Storage } from "aws-amplify";

export default function Home() {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();
  const [file, setFile] = useState({});


  useEffect(() => {
      onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });

  }, []);

  console.log("Auth State ", authState);
  console.log(user);
  console.log(file);

  const s3Upload = async (attach) => {
    const filename = `${Date.now()}-${attach.name}`;
    try{
      const stored = await Storage.vault.put(filename, attach, {
        contentType: attach.type,
      });
      return stored.key;
    }
    catch(err){
      console.log("Error while upload ", err)
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const s3 = await s3Upload(file);
      console.log(s3);
    }
    catch(err){
      console.log("Error", err);
    }
  }

  return (
    <div>
      <h1>My Awesome App with Cognito <span role="img" aria-label="label">🚀</span></h1>
      { 
        authState === AuthState.SignedIn && user ? 
        <>
          <AmplifySignOut />
          <hr></hr>
          <br/>
          <form onSubmit={handleSubmit}>
              <input type="file" id="file" name="file" onChange={(e) => setFile(e.target.files[0])}/>
              <button type="submit">upload</button>
          </form>
        </>
        :
          <AmplifyAuthenticator usernameAlias="email"/>
      }
    </div>
  )
}
