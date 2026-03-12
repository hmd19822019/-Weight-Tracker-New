export function calculateBMI(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive numbers')
  }
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export function calculateBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'overweight'
  return 'obese'
}

export function predictWeight(
  records: Array<{ date: Date; weight: number }>,
  daysAhead: number
): number | null {
  if (records.length < 2) return null

  // 线性回归
  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime())
  const baseTime = sortedRecords[0].date.getTime()

  const points = sortedRecords.map(r => ({
    x: (r.date.getTime() - baseTime) / (1000 * 60 * 60 * 24), // 转换为天数
    y: r.weight
  }))

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const lastDay = points[points.length - 1].x
  const futureDay = lastDay + daysAhead

  return slope * futureDay + intercept
}

export function calculateWeightChange(currentWeight: number, previousWeight: number): number {
  return currentWeight - previousWeight
}
