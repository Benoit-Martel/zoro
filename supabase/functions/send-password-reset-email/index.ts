import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("=== Password Reset Email Function Called ===");

  try {
    const body = await req.json();
    const { email, resetToken } = body;

    if (typeof email !== "string" || !email || typeof resetToken !== "string" || !resetToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email and resetToken are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user information
    const { data: user, error: userError } = await supabase
      .from("zoro_users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: storedToken, error: tokenError } = await supabase
      .from("zoro_password_reset_tokens")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("token", resetToken)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !storedToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired reset token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build the reset password link
    // Use APP_BASE_URL from environment or fallback to localhost
    const baseUrl =
      Deno.env.get("APP_BASE_URL") || "http://localhost:5173/zoro";
    const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "Benoit Martel <facturation@zoro.benoitmartel.com>",
        to: [email],
        subject: "Réinitialisation de votre mot de passe - Zorodateur",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9fafb; }
              .button { 
                display: inline-block; 
                padding: 12px 30px; 
                background-color: #2563eb; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
              .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Zorodateur</h1>
                <p>Réinitialisation de mot de passe</p>
              </div>
              
              <div class="content">
                <p>Bonjour,</p>
                
                <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Zorodateur.</p>
                
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                
                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
                  ${resetLink}
                </p>
                
                <div class="warning">
                  <strong>Important :</strong> Ce lien expirera dans 24 heures pour des raisons de sécurité.
                </div>
                
                <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                
                <p>Cordialement,<br>L'équipe Zorodateur</p>
              </div>
              
              <div class="footer">
                <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
                <p>&copy; 2026 Zorodateur. Tous droits réservés.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send email",
          error: emailResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset email sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in password reset email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
