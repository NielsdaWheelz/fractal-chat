import { useState } from "react"
import { Form } from "react-router"
import { clientEmailSignIn, clientGoogleSignIn } from "~/utils/auth-client"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    clientEmailSignIn(email, password)
  }
  return (
    <>
      <h1>
        Sign In
      </h1>
      <Form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"/>
        <button type="submit">Sign In</button>
      </Form>
      <button onClick={clientGoogleSignIn}>Sign In With Google</button>
    </>
  )
}

export default SignIn