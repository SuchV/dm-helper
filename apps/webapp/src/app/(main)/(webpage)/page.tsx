import Link from "next/link";
// import { SiGithub as Github } from "@icons-pack/react-simple-icons";
import { ArrowRight, Check, Clock, Rocket, Terminal } from "lucide-react";

import { Button } from "@repo/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/tabs";
import UserLoginButton from "~/app/_components/main/UserLoginButton";
import { auth } from "@repo/auth";
import prisma from "@repo/db";
import UserLoginForm from "~/app/_components/main/UserLoginForm";

const HomePage = async () => {
  return (
    <div className="flex flex-col">
      <UserLoginForm />
<<<<<<< HEAD
      
=======
>>>>>>> 635f8d3ed6da2ebfb6b355a57ca7898775b8034e
    </div>
  );
};

export default HomePage;
