# Invoice Email Sending Feature

This document explains how to set up and deploy the invoice email sending feature for the Zoro timesheet application.

## Overview

The email feature allows users to send invoices via email directly from the InvoiceDetail page. When a user clicks the "Envoyer" (Send) button on an invoice:

1. A modal appears asking for the recipient email, subject, and message
2. The modal is pre-filled with the client's email address
3. When submitted, the invoice is sent as an HTML email
4. The invoice status is updated to "sent"

## Architecture

### Frontend (Vue 3)

- **InvoiceDetail.vue**: Contains the email modal UI and sends the request
- **SupabaseService**: Contains the `sendInvoiceEmail()` method that calls the edge function

### Backend (Supabase)

- **Edge Function** (`send-invoice-email`):
  - Fetches invoice data from Supabase
  - Generates a formatted HTML email with invoice details
  - Sends the email via Resend API (or another email service)
  - Updates the invoice status to "sent"

## Setup Instructions

### Step 1: Configure Environment Variables

Add the following environment variables to your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Project Settings → Edge Functions
3. Add the following environment variable:

```
RESEND_API_KEY=your_resend_api_key_here
```

### Step 2: Get a Resend API Key

1. Sign up for a free account at [Resend.com](https://resend.com)
2. Go to your API keys section
3. Create a new API key
4. Copy the key and paste it into the Supabase environment variable

**Note**: Resend is recommended because it's email-friendly for transactional emails. However, you can replace it with any email service (SendGrid, Mailgun, AWS SES, etc.) by modifying the `index.ts` file.

### Step 3: Deploy the Edge Function

#### Option A: Using Supabase CLI (Recommended)

1. Install the Supabase CLI if you haven't already:

   ```bash
   npm install -g supabase
   ```

2. Log in to Supabase:

   ```bash
   supabase login
   ```

3. Deploy the edge function:
   ```bash
   supabase functions deploy send-invoice-email --project-id your_project_id
   ```

#### Option B: Manual Deployment

1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Click "Create a new function"
4. Name it `send-invoice-email`
5. Copy the contents of `supabase/functions/send-invoice-email/index.ts` into the editor
6. Click "Deploy"

### Step 4: Test the Feature

1. Open an invoice in the application
2. Click the "Envoyer" (Send/Email) button (the envelope icon)
3. A modal will appear with the recipient email pre-filled
4. Enter a test email address
5. Click "Envoyer" to send the email

If `RESEND_API_KEY` is not configured, the function will simulate the email send (log it instead) for development purposes.

## Email Service Options

### Resend (Recommended)

- Free tier: 100 emails/day
- Production ready
- Easy setup
- Good deliverability

### SendGrid

- Free tier: 100 emails/month
- Reliable
- Replace the fetch call in `index.ts`:
  ```typescript
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sendgridApiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: recipient }] }],
      from: { email: "noreply@zoro.app" },
      subject: subject,
      content: [{ type: "text/html", value: emailHtml }],
    }),
  });
  ```

### AWS SES

- Free tier: 62,000 emails/month
- Best for high volume
- More complex setup

### Mailgun

- Free tier: 100 emails/month
- Good API
- Reliable

## Database Schema

The feature uses these existing tables:

- `zoro_invoices` - Invoice records
- `zoro_invoice_items` - Line items
- `zoro_projects` - Project information
- `zoro_clients` - Client information

## Email Template

The generated email includes:

- Invoice number and date
- Client information
- Project name
- Itemized table with:
  - Description
  - Quantity
  - Unit price
  - Subtotal
- Tax calculations:
  - TPS (5%)
  - TVQ (9.975%)
- Total amount
- Custom message from the sender
- Sender information

## Troubleshooting

### Email not sending

1. Check that `RESEND_API_KEY` is set in Supabase environment variables
2. Verify the recipient email address is valid
3. Check Supabase Edge Functions logs for errors

### Invoice status not updating

1. Verify the invoice ID is correct
2. Check database permissions for the authenticated user
3. View the response from the edge function

### "Edge function not found"

1. Make sure the edge function is deployed
2. Verify the function name matches exactly: `send-invoice-email`
3. Check that the project ID is correct

## Development Notes

### Testing without email service

For development, you can comment out the Resend API call and just return a success response. The function already handles the case where `RESEND_API_KEY` is not configured.

### Customizing the email template

To modify the email HTML template, edit the `generateInvoiceHTML()` function in `supabase/functions/send-invoice-email/index.ts`.

### Adding attachments

To add the invoice as a PDF attachment:

1. Generate a PDF from the invoice data
2. Convert it to base64
3. Add it to the email body with Resend's attachment support

## Security Considerations

1. **Authentication**: The edge function inherits authentication from the Supabase request
2. **Data Access**: Only invoices accessible to the authenticated user should be sent
3. **Rate Limiting**: Consider adding rate limiting to prevent email spam
4. **Validation**: All inputs are validated on both client and server

## Future Enhancements

- [ ] Add PDF attachment generation
- [ ] Support multiple recipients
- [ ] Schedule emails to send later
- [ ] Add email templates with customization
- [ ] Track email delivery status
- [ ] Add bounce/complaint handling
- [ ] Integration with email marketing services

## Support

For issues or questions:

1. Check Supabase Edge Functions logs
2. Verify environment variables are set
3. Test with a fresh invoice
4. Check your email service dashboard for delivery status
