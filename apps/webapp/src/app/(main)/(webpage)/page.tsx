import { auth } from "@repo/auth";

import GameClockPanel from "~/app/_components/main/GameClockPanel";
import UserLoginForm from "~/app/_components/main/UserLoginForm";

const HomePage = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col">
        <UserLoginForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Game Clock</h1>
      <GameClockPanel />
    </div>
  );
};

export default HomePage;
