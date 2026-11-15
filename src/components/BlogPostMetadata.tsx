export function BlogPostMetadata({
  date,
  category,
  locale = 'en-GB'
}: {
  date: string
  category?: string
  locale?: string
}) {
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`))

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
      <time
        className='font-code text-xs font-bold uppercase tracking-wider text-[#00FF41] [html.light_&]:text-[#008822]'
        dateTime={date}
      >
        {formattedDate}
      </time>
      {category && (
        <span className='border border-white/10 bg-white/5 px-2 py-0.5 font-code text-[10px] leading-4 text-white/65 [html.light_&]:border-slate-200 [html.light_&]:bg-slate-50 [html.light_&]:text-slate-600'>
          {category}
        </span>
      )}
    </div>
  )
}
