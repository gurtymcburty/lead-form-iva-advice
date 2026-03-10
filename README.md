# Lead Capture Form - IVA Advice

A Next.js lead capture form for iva-advice.co. Replaces Typeform + Zapier with a custom solution that submits directly to Hubsolv API.

## Features

- **Typeform-style UX**: Clean, step-by-step form experience
- **Security**: Rate limiting, honeypot field, input sanitization
- **Direct API integration**: Submits leads directly to Hubsolv

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your Hubsolv credentials:
   ```
   HUBSOLV_API_URL=https://api.hubsolv.com/leads
   HUBSOLV_USERNAME=your_username
   HUBSOLV_PASSWORD=your_password
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment on Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `HUBSOLV_API_URL`
   - `HUBSOLV_USERNAME`
   - `HUBSOLV_PASSWORD`
4. Deploy

## Embedding in Hugo Site

Add an iframe to your Hugo template:

```html
<iframe
  src="https://lead-form-iva-advice.vercel.app/"
  width="100%"
  height="600"
  frameborder="0"
  title="Get Your Free Debt Assessment"
></iframe>
```

## Form Questions

1. Total debt amount
2. Number of creditors
3. Employment status
4. Homeowner status
5. Full name
6. Email address
7. Phone number

## API Endpoint

### POST /api/submit

Submits form data to Hubsolv.

**Request body:**
```json
{
  "answers": {
    "debt_amount": "over_20000",
    "creditors": "3_or_more",
    "employment": "employed",
    "homeowner": "yes",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "07700900000"
  },
  "metadata": {
    "timeOnForm": 45000,
    "userAgent": "...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully"
}
```

## Security Features

- **Rate limiting**: 5 submissions per minute per IP
- **Honeypot field**: Hidden field to catch bots
- **Time check**: Rejects submissions completed in < 5 seconds
- **Input sanitization**: All inputs are sanitized before processing
- **Phone validation**: UK phone number format required
- **Email validation**: Standard email format required

## Development

```bash
# Start dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel (deployment)
