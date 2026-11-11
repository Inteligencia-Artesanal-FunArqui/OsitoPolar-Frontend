<script>
/** @component OpErrorState - error panel with an optional retry action. */
export default {
  name: 'OpErrorState',
  props: {
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    retryable: { type: Boolean, default: true }
  },
  emits: ['retry']
};
</script>

<template>
  <div class="op-state op-state--error" role="alert">
    <i class="pi pi-exclamation-triangle op-state__icon" aria-hidden="true"></i>
    <h2 class="op-state__title">{{ title || $t('state.errorTitle') }}</h2>
    <p class="op-state__text">{{ message || $t('state.errorGeneric') }}</p>
    <pv-button v-if="retryable" :label="$t('state.retry')" icon="pi pi-refresh" severity="secondary" outlined @click="$emit('retry')" />
  </div>
</template>

<style scoped>
.op-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--op-space-3); padding: var(--op-space-8) var(--op-space-4); text-align: center;
  background: var(--op-surface); border: 1px dashed var(--op-border-strong); border-radius: var(--op-radius-lg);
}
.op-state__icon { font-size: 2rem; color: var(--op-danger); }
.op-state__title { font-size: 1.15rem; color: var(--op-text-strong); }
.op-state__text { color: var(--op-text-muted); max-width: 44ch; }
</style>
