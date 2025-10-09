<script>
import NotificationItem from './notification-item.component.vue';

/**
 * @component notification-list
 * @description Lists all notifications for the current user.
 */
export default {
  name: 'notification-list',
  components: { NotificationItem },
  props: {
    notifications: {
      type: Array,
      required: true
    }
  },
  emits: ['read'],
  methods: {
    onRead(id) {
      this.$emit('read', id);
    }
  }
};
</script>

<template>
  <div class="notification-list">
    <NotificationItem
        v-for="n in notifications"
        :key="n.id"
        :notification="n"
        @read="onRead"
    />
  </div>
</template>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
}
</style>
