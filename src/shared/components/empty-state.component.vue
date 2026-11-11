<script>
/** @component OpEmptyState - friendly "nothing here" panel; put a call to action in the default slot. */
export default {
  name: 'OpEmptyState',
  props: {
    icon: { type: String, default: 'pi pi-inbox' },
    title: { type: String, default: '' },
    message: { type: String, default: '' }
  }
};
</script>

<template>
  <div class="op-state op-state--empty">
    <i :class="['op-state__icon', icon]" aria-hidden="true"></i>
    <h2 class="op-state__title">{{ title || $t('state.emptyTitle') }}</h2>
    <p v-if="message" class="op-state__text">{{ message }}</p>
    <div v-if="$slots.default" class="op-state__action"><slot /></div>
  </div>
</template>

<style scoped>
.op-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--op-space-3); padding: var(--op-space-8) var(--op-space-4); text-align: center;
  background: var(--op-surface); border: 1px dashed var(--op-border-strong); border-radius: var(--op-radius-lg);
}
.op-state__icon { font-size: 2.25rem; color: var(--op-brand); opacity: 0.8; }
.op-state__title { font-size: 1.15rem; color: var(--op-text-strong); }
.op-state__text { color: var(--op-text-muted); max-width: 44ch; }
</style>
