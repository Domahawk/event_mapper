<!-- src/components/FilterSidebar.vue -->
<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DateTimePicker from '@/components/DateTimePicker.vue'
import type { EventFilters } from '@/types/filters'

const props = withDefaults(defineProps<{
  modelValue: boolean
  initial?: Partial<EventFilters>
}>(), { modelValue: false })

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'apply', filters: EventFilters): void
  (e: 'reset'): void
}>()

const state = reactive<EventFilters>({
  q: props.initial?.q ?? '',
  city: props.initial?.city ?? '',
  starts_at: props.initial?.starts_at ?? '',
  ends_at: props.initial?.ends_at ?? '',
  mine: props.initial?.mine ?? false,
})

watch(() => props.initial, (v) => {
  if (!v) return
  state.q = v.q ?? ''
  state.city = v.city ?? ''
  state.starts_at = v.starts_at ?? ''
  state.ends_at = v.ends_at ?? ''
  state.mine = v.mine ?? false
}, { deep: true })

function close() { emit('update:modelValue', false) }
function apply() { emit('apply', { ...state }); close() }
function reset() {
  state.q = ''
  state.city = ''
  state.starts_at = ''
  state.ends_at = ''
  state.mine = false
  emit('reset')
}
</script>

<template>
  <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-black/40"
      @click="close"
  />

  <aside
      class="fixed inset-y-0 left-0 z-50 w-[320px] max-w-[90vw] bg-black border-r shadow-xl
           transition-transform duration-300"
      :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
      @click.stop
  >
    <div class="p-4 space-y-4">
      <h2 class="text-lg font-semibold">Filters</h2>

      <div class="space-y-1">
        <label class="text-sm">Search</label>
        <Input v-model="state.q" placeholder="Title or description" />
      </div>

      <div class="space-y-1">
        <label class="text-sm">City</label>
        <Input v-model="state.city" placeholder="e.g. Zagreb" />
      </div>

      <div class="grid grid-cols-1 gap-3">
        <div class="space-y-1">
          <label class="text-sm">Starts after</label>
          <DateTimePicker v-model="state.starts_at" />
        </div>
        <div class="space-y-1">
          <label class="text-sm">Ends before</label>
          <DateTimePicker v-model="state.ends_at" />
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="state.mine" class="accent-white" />
        Only my events
      </label>

      <div class="pt-2 flex gap-2">
        <Button variant="outline" class="flex-1" @click="reset">Reset</Button>
        <Button class="flex-1" @click="apply">Apply</Button>
      </div>
    </div>
  </aside>
</template>
