import AuthThemeToggle from "~/components/auth-theme-toggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { BookOpenText } from "lucide-react";
import { clientEmailSignIn, clientGoogleSignIn } from "~/utils/auth.client";
import { Form } from "react-router";
import { useMemo, useState } from "react";
import googleImage from "../assets/google-icon.png";
import { useTheme } from "~/hooks/use-theme";
import { cn } from "~/lib/utils";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme } = useTheme();
  const isNeon = theme === "neon";
  const buttonVariant = isNeon ? "cyber" : "default";
  const emailPlaceholder = isNeon ? "EMAIL ADDRESS" : "Email address";
  const passwordPlaceholder = isNeon ? "PASSWORD" : "Password";
  const headingLabel = useMemo(() => {
    if (!heading) return null;
    return isNeon ? heading.toUpperCase() : heading;
  }, [heading, isNeon]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    clientEmailSignIn(email, password);
  };

  return (
    <section className="auth-page">
      <div className="auth-page__grid" aria-hidden="true" />
      <div className="auth-page__layer scanlines" aria-hidden="true" />

      <div className="auth-page__content">
        <div className="auth-page__actions">
          <AuthThemeToggle />
        </div>
        <a href={logo.url} className="auth-logo" title={logo.title ?? logo.alt}>
          <BookOpenText className="h-8 w-8" aria-hidden="true" />
          <span className="sr-only">{logo.alt}</span>
        </a>

        <div className="auth-card">
          <div className="auth-card__glow" aria-hidden="true" />
          <div className="auth-card__inner">
            <div className="auth-card__corner auth-card__corner--tl" aria-hidden="true" />
            <div className="auth-card__corner auth-card__corner--tr" aria-hidden="true" />
            <div className="auth-card__corner auth-card__corner--bl" aria-hidden="true" />
            <div className="auth-card__corner auth-card__corner--br" aria-hidden="true" />

            <Form onSubmit={handleSubmit} className="space-y-6">
              {headingLabel && <h1 className="auth-heading">{headingLabel}</h1>}

              <div className="space-y-4">
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder={emailPlaceholder}
                  className="auth-input"
                  required
                />

                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder={passwordPlaceholder}
                  className="auth-input"
                  required
                />
              </div>

              <Button
                type="submit"
                variant={buttonVariant}
                className={cn("auth-button", isNeon ? "uppercase tracking-[0.2em]" : "font-semibold")}
              >
                {buttonText}
                {isNeon && <span className="terminal-blink ml-2">_</span>}
              </Button>
            </Form>

            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={clientGoogleSignIn}
                className="auth-google"
                aria-label="Sign in with Google"
              >
                <img src={googleImage} className="size-6 opacity-80 transition-opacity hover:opacity-100" alt="Google" />
              </button>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <p className="auth-subtext">{signupText}</p>
          <a href={signupUrl} className="auth-link">
            Sign up
          </a>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
