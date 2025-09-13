"use client";

import type { BingoEntry as BingoEntryType, User } from "@prisma/client";
import { cn } from "@spolka-z-l-o/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@spolka-z-l-o/ui/avatar";
import { Button } from "@spolka-z-l-o/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@spolka-z-l-o/ui/dialog";
import {
  FormField,
  useForm,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@spolka-z-l-o/ui/form";
import { Input } from "@spolka-z-l-o/ui/input";
import { format } from "date-fns";
import { Edit, Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { z } from "zod";

export const BingoEntry = ({
  bingoEntry,
}: {
  bingoEntry: BingoEntryType & { user: User };
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const formattedDate = format(
    new Date(bingoEntry.updatedAt),
    "dd.MM.yy, HH:mm",
  );
  const isCompleted = Boolean(bingoEntry.userId);

  const router = useRouter();

  console.log("bingoEntry", bingoEntry);

  const { mutate: updateBingoEntry, isPending } =
    api.bingo.updateBingoEntry.useMutation({
      onSuccess: () => {
        setDialogOpen(false);
        router.refresh();
      },
    });

  const { mutate: deleteBingoEntry, isPending: isDeleting } =
    api.bingo.deleteBingoEntry.useMutation({
      onSuccess: () => {
        setDialogOpen(false);
        router.refresh();
      },
    });

  const form = useForm({
    schema: z.object({
      entry: z.string().min(1, "Entry is required"),
    }),
    defaultValues: {
      entry: bingoEntry.entry,
    },
  });
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-300 p-4",
        {
          "border-error-500 bg-[linear-gradient(135deg,transparent_0%,theme(colors.error.500)_100%)]":
            !isCompleted,
          "border-success-500 bg-[linear-gradient(135deg,transparent_0%,theme(colors.success.500)_100%)]":
            isCompleted,
        },
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 flex h-full w-full items-center justify-center rounded-lg text-center text-sm font-semibold text-white-opacity-900",
          {
            "opacity-0 transition-opacity duration-300 ease-in-out hover:bg-success-500/50 hover:opacity-100 hover:backdrop-blur-sm":
              !isCompleted,
          },
          {
            "opacity-0 transition-opacity duration-300 ease-in-out hover:bg-error-500/50 hover:opacity-100 hover:backdrop-blur-sm":
              isCompleted,
          },
          { "pointer-events-none cursor-default": isPending },
        )}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="h-full w-full">
            {isCompleted ? "Uncomplete?" : "Mark as completed?"}
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Updating a Bingo Entry</DialogTitle>
            <DialogDescription>
              Make some changes to this bingo entry...
            </DialogDescription>
            Are you sure you want to {isCompleted ? "uncomplete" : "complete"}{" "}
            this entry?
            <Button
              variant="primary"
              type="button"
              disabled={isPending}
              onClick={() => {
                updateBingoEntry({
                  id: bingoEntry.id,
                  isCompleted: !isCompleted,
                  entry: bingoEntry.entry,
                });
              }}
            >
              Yes
            </Button>
            <DialogClose>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={isPending}
              >
                No
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <div className="absolute right-0 top-0 z-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="p-1">
                <Edit className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Edit Bingo Entry</DialogTitle>
              <DialogDescription>
                Update the text for this bingo entry.
              </DialogDescription>
              <Form {...form}>
                <form
                  className="mt-4 flex flex-col gap-2"
                  onSubmit={form.handleSubmit((data) => {
                    updateBingoEntry({
                      id: bingoEntry.id,
                      entry: data.entry,
                      isCompleted,
                    });
                  })}
                >
                  <FormField
                    control={form.control}
                    name="entry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry</FormLabel>
                        <FormControl>
                          <Input placeholder="Bingo Entry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isPending}
                    >
                      Save
                    </Button>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        type="button"
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="p-1">
                <Trash className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Remove Bingo Entry</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this bingo entry? This action
                cannot be undone.
              </DialogDescription>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  type="button"
                  className="text-white-opacity-900"
                  disabled={isDeleting}
                  onClick={() => {
                    deleteBingoEntry({ id: bingoEntry.id });
                  }}
                >
                  Yes
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" type="button" disabled={isDeleting}>
                    No
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isPending && (
        <div className="pointer-events-none absolute inset-0 z-20 flex h-full w-full items-center justify-center">
          <div className="bg-black absolute inset-0 rounded-lg backdrop-blur-sm" />
          <Loader2 className="relative z-10 size-4 animate-spin" />
        </div>
      )}
      <h3>{bingoEntry.entry}</h3>
      {isCompleted && <div>{formattedDate}</div>}
      {isCompleted && (
        <Avatar className="absolute bottom-0 right-0 z-10 size-8">
          <AvatarFallback>??</AvatarFallback>
          <AvatarImage
            src={bingoEntry.user?.image ?? ""}
            alt={bingoEntry.user?.name ?? "??"}
          />
        </Avatar>
      )}
    </div>
  );
};
