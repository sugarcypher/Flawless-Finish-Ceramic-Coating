# Email Setup Guide for Flawless Finish Ceramic Coating

## Email Configuration

Your website is now configured to send email notifications to **j@flawlessfini.sh** when customers make bookings.

## Required Email Settings

Update your `.env` file with these email credentials:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JASON_EMAIL=j@flawlessfini.sh
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS`

## Alternative Email Providers

### Outlook/Hotmail
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### Yahoo
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

## What Happens When Someone Books

When a customer makes a booking (with or without deposit), you'll receive a professional email with:

- ✅ Customer name, phone, and email
- 📅 Booking date and time
- 💰 Deposit amount and payment method
- 🚗 Vehicle information (if provided)
- 📞 Direct call button
- 🎨 Professional branding

## Testing

1. Start the server: `node server.js`
2. Visit: `http://localhost:3000`
3. Make a test booking
4. Check your email at **j@flawlessfini.sh**

## Troubleshooting

- **"Email skipped"**: Check your email credentials in `.env`
- **Authentication failed**: Verify your app password
- **Connection timeout**: Check your internet and email provider settings

The email system will work without any external dependencies once configured!
