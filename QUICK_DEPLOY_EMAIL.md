# Quick Deploy Steps - Invoice Email Feature

## TL;DR - Get emails working in 5 minutes

### 1. Get Resend API Key (2 min)

```bash
# Go to https://resend.com and sign up
# Create API key from dashboard
# Copy the key
```

### 2. Set Environment Variable (1 min)

In Supabase Dashboard:

- Project Settings → Edge Functions → Environment Variables
- Add: `RESEND_API_KEY=your_key_here`
- Save

### 3. Deploy Edge Function (1 min)

```bash
# Option A: Using CLI
supabase functions deploy send-invoice-email --project-id YOUR_PROJECT_ID

# Option B: Copy-paste
# Go to Supabase Dashboard → Edge Functions → Create function
# Name: send-invoice-email
# Copy contents from supabase/functions/send-invoice-email/index.ts
# Deploy
```

### 4. Test (1 min)

- Open an invoice
- Click envelope icon
- Enter test email
- Send!

## Done! 🎉

The feature is now active. Users can send invoices via email from the invoice detail page.

## Need Help?

Check `INVOICE_EMAIL_SETUP.md` for detailed instructions and troubleshooting.
