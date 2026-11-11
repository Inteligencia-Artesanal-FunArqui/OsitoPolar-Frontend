<script>
/**
 * @component OpPageHeader
 * @description Consistent page title block: optional back link, title, subtitle and an actions slot.
 */
export default {
  name: 'OpPageHeader',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    backTo: { type: [String, Object], default: null },
    backLabel: { type: String, default: '' }
  }
};
</script>

<template>
  <header class="op-page-header">
    <router-link v-if="backTo" :to="backTo" class="op-page-header__back">
      <i class="pi pi-arrow-left" aria-hidden="true"></i>
      <span>{{ backLabel || $t('common.back') }}</span>
    </router-link>
    <div class="op-page-header__row">
      <div class="op-page-header__text">
        <h1 class="op-page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="op-page-header__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.default" class="op-page-header__actions">
        <slot />
      </div>
    </div>
  </header>
</template>

<style scoped>
.op-page-header { margin-bottom: var(--op-space-6); }
.op-page-header__back {
  display: inline-flex; align-items: center; gap: var(--op-space-2);
  margin-bottom: var(--op-space-3);
  color: var(--op-brand); font-weight: 500; font-size: 0.9rem; text-decoration: none;
}
.op-page-header__back:hover { text-decoration: underline; }
.op-page-header__row {
  display: flex; flex-wrap: wrap; align-items: flex-end;
  justify-content: space-between; gap: var(--op-space-4);
  padding-bottom: var(--op-space-4); border-bottom: 1px solid var(--op-border);
}
.op-page-header__title {
  font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem);
  font-weight: 700; line-height: 1.2; color: var(--op-text-strong);
}
.op-page-header__subtitle { margin-top: var(--op-space-1); color: var(--op-text-muted); }
.op-page-header__actions { display: flex; flex-wrap: wrap; gap: var(--op-space-2); }
</style>
