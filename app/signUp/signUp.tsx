import { useState } from "react"
import { Form } from "react-router"
import { authClient } from "~/utils/auth-client"

const SignUp = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  // const [image, setImage] = useState("")


  const signUp = async () => {
    await authClient.signUp.email({
      email,
      password,
      name,
      // image
      // callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
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
        Sign Up
      </h1>
      <Form onSubmit={signUp}>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name"/>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"/>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"/>
        <button type="submit">Sign Up</button>
      </Form>
    </>
  )
}

export default SignUp