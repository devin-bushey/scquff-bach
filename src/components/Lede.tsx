export default function Lede({
  num,
  title,
  right,
}: {
  num: string
  title: string
  right?: string
}) {
  return (
    <div className="flex items-baseline gap-3.5 pt-9 pb-1.5">
      <span className="font-mono text-[13px] text-dim">{num}</span>
      <h2 className="text-[26px] font-semibold tracking-[-0.01em]">{title}</h2>
      {right && (
        <span className="ml-auto font-mono text-[11px] tracking-[0.1em] text-dim uppercase">
          {right}
        </span>
      )}
    </div>
  )
}
