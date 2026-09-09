import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode
} from 'react'

const KEYWORDS: Record<string, ReadonlySet<string>> = {
  javascript: new Set([
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'else',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'null',
    'return',
    'static',
    'switch',
    'throw',
    'true',
    'try',
    'typeof',
    'undefined',
    'while',
    'yield'
  ]),
  python: new Set([
    'and',
    'as',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'elif',
    'else',
    'except',
    'False',
    'finally',
    'for',
    'from',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'None',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'True',
    'try',
    'while',
    'with',
    'yield'
  ]),
  rust: new Set([
    'as',
    'async',
    'await',
    'break',
    'const',
    'continue',
    'crate',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'self',
    'Self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while'
  ])
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rs: 'rust',
  ts: 'javascript',
  tsx: 'javascript'
}

interface Token {
  end: number
  value: string
}

function quotedToken(code: string, start: number, quote: string): Token {
  let end = start + 1
  while (end < code.length) {
    if (code[end] === '\\') end += 2
    else if (code[end] === quote) {
      end += 1
      break
    } else end += 1
  }
  return { end, value: code.slice(start, end) }
}

function lineToken(code: string, start: number): Token {
  const newline = code.indexOf('\n', start)
  const end = newline === -1 ? code.length : newline
  return { end, value: code.slice(start, end) }
}

function blockCommentToken(code: string, start: number): Token {
  const closing = code.indexOf('*/', start + 2)
  const end = closing === -1 ? code.length : closing + 2
  return { end, value: code.slice(start, end) }
}

function wordToken(code: string, start: number): Token {
  let end = start + 1
  while (end < code.length && /[\w$]/.test(code[end])) end += 1
  return { end, value: code.slice(start, end) }
}

function numberToken(code: string, start: number): Token {
  let end = start + 1
  while (end < code.length && /[\d.]/.test(code[end])) end += 1
  return { end, value: code.slice(start, end) }
}

function nextToken(code: string, start: number): Token {
  const character = code[start]
  if (code.startsWith('//', start) || character === '#') {
    return lineToken(code, start)
  }
  if (code.startsWith('/*', start)) return blockCommentToken(code, start)
  if (character === '`' || character === '"' || character === "'") {
    return quotedToken(code, start, character)
  }
  if (/\d/.test(character)) return numberToken(code, start)
  if (/[A-Za-z_$]/.test(character)) return wordToken(code, start)
  return { end: start + 1, value: character }
}

function tokenClass(token: string, language: string) {
  if (
    token.startsWith('//') ||
    token.startsWith('/*') ||
    token.startsWith('#')
  ) {
    return 'blog-token-comment'
  }
  if (/^[`"']/.test(token)) return 'blog-token-string'
  if (/^\d/.test(token)) return 'blog-token-number'
  if (KEYWORDS[language]?.has(token)) return 'blog-token-keyword'
  if (/^[A-Z]/.test(token)) return 'blog-token-type'
  return undefined
}

function highlight(code: string, language: string) {
  const output: ReactNode[] = []
  let cursor = 0

  while (cursor < code.length) {
    const token = nextToken(code, cursor)
    const className = tokenClass(token.value, language)
    output.push(
      className ? (
        <span className={className} key={`${cursor}-${token.value}`}>
          {token.value}
        </span>
      ) : (
        token.value
      )
    )
    cursor = token.end
  }
  return output
}

export function BlogCode({
  children,
  className
}: ComponentPropsWithoutRef<'code'>) {
  const code = String(children).replace(/\n$/, '')
  const languageName = /language-([\w-]+)/.exec(className ?? '')?.[1]

  if (!languageName && !code.includes('\n')) {
    return <code className='blog-inline-code'>{children}</code>
  }

  const language =
    LANGUAGE_ALIASES[languageName ?? ''] ?? languageName ?? 'text'

  return (
    <figure className='blog-code-block'>
      <figcaption>{languageName ?? 'text'}</figcaption>
      <pre>
        <code>{highlight(code, language)}</code>
      </pre>
    </figure>
  )
}

function textContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textContent).join('')
  if (!isValidElement<{ children?: ReactNode }>(node)) return ''
  return textContent(node.props.children)
}

function taskDetails(children: ReactNode) {
  const text = textContent(children)
  const match = /^\s*\[([ xX])\]\s+/.exec(text)
  if (!match) return null
  return {
    checked: match[1].toLowerCase() === 'x',
    label: text.slice(match[0].length)
  }
}

export function BlogList({ children }: ComponentPropsWithoutRef<'ul'>) {
  const items = Children.toArray(children)
  const isTaskList = items.some(
    (item) =>
      isValidElement<{ children?: ReactNode }>(item) &&
      taskDetails(item.props.children)
  )

  return (
    <ul className={isTaskList ? 'blog-task-list' : 'blog-bullet-list'}>
      {children}
    </ul>
  )
}

export function BlogListItem({ children }: ComponentPropsWithoutRef<'li'>) {
  const task = taskDetails(children)
  if (!task) return <li>{children}</li>

  return (
    <li className='blog-task-item'>
      <input
        aria-label={task.label}
        checked={task.checked}
        disabled
        readOnly
        type='checkbox'
      />
      <span>{task.label}</span>
    </li>
  )
}
