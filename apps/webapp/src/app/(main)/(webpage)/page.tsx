import { auth } from "@repo/auth";
import { prisma } from "@repo/db";

import UserLoginForm from "~/app/_components/main/UserLoginForm";
import WidgetStateProvider from "~/app/_components/widgets/WidgetStateProvider";
import WidgetMasonryBoard from "~/app/_components/widgets/WidgetMasonryBoard";
import {
  createEmptyWidgetStateBundle,
  widgetSelect,
  type WidgetIdsByType,
  type WidgetInstanceWithState,
} from "~/app/_components/widgets/widget-types";

const HomePage = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col">
        <UserLoginForm />
      </div>
    );
  }

  const widgets = (await prisma.widgetInstance.findMany({
    where: { userId: session.user.id },
    orderBy: { position: "asc" },
    select: widgetSelect,
  })) as WidgetInstanceWithState[];

  const widgetIdsByType: WidgetIdsByType = {
    "game-clock": [],
    notes: [],
    "dice-roller": [],
  };

  const initialStateBundle = createEmptyWidgetStateBundle();

  widgets.forEach((widget) => {
    if (widget.type === "game-clock") {
      widgetIdsByType["game-clock"].push(widget.id);

      if (widget.gameClockState) {
        initialStateBundle["game-clock"][widget.id] = widget.gameClockState;
      }
    }

    if (widget.type === "notes") {
      widgetIdsByType.notes.push(widget.id);

      initialStateBundle.notes[widget.id] = {
        notes: widget.notes.map((note: WidgetInstanceWithState["notes"][number]) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          position: note.position,
          pinned: note.pinned,
          pinnedAt: note.pinnedAt ? note.pinnedAt.toISOString() : null,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        })),
      };
    }

    if (widget.type === "dice-roller") {
      widgetIdsByType["dice-roller"].push(widget.id);
      initialStateBundle["dice-roller"][widget.id] = { logs: [] };
    }
  });

  return (
    <WidgetStateProvider
      key={JSON.stringify(widgetIdsByType)}
      initialData={initialStateBundle}
      widgetIdsByType={widgetIdsByType}
    >
      {widgets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Use the + button above to add your first widget.
        </div>
      ) : (
        <WidgetMasonryBoard widgets={widgets} />
      )}
    </WidgetStateProvider>
  );
};

export default HomePage;
