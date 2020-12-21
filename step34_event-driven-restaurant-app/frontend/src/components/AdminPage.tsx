import React, { FC, useEffect, useState } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { CognitoUser } from '../pages/index';
import { onGenerateAction } from '../graphql/subscriptions';
import { getTimeSlots } from '../graphql/queries';
import { generateAction, deleteBookingRequest, addTimeSlot, bookTimeSlot } from "../graphql/mutations";


//////////////////////////////  COMPONENT ///////////////////////////////
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

const AdminPage: FC<{ user: CognitoUser }> = ({user}) => {
    const subscription = API.graphql(graphqlOperation(onGenerateAction)) as any;
    const [to, setTo] = useState("");
    const [from, setFrom] = useState("");
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false);

    const handleSubscription = () => {
        subscription.subscribe({
            next: (status) => {   // when mutation will run the next will trigger
                console.log("New SUBSCRIPTION ==> ", status.value.data);
                getAllTimeSlots();
            },
        })
    }

    const handleGenerateAction = async (action: Action, timeSlotId: string) => {
        try {
            const data = await API.graphql({
                query: generateAction,
                variables: { timeSlotId, userName: user.username, action },
            })
        } catch (e) { console.log("ERROR in generate action mutation", e) }
    }
    

    useEffect(() => {
        handleSubscription();
        getAllTimeSlots();
    }, [])

    const getAllTimeSlots = async () => {
        setLoading(true);
        setTimeSlots([])
        try {
            const data = await API.graphql({ query: getTimeSlots, }) as incomingData
            console.log(data);
            setTimeSlots(data.data.getTimeSlots);
            setLoading(false);
        } catch (e) { console.log("ERROR in get time slot querry", e); setLoading(false); }
    }

    const sendData = async () => {
        try{
            const data = await API.graphql({
                query: addTimeSlot,
                variables: { timeSlot: {
                    from,
                    to
                } },
            })
            setTo("");
            setFrom("");
        }
        catch(err){
            console.log("Error", err)
        }
    }

    const accept = async (id: string) => {
        try{
            const data = await API.graphql({
                query: bookTimeSlot,
                variables: {
                    id
                }
            })
            console.log(data);
            getAllTimeSlots();
            handleGenerateAction("ACCEPT_BOOKING", id);
        }
        catch(err){
            console.log("accepting Error", err);
        }
    }

    const reject = async (id: string) => {
        try{
            const data = await API.graphql({
                query: deleteBookingRequest,
                variables: {
                    id
                }
            })
            console.log(data);
            getAllTimeSlots();
            handleGenerateAction("REJECT_BOOKING", id);
        }
        catch(err){
            console.log("accepting Error", err);
        }
    }

    return (
        <div style={{ width: '1080px' }}>
            <h1>ADMIN DASHBOARD</h1>
            <input type="text" placeholder="from" name="from" value={from} onChange={(e) => setFrom(e.target.value)}/>
            <input type="text" placeholder="to" name="to" value={to} onChange={(e) => setTo(e.target.value)}/>
            <button type="button" onClick={sendData}>Add</button>
            <br/>
            <br/>
            <h1>Booking Requests</h1>
            <br/>
            <br/>
            {
                loading && <div>Fetching Available Time Slots....</div> ||
                <table>
                    <thead>
                        <tr>
                            <th>from</th>
                            <th>to</th>
                            <th>Requested By</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        timeSlots.map((timeSlot) => (
                            timeSlot.isBookingRequested &&
                            <tr key={timeSlot.id}>
                                <td>{timeSlot.from}</td>
                                <td>{timeSlot.to}</td>
                                <td>{timeSlot.bookingRequestBy}</td>
                                <td>
                                    <button type="button" onClick={() => accept(timeSlot.id)}>Accept</button>
                                    <button type="button" onClick={() => reject(timeSlot.id)}>Reject</button>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            }
            <br/>
            <br/>
            <h1>Today's Booking</h1>
            <br/>
            <br/>
            {
                loading && <div>Fetching Available Time Slots....</div> ||
                <table>
                    <thead>
                        <tr>
                            <th>from</th>
                            <th>to</th>
                            <th>booked By</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        timeSlots.map((timeSlot) => (
                            timeSlot.bookedBy &&
                            <tr key={timeSlot.id}>
                                <td>{timeSlot.from}</td>
                                <td>{timeSlot.to}</td>
                                <td>{timeSlot.bookedBy}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            }
        </div>
    )
}

export default AdminPage;
