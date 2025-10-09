<script>
import { NotificationService } from '../services/notification.service.js';
import NotificationList from '../components/notification-list.component.vue';

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
      userId: 1,
      service: null,
      loading: false
    };
  },
  methods: {
    async loadNotifications() {
      this.loading = true;
      this.notifications = await this.service.getAllForUser(this.userId);
      this.loading = false;
    },
    async markRead(id) {
      const updated = await this.service.markAsRead(id);
      // update local copy
      this.notifications = this.notifications.map(n =>
          n.id === id ? updated : n
      );
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
    <h1>Notifications</h1>
    <div v-if="loading">Loading…</div>
    <NotificationList
        v-else
        :notifications="notifications"
        @read="markRead"
    />
  </div>
</template>

<style scoped>
.notifications-page {
  padding: 2rem;
}
h1 {
  color: #0079c2;
  margin-bottom: 1rem;
}
</style>
