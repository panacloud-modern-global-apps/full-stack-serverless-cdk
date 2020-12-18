
// generateAction(timeSlotId: ID!, userName:String!, action:ACTIONS): ResponseOutput
export const generateAction = `
mutation  GenerateAction($action: ACTIONS!, $timeSlotId: String!, $userName:String! ){
  generateAction(action:$action, timeSlotId:$timeSlotId, userName:$userName){
    action
    userName
    timeSlotId
  }
}
`;

// addBookingRequest(id: ID!, userName:String!): Event
export const addBookingRequest = `
mutation addBookingRequest($id: ID!, $userName:String!){
  addBookingRequest(id: $id, userName: $userName){
    result
  }
}
`