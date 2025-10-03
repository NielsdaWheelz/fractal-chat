import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { BookOpenText } from "lucide-react";
import { clientEmailSignIn, clientGoogleSignIn } from "~/utils/auth.client";
import { Form } from "react-router";
import { useState } from "react";
import googleImage from "../assets/google-icon.png"

interface SignInProps {
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

const SignIn = ({
  heading = "Login",
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Login",
  signupText = "Need an account?",
  signupUrl = "/signup",
}: SignInProps) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    clientEmailSignIn(email, password)
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
                className="text-sm my-2"
                required
              />
              <Button type="submit" className="w-full my-4">
                {buttonText}
              </Button>
            </Form>
            {/* <Button variant="outline" className="w-full"> */}
            <img src={googleImage} onClick={clientGoogleSignIn} className="mr-2 size-8" />
            {/* </Button> */}

          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;