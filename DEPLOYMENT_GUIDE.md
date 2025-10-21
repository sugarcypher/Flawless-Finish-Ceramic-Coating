# 🚀 Render Deployment Guide

## Environment Variables Needed
Add these environment variables in your Render dashboard:

```
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
STRIPE_BASE_URL=https://api.stripe.com
STRIPE_ACCOUNT_ID=your_account_id_here
PORT=3000
NODE_ENV=production
DEPOSIT_AMOUNT=25000
CURRENCY=usd
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JASON_EMAIL=j@flawlessfini.sh
```

## Steps
1. Go to Render dashboard
2. Find your service
3. Go to Environment tab
4. Add the variables above
5. Redeploy

## Security Note
Never commit actual API keys to the repository!
