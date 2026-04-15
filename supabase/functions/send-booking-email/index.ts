import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Agendagram <noreply@agendagram.com.br>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    if (!booking_id || typeof booking_id !== "string") {
      return new Response(JSON.stringify({ error: "booking_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(booking_id)) {
      return new Response(JSON.stringify({ error: "booking_id inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up booking server-side — only allow emails for bookings created in the last 2 minutes
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("client_name, client_email, client_phone, booking_date, booking_time, service_id, professional_id, business_id, created_at")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Agendamento não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only send emails for bookings created in the last 2 minutes
    const createdAt = new Date(booking.created_at).getTime();
    const now = Date.now();
    if (now - createdAt > 2 * 60 * 1000) {
      return new Response(JSON.stringify({ error: "Agendamento expirado para envio de email" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch related data
    const [serviceResult, professionalResult, businessResult] = await Promise.all([
      booking.service_id
        ? supabase.from("services").select("name, price").eq("id", booking.service_id).single()
        : Promise.resolve({ data: null }),
      booking.professional_id
        ? supabase.from("professionals").select("name").eq("id", booking.professional_id).single()
        : Promise.resolve({ data: null }),
      booking.business_id
        ? supabase.from("businesses").select("name, owner_id").eq("id", booking.business_id).single()
        : Promise.resolve({ data: null }),
    ]);

    const client_name = booking.client_name;
    const client_email = booking.client_email;
    const service_name = serviceResult.data?.name;
    const professional_name = professionalResult.data?.name;
    const business_name = businessResult.data?.name;
    const price = serviceResult.data?.price;
    const booking_date = booking.booking_date;
    const booking_time = booking.booking_time;

    const formattedDate = new Date(booking_date + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Email para o cliente
    const clientHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Agendamento</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#0f172a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
              <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:28px;">✓</span>
              </div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Agendamento confirmado!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${business_name || "Agendagram"}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#94a3b8;margin:0 0 20px;font-size:14px;">
                Olá, <strong style="color:#e2e8f0;">${client_name}</strong>! Seu agendamento foi registrado com sucesso.
              </p>
              <table width="100%" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Serviço</span><br>
                          <span style="color:#e2e8f0;font-size:15px;font-weight:600;">${service_name || "—"}</span>
                          ${price ? `<span style="float:right;color:#6366f1;font-size:15px;font-weight:700;">R$ ${Number(price).toFixed(2)}</span>` : ""}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Profissional</span><br>
                          <span style="color:#e2e8f0;font-size:15px;">${professional_name || "—"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Data e horário</span><br>
                          <span style="color:#e2e8f0;font-size:15px;text-transform:capitalize;">${formattedDate} às ${booking_time}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center;">
                Guarde este e-mail como comprovante. Em caso de dúvidas, entre em contato com o estabelecimento.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:11px;margin:0;">Agendagram · Sistema de Agendamentos</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Email para o estabelecimento
    const businessHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Agendamento</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#0f172a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg,#10b981,#059669);">
              <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:28px;">📅</span>
              </div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Novo agendamento recebido!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${business_name || "Agendagram"}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="color:#94a3b8;margin:0 0 20px;font-size:14px;">
                Um novo agendamento foi realizado no seu estabelecimento.
              </p>
              <table width="100%" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Cliente</span><br>
                          <span style="color:#e2e8f0;font-size:15px;font-weight:600;">${client_name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Contato</span><br>
                          <span style="color:#e2e8f0;font-size:15px;">${client_email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Serviço</span><br>
                          <span style="color:#e2e8f0;font-size:15px;font-weight:600;">${service_name || "—"}</span>
                          ${price ? `<span style="float:right;color:#10b981;font-size:15px;font-weight:700;">R$ ${Number(price).toFixed(2)}</span>` : ""}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #334155;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Profissional</span><br>
                          <span style="color:#e2e8f0;font-size:15px;">${professional_name || "—"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Data e horário</span><br>
                          <span style="color:#e2e8f0;font-size:15px;text-transform:capitalize;">${formattedDate} às ${booking_time}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center;">
                Acesse o painel para gerenciar seus agendamentos.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:11px;margin:0;">Agendagram · Sistema de Agendamentos</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Envia email ao cliente
    await sendEmail(
      client_email,
      `✅ Agendamento confirmado — ${service_name || "Agendagram"}`,
      clientHtml
    );

    // Envia email ao estabelecimento
    if (businessResult.data?.owner_id) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(businessResult.data.owner_id);
        const ownerEmail = userData?.user?.email;

        if (ownerEmail) {
          await sendEmail(
            ownerEmail,
            `📅 Novo agendamento — ${client_name} | ${service_name || "Agendagram"}`,
            businessHtml
          );
        }
      } catch (bizErr) {
        console.warn("Erro ao enviar email ao estabelecimento:", bizErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-booking-email error:", err);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
