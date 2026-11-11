<script>
import { NotificationService } from '../services/notification.service.js';
import NotificationList from '../components/notification-list.component.vue';
import authService from '../../iam/services/auth.service.js';

/**
 * @component notifications-page
 * @description Page for viewing and managing user notifications.
 */
export default {
  name: 'notifications',
  components: { NotificationList },
  data() {
    return {
      notifications: [],
      // signed-in user, falling back to the first account while auth payloads have no id
      userId: authService.getCurrentUser()?.id || 1,
      service: null,
      loading: false,
      hasError: false
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => n.isUnread()).length;
    }
  },
  methods: {
    async loadNotifications() {
      this.loading = true;
      this.hasError = false;
      try {
        this.notifications = await this.service.getAllForUser(this.userId);
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.hasError = true;
      } finally {
        this.loading = false;
      }
    },
    async markRead(id) {
      try {
        const updated = await this.service.markAsRead(id);
        this.notifications = this.notifications.map(n => (n.id === id ? updated : n));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        this.$toast.add({ severity: 'error', summary: this.$t('common.error'), detail: this.$t('notifications.markError'), life: 4000 });
      }
    }
  },
  created() {
    this.service = new NotificationService();
    this.loadNotifications();
  }
};
</script>

<template>
  <div class="notifications-page">
    <op-page-header
        :title="$t('notifications.title')"
        :subtitle="unreadCount ? $t('notifications.unread', { count: unreadCount }, unreadCount) : $t('notifications.allRead')" />

    <op-loading-state v-if="loading" :label="$t('notifications.loading')" />
    <op-error-state v-else-if="hasError" :message="$t('notifications.errorLoading')" @retry="loadNotifications" />
    <op-empty-state
        v-else-if="notifications.length === 0"
        icon="pi pi-bell"
        :title="$t('notifications.emptyTitle')"
        :message="$t('notifications.emptyMessage')" />
    <NotificationList
        v-else
        :notifications="notifications"
        @read="markRead"
    />
  </div>
</template>

<style scoped>
.notifications-page { max-width: 820px; margin: 0 auto; }
</style>
