import { api } from "~/trpc/server";
import BingoTab from "../_tabs/bingo";

const Layout = async ({
  params,
  children,
}: {
  params: { guildId: string };
  children: React.ReactNode;
}) => {
  const { guildId } = await params;
  const guildBingos = await api.bingo.getBingos({ guildId });
  return <BingoTab guildBingos={guildBingos}>{children}</BingoTab>;
};

export default Layout;
