import React from "react"
import AmplifyClient from "./client"

export const wrapRootElement = ({ element }) => {
    return (
        <AmplifyClient>
            {element}
        </AmplifyClient>
    )
}