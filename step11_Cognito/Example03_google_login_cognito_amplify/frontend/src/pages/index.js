import React, { useEffect, useState } from 'react';
import Amplify, { Auth, Hub } from 'aws-amplify';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then(userData => { setUser(userData); console.log("Signed In:", userData) });
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
  }

  return (


    <main style={{ display: "grid", placeItems: "center", height: "100%" }}>

      {user ? (
        <div>
          <button onClick={() => Auth.signOut()}><h1>Sign out</h1></button>
          <h1>User Data object:</h1>
          <div style={{ width: "700px", height: "70vh", overflow: "scroll" }}>
            <pre>User: {JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      ) : (
          <div>
            <h1>No User Logged In.</h1>
            <button onClick={() => Auth.federatedSignIn({ provider: "Google" })}>Sign In with Google</button>
          </div>
        )}
    </main>

  );
}

export default App;