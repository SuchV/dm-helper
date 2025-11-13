import { Tabs } from "@repo/ui/tabs";
import BingoTab from "../../_tabs/bingo";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BingoEntry } from "./components/BingoEntry";
import { NewBingoEntry } from "../../_tabs/_components/NewBingoEntry";
interface BingoPageProps {
  params: {
    bingoId: string;
  };
}
const BingoPage = async ({ params }: BingoPageProps) => {
  const { bingoId } = await params;
  const bingo = await api.bingo.getBingo({
    bingoId,
  });

  if (!bingo) {
    notFound();
  }
  return (
    <div className="grid grid-cols-5 gap-4">
      {bingo.bingoEntries.map((bingo) => (
        <BingoEntry key={bingo.id} bingoEntry={bingo} />
      ))}
      <NewBingoEntry bingoId={bingo.id} />
    </div>
  );
};

export default BingoPage;
