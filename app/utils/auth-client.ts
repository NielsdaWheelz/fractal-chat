import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000"
})

export const googleSignIn = async (token, accessToken) => {
  await authClient.signIn.social({
    provider: "google",
    idToken: {
      token: token, // Google ID Token,
      accessToken: accessToken// Google Access Token
    }
  });
};

export const emailSignIn = async (email, password) => {
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
