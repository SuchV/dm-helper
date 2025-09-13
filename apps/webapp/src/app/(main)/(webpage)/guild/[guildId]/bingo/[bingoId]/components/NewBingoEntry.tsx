"use client";

import { cn } from "@spolka-z-l-o/ui";
import { Loader2, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "@spolka-z-l-o/ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export const NewBingoEntry = () => {
  const router = useRouter();
  const bingoId = useParams().bingoId as string;
  const { mutate: createBingoEntry, isPending } =
    api.bingo.createBingoEntry.useMutation({
      onSuccess: () => {
        router.refresh();
      },
    });
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-4",
      )}
    >
      <Button
        variant="ghost"
        type="button"
        disabled={isPending}
        onClick={() => createBingoEntry({ entry: "New Entry", bingoId })}
        className="h-full w-full rounded-lg"
      >
        {isPending && (
          <div className="pointer-events-none absolute inset-0 z-20 flex h-full w-full items-center justify-center">
            <div className="bg-black absolute inset-0 rounded-lg backdrop-blur-sm" />
            <Loader2 className="relative z-10 size-4 animate-spin" />
          </div>
        )}
        <p>
          <Plus className="size-12" />
        </p>
      </Button>
    </div>
  );
};
