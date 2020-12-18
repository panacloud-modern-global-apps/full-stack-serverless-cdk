import React, { FC, useEffect } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { CognitoUser } from '../pages/index';
import { onGenerateAction } from '../graphql/subscriptions';
import { generateAction } from "../graphql/mutations";


//////////////////////////////  COMPONENT ///////////////////////////////

const AdminPage: FC<{ user: CognitoUser }> = ({user}) => {
    const subscription = API.graphql(graphqlOperation(onGenerateAction)) as any;

    const handleSubscription = () => {
        subscription.subscribe({
            next: (status) => {   // when mutation will run the next will trigger
                console.log("New SUBSCRIPTION ==> ", status.value.data);
            },
        })
    }

    useEffect(() => {
        handleSubscription();
    }, [])

    return (
        <div style={{ width: '1080px' }}>
            <h1>ADMIN DASHBOARD</h1>

        </div>
    )
}

export default AdminPage;
