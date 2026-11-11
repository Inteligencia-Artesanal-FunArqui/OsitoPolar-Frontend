<script>
import { formatDateTime } from '../../shared/format.js';

/**
 * @component notification-item
 * @description Renders a single notification: icon by type, title, text, time and a "Mark as read" action (unread only).
 */
export default {
  name: 'notification-item',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  emits: ['read'],
  computed: {
    icon() {
      const type = String(this.notification.type || '').toLowerCase();
      if (type.includes('alert') || type === 'equipment_alert') return 'pi pi-exclamation-triangle';
      if (type.includes('warning')) return 'pi pi-exclamation-circle';
      if (type.includes('service')) return 'pi pi-wrench';
      if (type.includes('payment')) return 'pi pi-credit-card';
      return 'pi pi-info-circle';
    },
    when() {
      return formatDateTime(this.notification.timestamp, this.$i18n.locale);
    }
  },
  methods: {
    onMarkAsRead() {
      this.$emit('read', this.notification.id);
    }
  }
};
</script>

<template>
  <article class="notification-item" :class="{ unread: notification.isUnread() }">
    <i :class="[icon, 'notification-icon']" aria-hidden="true"></i>
    <div class="content">
      <h2 v-if="notification.title" class="title">{{ notification.title }}</h2>
      <p class="message">{{ notification.description }}</p>
      <time v-if="when" class="time">{{ when }}</time>
    </div>
    <pv-button
        v-if="notification.isUnread()"
        :label="$t('notifications.markRead')"
        icon="pi pi-check"
        size="small"
        severity="secondary"
        outlined
        @click="onMarkAsRead" />
    <span v-else class="read-tag"><i class="pi pi-check" aria-hidden="true"></i> {{ $t('notifications.read') }}</span>
  </article>
</template>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--op-space-4);
  padding: var(--op-space-4);
  background: var(--op-surface);
  border: 1px solid var(--op-border);
  border-left: 4px solid var(--op-border-strong);
  border-radius: var(--op-radius-md);
}
.notification-item.unread { background: var(--op-brand-soft); border-left-color: var(--op-brand); }
.notification-icon { font-size: 1.25rem; color: var(--op-brand); margin-top: 0.15rem; }
.content { flex: 1; min-width: 0; }
.title { font-size: 1rem; color: var(--op-text-strong); }
.message { margin: 0; font-size: 0.93rem; color: var(--op-text); }
.time { display: block; margin-top: var(--op-space-1); font-size: 0.78rem; color: var(--op-text-muted); }
.read-tag { color: var(--op-text-muted); font-size: 0.85rem; white-space: nowrap; }

@media (max-width: 520px) {
  .notification-item { flex-wrap: wrap; }
  .notification-item > :last-child { margin-left: 2.25rem; }
}
</style>
