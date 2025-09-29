import { useState } from "react"
import { Form } from "react-router"
import { authClient } from "~/utils/auth-client"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  const signIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/"
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        },
      }
    )
  }

  return (
    <>
      <h1>
        Sign In
      </h1>
      <Form onSubmit={signIn}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"/>
        <button type="submit">Sign In</button>
      </Form>
    </>
  )
}

export default SignIn