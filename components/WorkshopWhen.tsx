import { formatWorkshopDisplay } from '@/lib/datetime'

export function WorkshopDateLabel({
  startsAt,
  timeZone = 'America/New_York',
}: {
  startsAt: string
  timeZone?: string
}) {
  const d = formatWorkshopDisplay(startsAt, timeZone)
  const mon = d.month.slice(0, 3).toUpperCase()
  return (
    <span className="d">
      {mon} {d.day}
    </span>
  )
}

export function WorkshopWhen({
  startsAt,
  timeZone = 'America/New_York',
}: {
  startsAt: string
  timeZone?: string
}) {
  const d = formatWorkshopDisplay(startsAt, timeZone)
  return (
    <>
      {d.date} · {d.timeWithZone}
    </>
  )
}
