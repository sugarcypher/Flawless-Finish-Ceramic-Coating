# Flawless Finish Ceramic Coating

Professional ceramic coating service website for Palm Springs & Coachella Valley with integrated Stripe payments and Twilio SMS notifications.

## Features

- **Real-time Booking Calendar** - 30-day availability with one car per day
- **Stripe Payment Integration** - Secure $250 deposit processing
- **Cash Reservation Option** - For customers who prefer to pay in person
- **SMS Notifications** - Jason receives instant notifications via Twilio
- **Responsive Design** - Mobile-optimized for all devices
- **Professional Branding** - Desert-luxe aesthetic for Palm Springs market

## Setup Instructions

### 1. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Twilio SMS Configuration  
TWILIO_SID=your_twilio_account_sid
TWILIO_TOKEN=your_twilio_auth_token
TWILIO_FROM=+1234567890
TWILIO_TO=+1234567890

# Server Configuration
PORT=3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Server

```bash
npm start
```

The website will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - Main website
- `GET /api/availability?days=30` - Get booking availability
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment and save booking
- `POST /api/book-cash` - Create cash reservation
- `GET /api/stripe-key` - Get Stripe publishable key

## Booking Flow

1. **Customer selects date** from available calendar
2. **Payment options appear**:
   - Cash reservation (no payment required)
   - $250 deposit via Stripe (secure card processing)
3. **SMS notification sent** to Jason with booking details
4. **Booking saved** to `bookings.json` file

## Business Information

- **Owner**: Jason (Jay)
- **Phone**: 442-342-3627
- **Service Area**: Palm Springs & Coachella Valley
- **Pricing**: $800-$2,100 depending on coating level
- **Deposit**: $250 (applied to total cost)

## Images Setup

1. **Jason's Headshot**: Save Jason's professional photo as `images/jason-headshot.jpg`
2. **Gallery Photos**: The gallery uses high-quality car photos from Unsplash
3. **Custom Photos**: Replace Unsplash URLs with your own high-quality car photos if desired

## Deployment

The website is ready for deployment to any Node.js hosting service:

- **Heroku**: Add environment variables in dashboard
- **Vercel**: Add environment variables in project settings  
- **DigitalOcean**: Use App Platform with environment variables
- **Railway**: Add environment variables in project settings

## Security Features

- Rate limiting (200 requests per 15 minutes)
- Helmet.js security headers
- Input sanitization
- CORS protection
- Compression for performance

## Support

For technical issues or questions about the booking system, contact the development team.

For ceramic coating services, call Jason at **442-342-3627**.

