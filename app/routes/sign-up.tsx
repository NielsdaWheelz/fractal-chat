import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { BookOpenText } from "lucide-react";
import { Form } from "react-router";
import { useState } from "react";
import { clientGoogleSignIn, clientSignUp } from "~/utils/auth.client";
import googleImage from "../assets/google-icon.png"

interface SignUpProps {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
}

const SignUp = ({
  heading = "Sign In",
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Signin",
  signinText = "Already have an account?",
  signinUrl = "/",
}: SignUpProps) => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    clientSignUp(email, password, name)
  }

  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <a href={logo.url}>
            <BookOpenText className="h-5 w-5 text-primary-foreground" />
            {/* <img
              src={logo.src}
              alt={logo.alt}
              title={logo.title}
              className="h-10 dark:invert"
            /> */}
          </a>
          <div className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md">
            <Form onSubmit={handleSubmit}>
              {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="anme"
                placeholder="name"
                className="text-sm my-2"
                required
              />

              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Email"
                className="text-sm my-2"
                required
              />
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="text-sm my-4"
                required
              />
              <Button type="submit" className="w-full">
                {buttonText}
              </Button>
            </Form>
            {/* <Button variant="outline" className="w-full"> */}
            <img src={googleImage} onClick={clientGoogleSignIn} className="mr-2 size-8" />
            {/* </Button> */}
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signinText}</p>
            <a
              href={signinUrl}
              className="text-primary font-medium hover:underline"
            >
              Back to Sign In
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SignUp;