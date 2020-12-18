import React from "react"

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={() => {
          window.location.href =
            "https://my-awesome-app.auth.us-west-1.amazoncognito.com/login?client_id=5ru8qbeo04btvt7nrtr6m7hfr8&response_type=code&scope=email+openid&redirect_uri=https://d3jucht95kbbhm.cloudfront.net/login/"
        }}
      >
        Login
      </button>
    </div>
  )
}
