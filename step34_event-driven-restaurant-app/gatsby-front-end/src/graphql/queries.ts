
export const getTimeSlots = /* GraphQL */ `
  query GetTimeSlots {
    getTimeSlots {
      id
      from
      to
      isBooked
      isBookingRequested
      bookingRequestBy
      bookedBy
    }
  }
`;
