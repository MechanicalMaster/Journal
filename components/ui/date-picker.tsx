"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [month, setMonth] = React.useState<number>(date?.getMonth() || new Date().getMonth())
  const [year, setYear] = React.useState<number>(date?.getFullYear() || new Date().getFullYear())

  // Create arrays for month and year options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Create array of years (20 years before and after current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i)

  // Update month state when date changes from Calendar component
  React.useEffect(() => {
    if (date) {
      setMonth(date.getMonth())
      setYear(date.getFullYear())
    }
  }, [date])
  
  // Update the displayed calendar when month/year selects change
  const handleMonthChange = (newMonth: string) => {
    const monthIndex = months.indexOf(newMonth)
    setMonth(monthIndex)
    
    // Create new date to set in the calendar
    const newDate = date ? new Date(date) : new Date()
    newDate.setMonth(monthIndex)
    newDate.setFullYear(year)
    setDate(newDate)
  }
  
  const handleYearChange = (newYear: string) => {
    const yearValue = parseInt(newYear, 10)
    setYear(yearValue)
    
    // Create new date to set in the calendar
    const newDate = date ? new Date(date) : new Date()
    newDate.setMonth(month)
    newDate.setFullYear(yearValue)
    setDate(newDate)
  }

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 flex justify-between items-center border-b">
          <Select value={months[month]} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder={months[month]} />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder={year.toString()} />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate)
            // Leave the popover open to allow for further selection
            // setIsCalendarOpen(false)
          }}
          month={new Date(year, month)}
          onMonthChange={(newMonth) => {
            setMonth(newMonth.getMonth())
            setYear(newMonth.getFullYear())
          }}
          initialFocus
        />
        
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate(new Date())
              setMonth(new Date().getMonth())
              setYear(new Date().getFullYear())
            }}
          >
            Today
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCalendarOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 