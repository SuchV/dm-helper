import Link from "next/link";
// import { SiGithub as Github } from "@icons-pack/react-simple-icons";
import { ArrowRight, Check, Clock, Rocket, Terminal } from "lucide-react";

import { Button } from "@spolka-z-l-o/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@spolka-z-l-o/ui/tabs";
import UserLoginButton from "~/app/_components/main/UserLoginButton";
import { auth } from "@spolka-z-l-o/auth";
import prisma from "@spolka-z-l-o/db";
import UserLoginForm from "~/app/_components/main/UserLoginForm";

const HomePage = async () => {
  return (
    <div className="flex flex-col">
      <UserLoginForm />
    </div>
  );
};

export default HomePage;
