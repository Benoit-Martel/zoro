import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("=== Edge Function Called ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", {
    contentType: req.headers.get("content-type"),
    apikey: req.headers.get("apikey") ? "***present***" : "missing",
  });

  try {
    // Get raw body text first for debugging
    const bodyText = await req.text();
    console.log("Raw body text length:", bodyText.length);
    console.log("Raw body preview:", bodyText.substring(0, 200));

    let body: Record<string, unknown> = {};
    if (bodyText && bodyText.length > 0) {
      try {
        body = JSON.parse(bodyText);
      } catch (parseError) {
        console.error("Failed to parse JSON body:", parseError);
        console.error("Body was:", bodyText);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      console.error("Empty body received");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Empty request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Parsed body keys:", Object.keys(body));
    console.log("Body contents:", body);

    const invoiceId = body.invoiceId as string | undefined;
    const recipient = body.recipient as string[] | string | undefined;
    const subject = body.subject as string | undefined;
    const message = body.message as string | undefined;
    const invoiceNumber = body.invoiceNumber as string | undefined;
    const pdfBase64 = body.pdfBase64 as string | undefined;

    console.log("Extracted fields:", {
      invoiceId: invoiceId ? `${invoiceId.substring(0, 20)}...` : "undefined",
      recipient: recipient,
      recipientType: typeof recipient,
      isArray: Array.isArray(recipient),
      subject: subject ? `${subject.substring(0, 50)}...` : "undefined",
      message: message ? `${message.substring(0, 50)}...` : "undefined",
      invoiceNumber: invoiceNumber,
      hasPdfBase64: !!pdfBase64,
    });

    // Validate inputs - support both single recipient (for backward compatibility) and multiple recipients
    let recipientList: string[] = [];

    if (Array.isArray(recipient)) {
      recipientList = recipient.filter(
        (r) => typeof r === "string" && r.length > 0,
      );
    } else if (typeof recipient === "string" && recipient.length > 0) {
      recipientList = [recipient];
    }

    console.log("Final recipient list:", recipientList);
    console.log("Final validation check:", {
      hasInvoiceId: !!invoiceId,
      invoiceIdValue: invoiceId,
      recipientCount: recipientList.length,
      recipientList: recipientList,
      hasSubject: !!subject,
      subjectValue: subject,
    });

    if (!invoiceId || recipientList.length === 0 || !subject) {
      const missingFields: string[] = [];
      if (!invoiceId) missingFields.push("invoiceId");
      if (recipientList.length === 0) missingFields.push("recipient");
      if (!subject) missingFields.push("subject");

      const errorMessage = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("Validation failed:", errorMessage);
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("zoro_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error(`Invoice not found: ${invoiceError?.message || ""}`);
    }

    // Fetch invoice items
    const { data: items, error: itemsError } = await supabase
      .from("zoro_invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      throw new Error(`Error fetching invoice items: ${itemsError.message}`);
    }

    // Fetch project data for hourly rate
    const { data: project, error: projectError } = await supabase
      .from("zoro_projects")
      .select("*, zoro_clients(name, email)")
      .eq("id", invoice.project_id)
      .single();

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectError?.message || ""}`);
    }

    // Construct email HTML (use first recipient for personalization, or generic)
    const emailHtml = await generateInvoiceHTML(
      invoice,
      items || [],
      project,
      recipientList[0],
    );

    // Send email via Resend (or other service)
    // For this example, we'll use the Resend API
    // You can also use SendGrid, Mailgun, or any other email service

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      // If Resend is not configured, just log and return success
      console.log("RESEND_API_KEY not configured. Email sending is disabled.");
      console.log(`Would send email to: ${recipientList.join(", ")}`);
      console.log(`Subject: ${subject}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sending simulated (Resend not configured)",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const replyTo = Deno.env.get("REPLY_TO_EMAIL");

    const emailBody: Record<string, unknown> = {
      from:
        Deno.env.get("EMAIL_FROM") ||
        "Benoit Martel <facturation@zoro.benoitmartel.com>",
      to: recipientList,
      subject: subject,
      html: `<p>${message || "Veuillez trouver ci-joint votre facture. N'hésitez pas à répondre à ce courriel pour toute question."}</p>`,
      text: `${message || "Veuillez trouver ci-joint votre facture. N'hésitez pas à répondre à ce courriel pour toute question."}\n\nFacture #${invoiceNumber}`,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    if (pdfBase64) {
      emailBody.attachments = [
        {
          filename: `Benoit-Martel-facture-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ];
    }

    console.log("Sending to Resend with:", {
      recipientCount: recipientList.length,
      hasAttachments: !!emailBody.attachments,
      attachmentsCount: (emailBody.attachments as unknown[])?.length || 0,
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailBody),
    });

    const emailData = (await emailResponse.json()) as Record<string, unknown>;

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${recipientList.length} recipient(s)`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-invoice-email function:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function generateInvoiceHTML(
  invoice: Record<string, unknown>,
  items: unknown[],
  project: Record<string, unknown>,
  recipient: string,
): Promise<string> {
  // Calculate totals
  let subtotal = 0;
  let taxableSubtotal = 0;

  const itemRows = (items as Array<Record<string, unknown>>)
    .map((item) => {
      const subtotalAmount =
        (item.quantity as number) * (item.unit_price as number);
      subtotal += subtotalAmount;

      if (!item.exempt_tax) {
        taxableSubtotal += subtotalAmount;
      }

      return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ${item.description || ""}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">
          $${((item.unit_price as number) || 0).toFixed(2)}
        </td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">
          $${subtotalAmount.toFixed(2)}
        </td>
      </tr>
    `;
    })
    .join("");

  const tps = taxableSubtotal * 0.05;
  const tvq = taxableSubtotal * 0.09975;
  const total = subtotal + tps + tvq;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture #${invoice.invoice_number}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
          <h1 style="color: #333;">FACTURE</h1>
          <p style="color: #666;">Facture #${invoice.invoice_number}</p>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Client</h3>
            <p style="color: #666; margin: 5px 0;">
              ${recipient}
            </p>
          </div>

          <div style="margin: 30px 0;">
            <p style="color: #333; margin-bottom: 5px;">
              <strong>Projet:</strong> ${project.name}
            </p>
            <p style="color: #333; margin: 5px 0;">
              <strong>Date:</strong> ${new Date(invoice.date as string).toLocaleDateString("fr-CA")}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <thead>
              <tr style="background-color: #f0f0f0; border-bottom: 2px solid #333;">
                <th style="padding: 10px; text-align: left; font-weight: bold;">Description</th>
                <th style="padding: 10px; text-align: right; font-weight: bold;">Quantité</th>
                <th style="padding: 10px; text-align: right; font-weight: bold;">Prix unitaire</th>
                <th style="padding: 10px; text-align: right; font-weight: bold;">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Sous-total:</td>
                <td style="padding: 10px; text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">TPS (5%):</td>
                <td style="padding: 10px; text-align: right;">$${tps.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">TVQ (9.975%):</td>
                <td style="padding: 10px; text-align: right;">$${tvq.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f0f0f0; border-top: 2px solid #333; border-bottom: 2px solid #333;">
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">TOTAL:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="color: #666; margin: 0;">Merci de votre confiance!</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">Benoit Martel</p>
            <p style="margin: 5px 0;">58 rue Varennes, Laval (Québec) H7M 1V6</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
