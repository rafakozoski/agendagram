import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Download, Share2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoImg from "@/assets/logo-agendagram.png";

interface Props {
  serviceId: string | null;
  professionalId: string | null;
  date: Date | undefined;
  time: string | null;
  clientInfo: { name: string; email: string; phone: string };
  businessId?: string;
}

export function ConfirmationStep({ serviceId, professionalId, date, time, clientInfo, businessId }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data: service } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data } = await supabase.from("services").select("*").eq("id", serviceId).single();
      return data;
    },
    enabled: !!serviceId,
  });

  const { data: professional } = useQuery({
    queryKey: ["professional", professionalId],
    queryFn: async () => {
      if (!professionalId) return null;
      const { data } = await supabase.from("professionals").select("*").eq("id", professionalId).single();
      return data;
    },
    enabled: !!professionalId,
  });

  const { data: business } = useQuery({
    queryKey: ["business-confirmation", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data } = await supabase.from("businesses").select("name, address, city, state, neighborhood").eq("id", businessId).single();
      return data;
    },
    enabled: !!businessId,
  });

  const businessAddress = business
    ? [business.address, business.neighborhood, business.city, business.state].filter(Boolean).join(", ")
    : null;

  const generateImage = async (): Promise<Blob | null> => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!receiptRef.current) return null;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#f3f4f6",
        scale: 2,
        useCORS: true,
      });
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    } catch {
      toast.error("Erro ao gerar imagem.");
      return null;
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprovante-agendamento-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Comprovante salvo!");
  };

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], "comprovante-agendamento.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "Comprovante de Agendamento",
          text: `Agendamento confirmado para ${clientInfo.name}`,
          files: [file],
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleDownload();
      toast.info("Compartilhamento não suportado neste dispositivo. Imagem salva.");
    }
  };

  const formattedDate = date
    ? date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
      >
        <CheckCircle className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <h3 className="text-2xl font-bold mb-2">Agendamento confirmado!</h3>
      <p className="text-muted-foreground mb-6">
        Um e-mail de confirmação foi enviado para <strong>{clientInfo.email}</strong>
      </p>

      {/* Receipt card — responsive, light gray bg, rounded */}
      <div
        ref={receiptRef}
        className="bg-gray-100 rounded-2xl p-4 sm:p-6 text-left w-full max-w-sm mx-auto space-y-3 border border-gray-200 overflow-hidden"
        style={{ fontFamily: "system-ui, sans-serif", wordBreak: "break-word" }}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between mb-4">
          <img src={logoImg} alt="Agendagram" className="h-6 sm:h-7" />
          <span className="text-emerald-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-emerald-100 px-2 py-1 rounded-full">
            ✓ Confirmado
          </span>
        </div>

        {business?.name && (
          <div className="text-gray-800 font-bold text-sm sm:text-base mb-1">{business.name}</div>
        )}

        {businessAddress && (
          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{businessAddress}</span>
          </div>
        )}

        <hr className="border-gray-300 my-2" />

        {service && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium truncate min-w-0 flex-1">{service.name}</span>
            <span className="font-bold text-primary whitespace-nowrap shrink-0">R$ {Number(service.price).toFixed(2)}</span>
          </div>
        )}
        {professional && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span>{professional.name}</span>
          </div>
        )}
        {date && time && (
          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="capitalize leading-snug break-words">{formattedDate} às {time}</span>
          </div>
        )}

        <hr className="border-gray-300 my-2" />

        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{clientInfo.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{clientInfo.email}</span>
        </div>
        {clientInfo.phone && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{clientInfo.phone}</span>
          </div>
        )}

        <div className="pt-3 text-center text-[10px] sm:text-xs text-gray-400">
          Gerado em {new Date().toLocaleDateString("pt-BR")} • Agendagram
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button variant="outline" className="gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          Salvar imagem
        </Button>
        <Button className="gap-2 gradient-primary text-primary-foreground" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Guarde este comprovante. Você também receberá um e-mail de confirmação.
      </p>
    </div>
  );
}
