import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeFormData } from '@/lib/sanitize';

// Hubsolv API configuration
const HUBSOLV_API_URL = process.env.HUBSOLV_ENDPOINT || 'https://synigise.hubsolv.com/api/client/format/json';
const HUBSOLV_API_KEY = process.env.HUBSOLV_API_KEY || process.env.HUBSOLV_PASSWORD || '';
const HUBSOLV_AUTH = process.env.HUBSOLV_AUTH || 'admin|1234';
const HUBSOLV_CAMPAIGN_ID = process.env.HUBSOLV_CAMPAIGN_ID || '11';

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

    // Map debt_amount values to display labels
    const debtAmountLabels: Record<string, string> = {
      'under_5000': 'Less than £5000',
      '5001_20000': '£5001-£20,000',
      'over_20000': '£20,001 or more',
      'not_sure': 'Not Sure',
    };

    // Map debt_count values to display labels
    const debtCountLabels: Record<string, string> = {
      '1': '1',
      '2': '2',
      '3_or_more': '3 or More',
      'not_sure': 'Not sure',
    };

    // Map employment values to display labels
    const employmentLabels: Record<string, string> = {
      'employed': 'Employed',
      'self_employed': 'Self-Employed',
      'retired': 'Retired',
      'unemployed': 'Unemployed',
    };

    // Format phone number with +44 prefix if needed
    let formattedPhone = sanitizedData.phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+44' + formattedPhone.substring(1);
    }

    // Prepare Hubsolv payload matching their exact format
    const hubsolvPayload = {
      'HUBSOLV-API-KEY': HUBSOLV_API_KEY,
      'campaignid': HUBSOLV_CAMPAIGN_ID,
      'firstname': sanitizedData.firstName,
      'lastname': sanitizedData.lastName,
      'email': sanitizedData.email,
      'phone_mobile': formattedPhone,
      'lead_source': 'Upsave',
      'lead_type': 'website_lead',
      'lead_generator': 'iva-advice.co',
      'debt_level': debtAmountLabels[sanitizedData.debtAmount] || sanitizedData.debtAmount,
      'total_debts': debtCountLabels[sanitizedData.debtCount] || sanitizedData.debtCount,
      'employment_status': employmentLabels[sanitizedData.employment] || sanitizedData.employment,
      'auth': HUBSOLV_AUTH,
    };

    // Submit to Hubsolv API
    console.log('Hubsolv config:', {
      url: HUBSOLV_API_URL,
      hasApiKey: !!HUBSOLV_API_KEY,
      campaignId: HUBSOLV_CAMPAIGN_ID,
    });
    console.log('Hubsolv payload:', JSON.stringify(hubsolvPayload, null, 2));

    if (HUBSOLV_API_KEY) {
      const hubsolvResponse = await fetch(HUBSOLV_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubsolvPayload),
      });

      if (!hubsolvResponse.ok) {
        const errorText = await hubsolvResponse.text();
        console.error('Hubsolv API error:', hubsolvResponse.status, errorText);
        console.error('Hubsolv payload was:', JSON.stringify(hubsolvPayload, null, 2));

        // Temporarily expose error for debugging - REMOVE IN PRODUCTION
        return NextResponse.json(
          {
            error: 'Hubsolv API error',
            debug: {
              status: hubsolvResponse.status,
              response: errorText.substring(0, 500),
              endpoint: HUBSOLV_API_URL,
            }
          },
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
      // Development mode - no API key configured
      console.log('Development mode (no HUBSOLV_API_KEY) - would submit:', JSON.stringify(hubsolvPayload, null, 2));
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
