import { PageHeader } from "@/components/ui/PageHeader";
import { createChannelAction } from "@/actions/channels";
import { ChannelForm } from "../ChannelForm";

export default function NovoCanalPage() {
  return (
    <div>
      <PageHeader eyebrow="Menu principal" title="Novo canal" />
      <ChannelForm action={createChannelAction} />
    </div>
  );
}
