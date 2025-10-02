import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000"
  // baseURL: "http://localhost:5173"
})

export const clientSignUp = async (email, password, name) => {
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


export const clientGoogleSignIn = async () => {
  authClient.signIn.social({ provider: "google", callbackURL: "/" })
};

export const clientEmailSignIn = async (email, password) => {
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

export const clientSignOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        // router.push("/login"); // redirect to login page
      },
    },
  });
}
