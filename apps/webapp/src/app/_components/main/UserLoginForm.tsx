import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Separator } from "@repo/ui/separator";
import UserLoginButton from "./UserLoginButton";
import { auth } from "@repo/auth";

const UserLoginForm = async () => {
  const session = await auth();

  if (session) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Input placeholder="Username" />
        <Input placeholder="Password" />
        <Button type="submit">Login</Button>
      </div>
      <Separator />
      <UserLoginButton />
    </div>
  );
};

export default UserLoginForm;
