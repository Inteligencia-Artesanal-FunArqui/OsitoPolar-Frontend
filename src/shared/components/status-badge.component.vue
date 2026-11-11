<script>
import { badgeMeta } from '../badge-tokens.js';

/**
 * @component OpStatusBadge
 * @description Readable, translated badge for status / priority / urgency / serviceType / etc.
 * `kind` picks the dictionary (see badge-tokens.js), `value` is the raw API enum.
 */
export default {
  name: 'OpStatusBadge',
  props: {
    kind: { type: String, required: true },
    value: { type: [String, Number], default: '' }
  },
  computed: {
    meta() {
      return badgeMeta(this.kind, this.value);
    }
  }
};
</script>

<template>
  <span :class="['op-badge', `op-badge--${meta.severity}`]">{{ $t(meta.key) }}</span>
</template>

<style scoped>
.op-badge {
  display: inline-flex; align-items: center; white-space: nowrap;
  padding: 0.2rem 0.65rem; border-radius: var(--op-radius-pill);
  font-size: 0.78rem; font-weight: 600; line-height: 1.3;
  border: 1px solid transparent;
}
.op-badge--success { background: var(--op-success-soft); color: var(--op-success-text); border-color: var(--op-success-border); }
.op-badge--info { background: var(--op-info-soft); color: var(--op-info-text); border-color: var(--op-info-border); }
.op-badge--warn { background: var(--op-warn-soft); color: var(--op-warn-text); border-color: var(--op-warn-border); }
.op-badge--danger { background: var(--op-danger-soft); color: var(--op-danger-text); border-color: var(--op-danger-border); }
.op-badge--neutral { background: var(--op-surface-muted); color: var(--op-text-muted); border-color: var(--op-border); }
</style>
