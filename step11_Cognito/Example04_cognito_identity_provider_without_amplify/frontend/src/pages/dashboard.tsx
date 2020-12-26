import React, { useState, useEffect } from "react"
import config from "../config"

export default function Dashboard({ location }) {
  const queryParam = location.search
  const [user, setUser] = useState<any>("noUser")

  const code = queryParam.substring(6)
  console.log(code)

  console.log(location)

  useEffect(() => {
    const stored_token = sessionStorage.getItem("access_token")
    if (!!stored_token) {
      fetchUserDetails(stored_token)
    } else {
      fetchTokens()
    }
  }, [])

  function fetchTokens() {
    const authData = btoa(`${config.clientId}:${config.clientSecret}`)

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authData}`,
      },
    }
    fetch(
      `${config.domainUrl}/oauth2/token?grant_type=${config.grant_type}&code=${code}&client_id=${config.clientId}&redirect_uri=${config.loginRedirectUri}`,
      requestOptions
    )
      .then(response => response.json())
      .then(data => {
        sessionStorage.setItem("access_token", data.access_token)

        fetchUserDetails(data.access_token)
      })
  }

  function fetchUserDetails(accessToken: string) {
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
    fetch(`${config.domainUrl}/oauth2/userInfo`, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data)

        if (!!data.username) {
          setUser(data)
        } else {
          setUser(null)
        }
      })
  }

  const logout = () => {
    window.location.href = `${config.domainUrl}/logout?client_id=${config.clientId}&logout_uri=${config.logoutUri}`

    sessionStorage.removeItem("access_token")
  }

  return (
    <div>
      {user === "noUser" ? (
        <h2>Loading</h2>
      ) : !user ? (
        <h2>Error</h2>
      ) : (
        <div>
          <h2>You are logged in as: {user.username}</h2>
          <button onClick={() => logout()}>Logout</button>
        </div>
      )}
    </div>
  )
}
