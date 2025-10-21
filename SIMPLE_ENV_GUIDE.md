# Simple .env Configuration Guide

## What's Already Set Up ✅

Your `.env` file is now configured with:

### Stripe Payment (REQUIRED - Already Working)
- ✅ **STRIPE_PUBLISHABLE_KEY**: Your public key for payments
- ✅ **STRIPE_SECRET_KEY**: Your secret key for processing payments  
- ✅ **STRIPE_BASE_URL**: Stripe API endpoint
- ✅ **STRIPE_ACCOUNT_ID**: Your Stripe account ID
- ✅ **DEPOSIT_AMOUNT**: $250 (in cents = 25000)

### Email Notifications (OPTIONAL - Only if you want email alerts)
- 📧 **EMAIL_USER**: Your Gmail address (for sending emails)
- 📧 **EMAIL_PASS**: Your Gmail app password (for sending emails)
- 📧 **JASON_EMAIL**: j@flawlessfini.sh (where notifications go)

## What You Need to Do

### 1. For Basic Website (No Email) - DO NOTHING! ✅
Your website works perfectly right now with:
- Stripe payments
- Booking system
- All features

### 2. For Email Notifications (Optional)
If you want to receive email alerts when someone books:

1. **Get a Gmail App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

2. **Update .env file**:
   - Change `your-email@gmail.com` to your actual Gmail
   - Change `your-app-password` to the app password you generated

## Current Status
- ✅ Website: Working perfectly
- ✅ Payments: Working with Stripe
- ✅ Booking: Working
- ⚠️ Email: Optional (will work once you add Gmail credentials)

## Test Your Website
1. Run: `node server.js`
2. Visit: `http://localhost:3000`
3. Try booking with a test payment!

The website works great without email - you can add email later if you want!
