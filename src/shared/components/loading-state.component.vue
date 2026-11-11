<script>
/** @component OpLoadingState - centered spinner with an accessible label. */
export default {
  name: 'OpLoadingState',
  props: { label: { type: String, default: '' } }
};
</script>

<template>
  <div class="op-state op-state--loading" role="status" aria-live="polite">
    <pv-progress-spinner style="width: 2.5rem; height: 2.5rem" strokeWidth="4" />
    <p class="op-state__text">{{ label || $t('state.loading') }}</p>
  </div>
</template>

<style scoped>
.op-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--op-space-3); padding: var(--op-space-8) var(--op-space-4); text-align: center;
}
.op-state__text { color: var(--op-text-muted); }
</style>
