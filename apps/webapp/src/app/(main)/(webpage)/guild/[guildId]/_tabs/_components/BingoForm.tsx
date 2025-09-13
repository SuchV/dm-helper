"use client";

import {
  useForm,
  Form,
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
  FormField,
  useFieldArray,
} from "@spolka-z-l-o/ui/form";
import { createBingoFormSchema } from "@spolka-z-l-o/validators";
import { Input } from "@spolka-z-l-o/ui/input";
import { Button } from "@spolka-z-l-o/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";

export const BingoForm = () => {
  const guildId = useParams().guildId as string;

  const form = useForm({
    schema: createBingoFormSchema,
    defaultValues: {
      name: "",
      entries: [],
      guildId: guildId,
    },
  });

  const { fields, append } = useFieldArray({
    name: "entries",
    control: form.control,
  });

  const router = useRouter();

  const { mutate: createBingo, isPending } = api.bingo.createBingo.useMutation({
    onSuccess: (data) => {
      form.reset();
      router.push(`/guild/${data.guildId}/bingo/${data.id}`);
      router.refresh();
    },
  });

  const onSubmit = (data: CreateBingoForm) => {
    createBingo(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bingo Name</FormLabel>
              <FormControl>
                <Input placeholder="Bingo Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`entries.${index}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry {index + 1}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Entry ${index + 1}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" onClick={() => append("")}>
            Add Entry
          </Button>
        </div>
        <Button type="submit" variant="primary" disabled={isPending}>
          Create Bingo
        </Button>
      </form>
    </Form>
  );
};
