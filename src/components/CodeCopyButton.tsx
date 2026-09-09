'use client'

import { useState } from 'react'

interface CodeCopyButtonProps {
  code: string
}

export function CodeCopyButton({ code }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      aria-label={copied ? 'Code copied' : 'Copy code'}
      className='blog-copy-button'
      onClick={copyCode}
      type='button'
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
