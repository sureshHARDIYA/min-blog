'use client'

import Link from 'next/link'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { useLanguage } from '../../i18n/LanguageContext'

interface PostSummary { slug: string; title: string; description: string; date: string }

export function BlogsContent({ posts }: { posts: PostSummary[] }) {
  const { language } = useLanguage()
  const text = language === 'no'
    ? { title: 'Feltnotater', intro: 'Det jeg lærer av arkitekturbeslutninger, sikkerhetsgjennomganger og de mindre ryddige delene av programvareutvikling.' }
    : { title: 'Field notes', intro: 'What I am learning from architecture decisions, security reviews and the less tidy parts of building software.' }

  return <main className='min-h-screen bg-[#0C0C0C] px-6 py-20 text-[#F5F5F5]'><section className='mx-auto max-w-3xl'>
    <div className='flex items-center justify-between gap-4'><Link className='text-sm text-cyan-400 hover:underline' href='/'>← Suresh Kumar Mukhiya</Link><LanguageSwitcher /></div>
    <h1 className='mt-10 text-5xl font-bold tracking-tight'>{text.title}</h1><p className='mt-4 text-lg text-white/65'>{text.intro}</p>
    <div className='mt-12 divide-y divide-white/10'>{posts.map((post) => <article className='py-8 first:pt-0' key={post.slug}><time className='text-sm text-cyan-400' dateTime={post.date}>{post.date}</time><h2 className='mt-2 text-2xl font-semibold'><Link className='hover:text-cyan-300' href={`/blog/${post.slug}`}>{post.title}</Link></h2><p className='mt-3 text-white/65'>{post.description}</p></article>)}</div>
  </section></main>
}
