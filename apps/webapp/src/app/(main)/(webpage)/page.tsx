import { auth } from "@repo/auth";
import { prisma } from "@repo/db";

import UserLoginForm from "~/app/_components/main/UserLoginForm";
import WidgetContainer from "~/app/_components/widgets/WidgetContainer";
import WidgetStateProvider from "~/app/_components/widgets/WidgetStateProvider";
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
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        })),
      };
    }
  });

  return (
    <WidgetStateProvider
      key={JSON.stringify(widgetIdsByType)}
      initialData={initialStateBundle}
      widgetIdsByType={widgetIdsByType}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {widgets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Use the + button above to add your first widget.
          </div>
        ) : (
          (() => {
            const counters: Record<string, number> = {};
            return widgets.map((widget) => {
              counters[widget.type] = (counters[widget.type] ?? 0) + 1;
              return (
                <WidgetContainer
                  key={widget.id}
                  widget={widget}
                  instanceNumber={counters[widget.type]}
                />
              );
            });
          })()
        )}
      </div>
    </WidgetStateProvider>
  );
};

export default HomePage;
