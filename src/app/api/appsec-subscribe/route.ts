import { NextResponse } from 'next/server'

import { createRateLimiter } from '../../../lib/rateLimit'

const brevoFormUrl =
  'https://c073d8d8.sibforms.com/serve/MUIFAMIAQwwo1-91P5eaP1hpe1U4hufEDLms-syqqX9AMdMzjCo_QWtu5CGZKIYZAoNPxUwQqxe-oSz8CLXMST06LqkubO-9Yjuz_rcdRfs2z5EunEBMMLxSnwe9zXS54nPGOTkhYlc8J4S6AN-mnpl1esZ0ZoDBA6yV1JUR0S4jNXLElPmqfPthLDIukv_Ds9nB0NMb8K07JxOk-g=='

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const MAX_BODY_BYTES = 4096
const SUBSCRIBE_LIMIT = 5
const SUBSCRIBE_WINDOW_MS = 10 * 60 * 1000
const isWithinLimit = createRateLimiter(SUBSCRIBE_LIMIT, SUBSCRIBE_WINDOW_MS)

/** Browsers always send Origin on POST; reject cross-site and origin-less callers. */
function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function clientKey(request: Request) {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function reject(message: string, status: number) {
  return NextResponse.json({ message, success: false }, { status })
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return reject('Requests must come from this site.', 403)
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return reject('Request is too large.', 413)
  }
  if (!isWithinLimit(clientKey(request))) {
    return reject('Too many attempts. Please try again later.', 429)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reject('Enter a valid email address.', 400)
  }
  const email = String(form.get('email') ?? '').trim()
  const company = String(form.get('company') ?? '').trim()

  if (company) {
    return NextResponse.json({
      message:
        'One last step: check your email and click the confirmation link.',
      success: true
    })
  }

  if (!validEmail(email)) {
    return NextResponse.json(
      { message: 'Enter a valid email address.', success: false },
      { status: 400 }
    )
  }

  const brevoBody = new URLSearchParams({
    EMAIL: email,
    email_address_check: '',
    html_type: 'simple',
    locale: 'en'
  })

  try {
    const response = await fetch(brevoFormUrl, {
      body: brevoBody,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    })
    const result = (await response.json().catch(() => null)) as {
      message?: string
      success?: boolean
    } | null

    if (!response.ok || result?.success === false) {
      return NextResponse.json(
        {
          message:
            result?.message ||
            'Subscription could not be completed. Please try again.',
          success: false
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      message:
        'One last step: check your email and click the confirmation link.',
      success: true
    })
  } catch {
    return NextResponse.json(
      {
        message: 'Subscription service is temporarily unavailable. Try again.',
        success: false
      },
      { status: 502 }
    )
  }
}
