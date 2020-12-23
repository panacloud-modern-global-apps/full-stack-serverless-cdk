import React, { FC, useState } from 'react';
import { API, graphqlOperation, Auth } from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange, CognitoUserInterface } from '@aws-amplify/ui-components';
import { onGenerateAction } from '../graphql/subscriptions';
import { AdminPage, CustomerPage } from '../components';
import { PageProps } from 'gatsby';

// import awsconfig from '../aws-exports';
// Amplify.configure(awsconfig);

export interface CognitoUser extends CognitoUserInterface {
    signInUserSession?: {
        accessToken?: {
            jwtToken?: string,
            payload?: {
                ["cognito:groups"]?: string[],
                username?: string,
            }
        },
        idToken?: object,
        refreshToken?: object,
    }
}


//////////////////////////////  COMPONENT ///////////////////////////////

const AuthStateApp: FC<PageProps> = () => {
    const [authState, setAuthState] = useState<AuthState>();
    const subscription = API.graphql(graphqlOperation(onGenerateAction)) as any;
    const [user, setUser] = useState<CognitoUser>();
    const userGroup = user?.signInUserSession?.accessToken?.payload?.['cognito:groups'];

    if (!!user) {
        console.log(user);
    }

    const handleSubscription = () => {
        subscription.subscribe({
            next: (status) => {   // when mutation will run the next will trigger
                console.log("New SUBSCRIPTION ==> ", status.value.data);
            },
        })
    }

    React.useEffect(() => {
        onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData as CognitoUser)
        });
        handleSubscription();
    }, []);

    return authState === AuthState.SignedIn && user ? (
        <div className="App">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                <h3>Logged in User: {user.username}</h3>
                <button onClick={() => { Auth.signOut() }} >sign out</button>
            </div>
            {
                userGroup && userGroup.findIndex((arr) => arr === "admins") !== -1 ?
                    <AdminPage user={user} /> :
                    <CustomerPage user={user} />
            }
        </div>
    ) : (
            <AmplifyAuthenticator />
        );
}

export default AuthStateApp;