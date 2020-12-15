import React, {useEffect} from "react"
import {AmplifyAuthenticator, AmplifySignOut} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

export default function Home() {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();
  useEffect(() => {
      onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });
  }, []);

  return (
    <div>
      <h1>My Awesome App with Cognito <span role="img" aria-label="label">🚀</span></h1>
      { 
        authState === AuthState.SignedIn && user ? 
          <AmplifySignOut />
        :
          <AmplifyAuthenticator usernameAlias="email"/>
      }
    </div>
  )
}
