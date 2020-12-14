import React from "react"
import Amplify from "aws-amplify"
import awsmobile from "../aws-exports"

export default function amplifyClient({ children }) {
  Amplify.configure(awsmobile)

  return <div>{children}</div>
}