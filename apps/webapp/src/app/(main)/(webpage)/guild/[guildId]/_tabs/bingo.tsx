"use client";

import { TabsContent } from "@repo/ui/tabs";

import {
  Command,
  CommandItem,
  CommandGroup,
  CommandList,
  CommandEmpty,
  CommandInput,
} from "@repo/ui/command";
import type { Bingo } from "@prisma/client";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@repo/ui/dialog";
import { BingoForm } from "./_components/BingoForm";
import { NewBingoEntry } from "./_components/NewBingoEntry";

const BingoTab = ({
  guildBingos,
  children,
}: {
  guildBingos: Bingo[];
  children: React.ReactNode;
}) => {
  return (
    <TabsContent value="bingo">
      <div className="flex h-full w-full flex-row items-start justify-center gap-4 p-4">
        <div className="flex h-[calc(100vh-200px)] max-h-full w-full flex-col lg:w-1/3">
          <Command className="flex-1">
            <CommandInput placeholder="Search for bingo..." />
            <CommandList>
              <CommandEmpty>No bingo found.</CommandEmpty>
              <CommandGroup heading="Bingo">
                {guildBingos.map((bingo) => (
                  <CommandItem key={bingo.id}>
                    <Link
                      href={`/guild/${bingo.guildId}/bingo/${bingo.id}`}
                      className="block w-full"
                    >
                      {bingo.name}
                    </Link>
                  </CommandItem>
                ))}
                <CommandItem>
                  <Dialog>
                    <DialogTrigger>Create Bingo</DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Create Bingo</DialogTitle>
                      <DialogDescription>
                        Create a new bingo for this guild.
                      </DialogDescription>
                      <BingoForm />
                    </DialogContent>
                  </Dialog>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="w-full lg:w-2/3">
          {children ?? "Choose a bingo to start"}
        </div>
      </div>
    </TabsContent>
  );
};

export default BingoTab;
