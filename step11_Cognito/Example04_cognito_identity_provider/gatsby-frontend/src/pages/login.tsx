import React, { useState, useEffect } from "react"

export default function Login({ location }) {
  const queryParam = location.search
  const [user, setUser] = useState<any>("noUser")

  const clientId = "5ru8qbeo04btvt7nrtr6m7hfr8"
  const grant_type = "authorization_code"
  const code = queryParam.substring(6)
  const redirectUrl = "https://d3jucht95kbbhm.cloudfront.net/login/"
  const logoutUrl = "https://d3jucht95kbbhm.cloudfront.net"
  const clientSecret = "krsg9gnee2ub879pjt3pkqn20kissg07t0j4v4inbbe3esn3j59"

  useEffect(() => {
    const stored_token = sessionStorage.getItem("access_token")
    if (!!stored_token) {
      fetchUserDetails(stored_token)
    } else {
      fetchTokens()
    }
  }, [])

  function fetchTokens() {
    const authData = btoa(`${clientId}:${clientSecret}`)

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authData}`,
      },
    }
    fetch(
      `https://my-awesome-app.auth.us-west-1.amazoncognito.com/oauth2/token?grant_type=${grant_type}&code=${code}&client_id=${clientId}&redirect_uri=${redirectUrl}`,
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
    fetch(
      `https://my-awesome-app.auth.us-west-1.amazoncognito.com/oauth2/userInfo`,
      requestOptions
    )
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
    window.location.href = `https://my-awesome-app.auth.us-west-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUrl}`

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
