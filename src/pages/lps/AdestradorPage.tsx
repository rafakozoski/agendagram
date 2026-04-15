import { SegmentLPTemplate } from "@/components/SegmentLPTemplate";
import { Sparkles, CalendarClock, Globe, Users } from "lucide-react";

export default function AdestradorPage() {
  return (
    <SegmentLPTemplate
      nichoTitle="Adestradores de Cães"
      nichoShort="os seus treinos com cães"
      heroSubtitle="O fim das mensagens esquecidas no WhatsApp. Receba reservas 24 horas por dia e ocupe o topo das pesquisas na sua região."
      imageUrl="https://loremflickr.com/800/600/dog-trainer?lock=1"
      imageAlt="Foto representativa para Adestradores de Cães"
      benefits={[
        {
          icon: CalendarClock,
          title: "Agenda funcionando 24h",
          desc: "Seus clientes veem os horários livres e marcam sozinhos, sem trocar mensagens com você."
        },
        {
          icon: Globe,
          title: "Diretório regional",
          desc: "Seu perfil aparece para novos clientes da sua área que estão buscando por adestradores de cães."
        },
        {
          icon: Users,
          title: "Fidelização de Clientes",
          desc: "Lembretes proativos pelo WhatsApp diminuem as faltas e esquecimentos em até 80%."
        }
      ]}
    />
  );
}
