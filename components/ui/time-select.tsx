import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimeSelect({ value, onChange, placeholder = "选择时间", className }: TimeSelectProps) {
  // 生成15分钟倍数的时间选项，按时间段分组
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push({
          value: timeString,
          label: timeString,
          period: hour < 6 ? '凌晨' : hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'
        })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions.map((time) => (
          <SelectItem key={time.value} value={time.value}>
            <span className="flex items-center">
              <span className="text-xs text-gray-500 mr-2 w-8">{time.period}</span>
              <span>{time.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
