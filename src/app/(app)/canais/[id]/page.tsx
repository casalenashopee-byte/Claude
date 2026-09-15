import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateChannelAction } from "@/actions/channels";
import { ChannelForm } from "../ChannelForm";

export default async function EditarCanalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const channel = await prisma.channel.findFirst({ where: { id, userId: user.id } });
  if (!channel) notFound();

  const action = updateChannelAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Menu principal" title="Editar canal" />
      <ChannelForm action={action} defaultName={channel.name} defaultActive={channel.active} />
    </div>
  );
}
