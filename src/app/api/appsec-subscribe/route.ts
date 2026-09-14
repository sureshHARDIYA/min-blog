import { NextResponse } from 'next/server'

const brevoFormUrl =
  'https://c073d8d8.sibforms.com/serve/MUIFAMIAQwwo1-91P5eaP1hpe1U4hufEDLms-syqqX9AMdMzjCo_QWtu5CGZKIYZAoNPxUwQqxe-oSz8CLXMST06LqkubO-9Yjuz_rcdRfs2z5EunEBMMLxSnwe9zXS54nPGOTkhYlc8J4S6AN-mnpl1esZ0ZoDBA6yV1JUR0S4jNXLElPmqfPthLDIukv_Ds9nB0NMb8K07JxOk-g=='

function validEmail(value: string) {
  return (
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  )
}

export async function POST(request: Request) {
  const form = await request.formData()
  const email = String(form.get('email') ?? '').trim()
  const company = String(form.get('company') ?? '').trim()

  if (company) {
    return NextResponse.json({
      message: 'One last step: check your email and click the confirmation link.',
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
      message: 'One last step: check your email and click the confirmation link.',
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
