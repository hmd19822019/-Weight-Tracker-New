import dayjs from 'dayjs'

export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function parseDate(dateString: string): Date {
  return dayjs(dateString).toDate()
}

export function isToday(date: Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

export function getDaysAgo(days: number): Date {
  return dayjs().subtract(days, 'day').toDate()
}

export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.toDate())
    current = current.add(1, 'day')
  }

  return dates
}
