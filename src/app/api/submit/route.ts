import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeFormData } from '@/lib/sanitize';

// Hubsolv API configuration
const HUBSOLV_API_URL = process.env.HUBSOLV_API_URL || 'https://api.hubsolv.com/leads';
const HUBSOLV_USERNAME = process.env.HUBSOLV_USERNAME || '';
const HUBSOLV_PASSWORD = process.env.HUBSOLV_PASSWORD || '';

// Hardcoded lead generator
const LEAD_GENERATOR = 'iva-advice';

interface SubmitPayload {
  answers: Record<string, string>;
  metadata: {
    timeOnForm: number;
    userAgent: string;
    timestamp: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body first
    let body: SubmitPayload;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(clientIP, {
      interval: 60000, // 1 minute
      maxRequests: 5,  // 5 submissions per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Log received data for debugging
    console.log('Received submission:', JSON.stringify(body.answers, null, 2));

    // Validate required fields
    if (!body.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize form data
    const sanitizedData = sanitizeFormData(body.answers);
    console.log('Sanitized data:', JSON.stringify(sanitizedData, null, 2));

    // Validate required sanitized fields
    if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.phone) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate UK phone number format (more lenient - just check it has enough digits)
    const cleanPhone = sanitizedData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      console.log('Phone validation failed:', sanitizedData.phone, 'clean:', cleanPhone);
      return NextResponse.json(
        { error: 'Invalid UK phone number' },
        { status: 400 }
      );
    }

    // Check consent
    if (sanitizedData.consent !== 'accept') {
      return NextResponse.json(
        { error: 'Consent is required' },
        { status: 400 }
      );
    }

    // Prepare Hubsolv payload
    const hubsolvPayload = {
      source: 'iva-advice.co',
      leadGenerator: LEAD_GENERATOR,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      debtAmount: sanitizedData.debtAmount,
      numberOfDebts: sanitizedData.debtCount,
      employmentStatus: sanitizedData.employment,
      metadata: {
        timeOnForm: body.metadata?.timeOnForm,
        userAgent: body.metadata?.userAgent?.substring(0, 500),
        submittedAt: body.metadata?.timestamp || new Date().toISOString(),
        ipAddress: clientIP,
      },
    };

    // Submit to Hubsolv API
    if (HUBSOLV_USERNAME && HUBSOLV_PASSWORD) {
      const authHeader = Buffer.from(`${HUBSOLV_USERNAME}:${HUBSOLV_PASSWORD}`).toString('base64');

      const hubsolvResponse = await fetch(HUBSOLV_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify(hubsolvPayload),
      });

      if (!hubsolvResponse.ok) {
        const errorText = await hubsolvResponse.text();
        console.error('Hubsolv API error:', hubsolvResponse.status, errorText);

        // Don't expose internal errors to client
        return NextResponse.json(
          { error: 'Failed to process submission. Please try again.' },
          { status: 500 }
        );
      }

      try {
        const hubsolvResult = await hubsolvResponse.json();
        console.log('Hubsolv submission successful:', hubsolvResult.id || 'no-id');
      } catch {
        console.log('Hubsolv submission successful (non-JSON response)');
      }
    } else {
      // Development mode - log the payload
      console.log('Development mode - would submit to Hubsolv:', JSON.stringify(hubsolvPayload, null, 2));
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error('Submission error:', error instanceof Error ? error.message : error);
    console.error('Stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
