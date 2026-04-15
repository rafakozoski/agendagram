import { SegmentLPTemplate } from "@/components/SegmentLPTemplate";
import { Sparkles, CalendarClock, Globe, Users } from "lucide-react";

export default function InstaladoresPage() {
  return (
    <SegmentLPTemplate
      nichoTitle="Instaladores"
      nichoShort="os seus serviços de Instalação e Manutenção"
      heroSubtitle="O fim das mensagens esquecidas no WhatsApp. Receba reservas 24 horas por dia e ocupe o topo das pesquisas na sua região."
      imageUrl="https://loremflickr.com/800/600/hvac?lock=1"
      imageAlt="Foto representativa para Instaladores"
      benefits={[
        {
          icon: CalendarClock,
          title: "Agenda funcionando 24h",
          desc: "Seus clientes veem os horários livres e marcam sozinhos, sem trocar mensagens com você."
        },
        {
          icon: Globe,
          title: "Diretório regional",
          desc: "Seu perfil aparece para novos clientes da sua área que estão buscando por instaladores."
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
