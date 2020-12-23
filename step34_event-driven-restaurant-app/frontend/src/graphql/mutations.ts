
// generateAction(timeSlotId: ID!, userName:String!, action:ACTIONS): ResponseOutput
export const generateAction = /* GraphQL */ `
  mutation  GenerateAction($timeSlotId: ID!, $userName:String!, $action: ACTIONS){
    generateAction(timeSlotId:$timeSlotId, userName:$userName, action:$action){
      action
      userName
      timeSlotId
    }
  }
`;

// addBookingRequest(id: ID!, userName:String!): Event
export const addBookingRequest = /* GraphQL */ `
mutation addBookingRequest($id: ID!, $userName:String!){
  addBookingRequest(id: $id, userName: $userName){
    result
  }
}
`


export const bookTimeSlot = /* GraphQL */ `
mutation bookTimeSlot($id: ID!){
  bookTimeSlot(id: $id){
    result
  }
}
`

export const deleteBookingRequest = /* GraphQL */ `
mutation deleteBookingRequest($id: ID!){
  deleteBookingRequest(id: $id){
    result
  }
}
`

export const addTimeSlot = /* GraphQL */ `
mutation addTimeSlot($timeSlot: InputTimeSlot!){
  addTimeSlot(timeSlot: $timeSlot){
    result
  }
}
`