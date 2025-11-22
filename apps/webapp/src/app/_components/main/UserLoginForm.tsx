import { auth } from "@repo/auth";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Separator } from "@repo/ui/separator";
import {
  WidgetBody,
  WidgetDescription,
  WidgetHeader,
  WidgetSurface,
  WidgetTitle,
} from "@repo/ui/widget-chrome";

import UserLoginButton from "./UserLoginButton";

const UserLoginForm = async () => {
  const session = await auth();

  if (session) {
    return null;
  }
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <WidgetSurface className="w-full max-w-md mx-auto">
        <WidgetHeader>
          <div>
            <WidgetTitle>Sign in</WidgetTitle>
            <WidgetDescription>Access your DM dashboard securely.</WidgetDescription>
          </div>
        </WidgetHeader>
        <WidgetBody className="space-y-6">
          <form className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="your@email.com" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="relative py-1">
            <Separator />
          </div>
          <UserLoginButton />
        </WidgetBody>
      </WidgetSurface>
    </div>
  );
};

export default UserLoginForm;
