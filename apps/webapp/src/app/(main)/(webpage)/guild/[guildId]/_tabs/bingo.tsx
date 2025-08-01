"use client";

import { TabsContent } from "@spolka-z-l-o/ui/tabs";
import {
  useForm,
  Form,
  FormField,
  FormItem,
  useFieldArray,
} from "@spolka-z-l-o/ui/form";
import { Button } from "@spolka-z-l-o/ui/button";
import { FormControl, FormLabel, FormMessage } from "@spolka-z-l-o/ui/form";
import { verificationFormSchema } from "@spolka-z-l-o/validators";
import type { VerificationForm } from "@spolka-z-l-o/validators";

import { Textarea } from "@spolka-z-l-o/ui/textarea";
import { Input } from "@spolka-z-l-o/ui/input";

import type { APIGuildChannel } from "@spolka-z-l-o/validators";
import { ChannelType } from "@spolka-z-l-o/validators";

import { ChannelCommandBox } from "./_components/channelCommandBox";

const BingoTab = () => {
  return (
    <TabsContent value="bingo">
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
        <h2 className="text-lg font-semibold">Bingo</h2>
        <p>Not implemented yet...</p>
      </div>
    </TabsContent>
  );
};

export default BingoTab;
