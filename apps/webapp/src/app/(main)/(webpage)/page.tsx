import { auth } from "@repo/auth";
import { prisma } from "@repo/db";

import UserLoginForm from "~/app/_components/main/UserLoginForm";
import WidgetContainer from "~/app/_components/widgets/WidgetContainer";

const HomePage = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col">
        <UserLoginForm />
      </div>
    );
  }

  const widgets = await prisma.widgetInstance.findMany({
    where: { userId: session.user.id },
    orderBy: { position: "asc" },
  });

  return (
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
  );
};

export default HomePage;
