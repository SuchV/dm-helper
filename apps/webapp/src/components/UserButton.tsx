import { Button } from "@spolka-z-l-o/ui/button";
import { type Session } from "@spolka-z-l-o/auth";
import { signIn, signOut } from "@spolka-z-l-o/auth/react";

const UserButton = ({ session }: { session: Session | null }) => {
  if (session?.user) {
    return (
      <Button
        type="button"
        className="bg-red-500 text-white hover:bg-red-600"
        onClick={async () => {
          "use server";
          await signOut();
        }}
      >
        Sign out, {session.user.name}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={async () => {
        "use server";
        await signIn("discord");
      }}
    >
      Sign in to discord
    </Button>
  );
};

export default UserButton;
