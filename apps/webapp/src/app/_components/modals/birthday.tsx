"use client";

import { useModalStore } from "@spolka-z-l-o/modal";
import { Button } from "@spolka-z-l-o/ui/button";
import { api } from "~/trpc/react";

import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@spolka-z-l-o/ui/dialog";
import type { DiscordGuildMemberWithBirthday } from "@spolka-z-l-o/validators/discord";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@spolka-z-l-o/ui/popover";
import { Calendar } from "@spolka-z-l-o/ui/calendar";
import { CalendarIcon, Loader } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormLabel,
  FormItem,
  useForm,
  FormMessage,
  FormField,
} from "@spolka-z-l-o/ui/form";
import { toast } from "@spolka-z-l-o/ui/toast";
import { CommandItem } from "@spolka-z-l-o/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@spolka-z-l-o/ui/avatar";
import { getNameShort } from "../helpers";

interface BirthdayModalProps {
  memberWithBirthday: DiscordGuildMemberWithBirthday;
  guildId: string;
}

const BirthdayModal = ({ memberWithBirthday, guildId }: BirthdayModalProps) => {
  const memberName =
    memberWithBirthday.nick ?? memberWithBirthday.user.username;
  const [pickedDate, setPickedDate] = useState<Date | undefined>(
    memberWithBirthday.birthday
      ? new Date(memberWithBirthday.birthday)
      : undefined,
  );
  console.log({
    memberWithBirthday,
  });
  const router = useRouter();
  const { isOpen, setIsOpen, data, setData } = useModalStore((state) => state);

  const {
    mutate: updateMemberBirthday,
    isPending,
    error,
  } = api.birthday.setGuildMemberBirthday.useMutation({
    onSuccess: () => {
      toast.success(`Birthday date for ${memberName} updated successfully!`);
      startTransition(() => {
        router.refresh(); // Refresh the page to reflect changes
      });
      setIsOpen(null); // Close the modal after successful update
    },
    onError: (error) => {
      console.error("Failed to update birthday date:", error);
      toast.error("Failed to update birthday date. Please try again.");
    },
  });

  const handleBirthdayDate = async () => {
    if (!pickedDate) {
      return;
    }
    await updateMemberBirthday({
      guildId,
      providerAccountId: memberWithBirthday.user.id,
      birthdayDate: pickedDate,
    });
  };

  const triggerComponent = (
    <CommandItem key={memberWithBirthday.user.id}>
      <Avatar>
        <AvatarFallback>{getNameShort(memberName)}</AvatarFallback>
        <AvatarImage
          src={`https://cdn.discordapp.com/avatars/${memberWithBirthday.user.id}/${memberWithBirthday.user.avatar}.png`}
        />
      </Avatar>
      {memberName}{" "}
      {memberName === memberWithBirthday.user.username
        ? ""
        : `(${memberWithBirthday.user.username})`}
    </CommandItem>
  );

  return (
    <Dialog
      open={isOpen && data.userId === memberWithBirthday.user.id}
      onOpenChange={(v: boolean) => {
        setData({ userId: memberWithBirthday.user.id });
        setIsOpen(v ? "birthdayAdd" : null);
      }}
    >
      <DialogTrigger>{triggerComponent}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{memberName} birthday settings</DialogTitle>
          <DialogDescription>
            Set some settings for this user!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <h3>Current birthday date:</h3>
          <p>
            {pickedDate ? new Date(pickedDate).toLocaleDateString() : "Not set"}
          </p>

          <Popover>
            <PopoverTrigger asChild>
              <Button type="button">
                <CalendarIcon />
                Pick new date
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={pickedDate}
                onSelect={(date) => {
                  console.log("Selected date:", date);
                  setPickedDate(date);
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="primary"
            disabled={
              isPending ||
              !pickedDate ||
              pickedDate?.getTime() === memberWithBirthday.birthday?.getTime()
            }
            onClick={handleBirthdayDate}
          >
            Save changes{" "}
            {isPending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};

export default BirthdayModal;
