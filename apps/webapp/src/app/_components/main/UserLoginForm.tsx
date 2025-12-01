import { auth } from "@repo/auth";
import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import {
  WidgetBody,
  WidgetDescription,
  WidgetHeader,
  WidgetSurface,
  WidgetTitle,
} from "@repo/ui/widget-chrome";
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";

import UserLoginButton from "./UserLoginButton";

const highlights = [
  {
    icon: Sparkles,
    title: "Unified dashboard",
    body: "Widgets, rolls, and notes stay in sync across every campaign device.",
  },
  {
    icon: CalendarDays,
    title: "Faster prep",
    body: "Jump back to bookmarked PDFs and timelines without re-uploading assets.",
  },
  {
    icon: ShieldCheck,
    title: "Secure access",
    body: "Google handles MFA, recovery, and device trust so we can focus on features.",
  },
] as const;

const UserLoginForm = async () => {
  const session = await auth();

  if (session) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 via-background to-transparent p-8 shadow-sm">
          <Badge variant="secondary" className="mb-4 w-fit bg-primary/10 text-primary">
            DM Dashboard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Game-night logistics, handled.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Keep every campaign asset, initiative tracker, and rulebook reference inside a single command center.
            Sign in once and pick up your prep from any device.
          </p>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            {highlights.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm"
              >
                <feature.icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
                <dt className="font-medium text-foreground">{feature.title}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{feature.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <WidgetSurface className="bg-card/90 backdrop-blur">
          <WidgetHeader className="flex flex-col gap-2 text-left">
            <WidgetTitle>Sign in with Google</WidgetTitle>
            <WidgetDescription>
              We rely on Google Single Sign-On for secure, passwordless access to your DM workspace.
            </WidgetDescription>
          </WidgetHeader>
          <WidgetBody className="space-y-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Using Google lets us inherit strong account protections (MFA, suspicious login alerts, recovery)
                without storing additional passwords.
              </p>
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">Why only Google?</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>• Faster onboarding for your table—no new credentials to remember.</li>
                  <li>• Enterprise-grade security and device checks handled by Google.</li>
                  <li>• Consent screen clearly shows the minimal profile data we request.</li>
                </ul>
              </div>
            </div>
            <UserLoginButton />
            <div className="space-y-2 text-xs text-muted-foreground">
              <Separator />
              <p>
                By continuing you agree to keep player data private and to Google’s Terms of Service. We never post
                to your account or access contacts.
              </p>
            </div>
          </WidgetBody>
        </WidgetSurface>
      </div>
    </div>
  );
};

export default UserLoginForm;
