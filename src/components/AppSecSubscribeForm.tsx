'use client'

import { type FormEvent, useState } from 'react'

interface SubscribeResponse {
  message?: string
  success?: boolean
}

export function AppSecSubscribeForm() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('pending')
    setMessage('')

    try {
      const response = await fetch('/api/appsec-subscribe', {
        body: new FormData(form),
        method: 'POST'
      })
      const result = (await response.json()) as SubscribeResponse

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Subscription could not be completed.')
      }

      form.reset()
      setStatus('success')
      setMessage(
        result.message || 'One last step: check your email and click the confirmation link.'
      )
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Subscription could not be completed. Please try again.'
      )
    }
  }

  return (
    <>
      <form
        className='mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row'
        onSubmit={subscribe}
      >
        <label className='sr-only' htmlFor='appsec-subscribe-email'>
          Email address
        </label>
        <input
          autoComplete='email'
          className='min-h-12 flex-1 border border-white/20 bg-[#0C0C0C] px-4 text-base text-white outline-none placeholder:text-white/40 focus:border-cyan-400'
          disabled={status === 'pending'}
          id='appsec-subscribe-email'
          name='email'
          placeholder='you@example.com'
          required
          type='email'
        />
        <input
          aria-hidden='true'
          autoComplete='off'
          className='hidden'
          name='company'
          tabIndex={-1}
          type='text'
        />
        <button
          className='min-h-12 bg-cyan-400 px-5 py-3 font-semibold text-[#071013] transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-wait disabled:opacity-60'
          disabled={status === 'pending'}
          type='submit'
        >
          {status === 'pending' ? 'Subscribing…' : 'Subscribe free →'}
        </button>
      </form>
      <p
        aria-live='polite'
        className={
          status === 'error'
            ? 'mt-3 text-sm text-red-300'
            : status === 'success'
              ? 'mt-3 text-sm text-emerald-300'
              : 'sr-only'
        }
        role='status'
      >
        {message}
      </p>
    </>
  )
}
