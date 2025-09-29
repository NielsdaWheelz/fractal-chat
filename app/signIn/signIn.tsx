import { useState } from "react"
import { Form } from "react-router"
import { emailSignIn, googleSignIn } from "~/utils/auth-client"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [accessToken, setAccessToken] = useState("")

  return (
    <>
      <h1>
        Sign In
      </h1>
      <Form onSubmit={() => {emailSignIn(email, password)}}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"/>
        <button type="submit">Sign In</button>
      </Form>
      <Form onSubmit={() => {googleSignIn(token, accessToken)}}>
        <button type="submit">Sign In With Google</button>
      </Form>
    </>
  )
}

export default SignIn