import React, { FC, useEffect, useState } from 'react'
import { getTimeSlots } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { onGenerateAction } from '../graphql/subscriptions';
import { CognitoUser } from '../pages/index';
import { generateAction, addBookingRequest } from "../graphql/mutations";

interface TimeSlot {
    id: string
    from: string
    to: string
    isBooked: boolean
    isBookingRequested: boolean
    bookedBy: string
    bookingRequestBy: string
}
interface incomingData {
    data: {
        getTimeSlots: TimeSlot[]
    }
}
type Action = "ACCEPT_BOOKING" | "REJECT_BOOKING" | "REQUEST_BOOKING"

//////////////////////////////  COMPONENT ///////////////////////////////

const CustomerPage: FC<{ user: CognitoUser }> = ({ user }) => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false);
    const subscription = API.graphql(graphqlOperation(onGenerateAction)) as any;

    console.log(timeSlots);

    const getAllTimeSlots = async () => {
        setLoading(true);
        try {
            const data = await API.graphql({ query: getTimeSlots, }) as incomingData
            setTimeSlots(data.data.getTimeSlots);
            setLoading(false);
        } catch (e) { console.log("ERROR in get time slot querry", e); setLoading(false); }
    }

    const handleGenerateAction = async (action: Action, timeSlotId: string) => {
        try {
            const data = await API.graphql({
                query: generateAction,
                variables: { timeSlotId, userName: user.username, action },
            })
        } catch (e) { console.log("ERROR in generate action mutation", e) }
    }

    const handleBookingRequest = async (id: string) => {
        try {
            const data = await API.graphql({
                query: addBookingRequest,
                variables: { id, userName: user.username },
            })
            getAllTimeSlots();
            handleGenerateAction("REQUEST_BOOKING", id);
        } catch (e) { console.log("ERROR in addBookingRequest mutation", e) }
    }

    const handleSubscription = () => {
        subscription.subscribe({
            next: (status) => {   // when mutation will run the next will trigger
                console.log("New SUBSCRIPTION ==> ", status.value.data);
                getAllTimeSlots();
            },
        })
    }

    useEffect(() => {
        getAllTimeSlots(); // fetching data for the first time
        handleSubscription();
    }, [])

    return (
        <div style={{ maxWidth: '1080px' }}>
            <h1>CUSTOMER DASHBOARD</h1>
            <h2>Available Time Slots</h2>
            <br /><br />
            {
                loading && <div>Fetching Available Time Slots....</div> ||
                timeSlots.map((timeSlot) => (
                    <div key={timeSlot.id}>
                        <span style={{ background: `${timeSlot.isBooked ? "red" : "green"}`, color: 'white' }} >
                            {timeSlot.from} - {timeSlot.to}
                        </span>
                        {
                            !timeSlot.isBooked ?
                            (timeSlot && timeSlot.isBookingRequested
                            ?
                            <button
                                disabled={true}
                            >
                                Already Requested
                            </button>
                            :
                            <button
                                onClick={() => { handleBookingRequest(timeSlot.id) }}
                            >
                                Book Time Slot
                            </button>)
                            :
                            <button
                                disabled={true}
                            >
                                Booked
                            </button>
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default CustomerPage
