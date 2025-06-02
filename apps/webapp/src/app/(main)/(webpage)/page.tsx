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
import UserButton from "~/components/UserButton";
import { auth } from "@spolka-z-l-o/auth";
import prisma from "@spolka-z-l-o/db";

const HomePage = async () => {
  return <div className="flex flex-col">xome example content...</div>;
};

export default HomePage;
