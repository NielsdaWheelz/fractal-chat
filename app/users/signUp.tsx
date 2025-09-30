import { useState } from "react"
import { Form } from "react-router"
import { clientSignUp, clientGoogleSignIn } from "~/utils/auth-client"

const SignUp = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    clientSignUp(email, password, name)
  }

  return (
    <>
      <h1>
        Sign Up
      </h1>
      <Form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name"/>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"/>
        <button type="submit">Sign Up</button>
      </Form>
      <button onClick={clientGoogleSignIn}>Sign In With Google</button>
    </>
  )
}

export default SignUp