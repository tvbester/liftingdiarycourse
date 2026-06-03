'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DatePicker({ selected }: { selected: Date }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function handleSelect(d: Date | undefined) {
    if (!d) return
    const params = new URLSearchParams({ date: format(d, 'yyyy-MM-dd') })
    router.push(`${pathname}?${params}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(selected, 'do MMM yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
