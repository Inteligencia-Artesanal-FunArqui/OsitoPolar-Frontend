<script>
/**
 * @component notification-item
 * @description Renders a single notification with a "Mark as read" button.
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
  methods: {
    onMarkAsRead() {
      this.$emit('read', this.notification.id);
    }
  }
};
</script>

<template>
  <div class="notification-item" :class="{ unread: notification.isUnread() }">
    <p class="message">{{ notification.description }}</p>
    <button @click="onMarkAsRead">Mark as read</button>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.notification-item.unread {
  background: #e6f7ff;
}
.message {
  margin: 0;
  font-size: 0.95rem;
}
button {
  background-color: #0079c2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
