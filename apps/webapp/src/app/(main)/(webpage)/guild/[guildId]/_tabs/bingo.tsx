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
import {
  Command,
  CommandItem,
  CommandGroup,
  CommandList,
  CommandEmpty,
  CommandInput,
} from "@spolka-z-l-o/ui/command";

const BingoTab = ({ children }: { children: React.ReactNode }) => {
  return (
    <TabsContent value="bingo">
      <div className="flex h-screen w-full flex-row items-start justify-center gap-4 p-4">
        <div className="w-full bg-brand-500 lg:w-1/3">
          <Command>
            <CommandInput placeholder="Search for bingo..." />
            <CommandList>
              <CommandEmpty>No bingo found.</CommandEmpty>
              <CommandGroup heading="Bingo">
                <CommandItem>Create Bingo</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="w-full bg-brand-300 lg:w-2/3">
          {children ? (
            children
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
              <h2 className="text-lg font-semibold">Bingo</h2>
              <p>Not implemented yet...</p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default BingoTab;
