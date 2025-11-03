<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import { Calendar as UiCalendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { DateValue } from 'radix-vue'
import { parseDate, getLocalTimeZone } from '@internationalized/date'

type Model = string | null

const props = withDefaults(defineProps<{
  modelValue: Model
  placeholder?: string
  stepMinutes?: number   // still used for the quick buttons snapping
}>(), {
  placeholder: 'Pick date & time',
  stepMinutes: 15,
})

const emit = defineEmits<{ (e:'update:modelValue', v:Model): void }>()

const date = ref<DateValue | undefined>(undefined)
const time = ref<string>('')          // "HH:MM"
const timeError = ref<string>('')

const display = computed(() =>
    props.modelValue ? dayjs(props.modelValue).format('DD.MM.YYYY, HH:mm') : props.placeholder
)

function dateValueToJs(dv: DateValue): Date {
  return dv.toDate(getLocalTimeZone())
}
function isoToDateValue(iso: string): DateValue {
  return parseDate(dayjs(iso).format('YYYY-MM-DD'))
}

// --- time helpers ---
function formatHHMM(raw: string): string {
  // keep digits only, insert ":" as HH:MM, limit to 5 chars
  const d = raw.replace(/\D/g, '').slice(0, 4)
  const hh = d.slice(0, 2)
  const mm = d.slice(2, 4)
  return mm ? `${hh}:${mm}` : hh
}
function isValidHHMM(hhmm: string): boolean {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!m) return false
  const h = Number(m[1]), mins = Number(m[2])
  return h >= 0 && h <= 23 && mins >= 0 && mins <= 59
}

watch(() => props.modelValue, (v) => {
  if (!v) { date.value = undefined; time.value = ''; timeError.value = ''; return }
  date.value = isoToDateValue(v)
  time.value = dayjs(v).format('HH:mm')
  timeError.value = ''
}, { immediate: true })

function commit() {
  if (!date.value) { emit('update:modelValue', null); return }
  const t = time.value || '00:00'
  timeError.value = time.value && !isValidHHMM(time.value) ? 'Use HH:MM (00–23, 00–59)' : ''
  const js = dateValueToJs(date.value)
  const dStr = dayjs(js).format('YYYY-MM-DD')
  emit('update:modelValue', `${dStr}T${t}:00`)
}

function onTimeInput(e: Event) {
  const el = e.target as HTMLInputElement
  time.value = formatHHMM(el.value)
  timeError.value = time.value && !isValidHHMM(time.value) ? 'Use HH:MM (00–23, 00–59)' : ''
}
function onTimeCommit() {
  if (!time.value) { timeError.value = ''; commit(); return }
  if (!isValidHHMM(time.value)) { timeError.value = 'Use HH:MM (00–23, 00–59)'; return }
  timeError.value = ''
  commit()
}

function quick(offsetMin: number) {
  const d = dayjs().add(offsetMin, 'minute')
  date.value = parseDate(d.format('YYYY-MM-DD'))
  // snap to nearest step
  const step = props.stepMinutes ?? 15
  const snapped = Math.round(d.minute() / step) * step
  time.value = `${d.format('HH')}:${String(snapped % 60).padStart(2,'0')}`
  timeError.value = ''
  commit()
}

function clearAll() {
  date.value = undefined
  time.value = ''
  timeError.value = ''
  emit('update:modelValue', null)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-full justify-start font-normal">
        {{ display }}
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-80 p-3 space-y-3 bg-black">
      <UiCalendar v-model="date" @update:modelValue="commit" />

      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Time (24h)</label>
        <Input
            v-model="time"
            inputmode="numeric"
            autocomplete="off"
            placeholder="HH:MM"
            class="font-mono"
            @input="onTimeInput"
            @keydown.enter.prevent="onTimeCommit"
            @blur="onTimeCommit"
        />
        <p v-if="timeError" class="text-xs text-red-500 mt-1">{{ timeError }}</p>
      </div>

      <div class="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="secondary" @click="quick(0)">Now</Button>
        <Button size="sm" variant="secondary" @click="quick(60)">+1h</Button>
        <Button size="sm" variant="secondary" @click="quick(180)">+3h</Button>
        <Button size="sm" variant="ghost" class="ml-auto" @click="clearAll">Clear</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
