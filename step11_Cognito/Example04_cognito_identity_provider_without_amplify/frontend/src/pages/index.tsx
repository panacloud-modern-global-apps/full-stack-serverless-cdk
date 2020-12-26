import React from "react"
import config from "../config"

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={() => {
          window.location.href = `${config.domainUrl}/login?client_id=${config.clientId}&response_type=code&scope=email+openid&redirect_uri=${config.loginRedirectUri}`
        }}
      >
        Login
      </button>
    </div>
  )
}
