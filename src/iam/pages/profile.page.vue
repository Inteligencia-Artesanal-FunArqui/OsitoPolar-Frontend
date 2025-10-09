<script>
/**
 * @component ProfilePage
 * @description Page component for user profile
 */
import UserInfoCard from '../components/user-info-card.component.vue';
import authService from '../services/auth.service';

export default {
  name: 'ProfilePage',

  components: {
    UserInfoCard
  },

  data() {
    return {
      currentUser: null
    };
  },

  mounted() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      this.currentUser = authService.getCurrentUser();

      if (!this.currentUser) {
        this.$router.push('/sign-in');
      }
    },

    handleSignOut() {
      authService.signOut();
      this.$toast.add({
        severity: 'success',
        summary: 'Signed Out',
        detail: 'You have been signed out successfully',
        life: 3000
      });
      this.$router.push('/sign-in');
    }
  }
};
</script>

<template>
  <div class="profile-page">
    <h1 class="page-title">My Profile</h1>

    <div v-if="currentUser" class="profile-content">
      <user-info-card :user="currentUser" />

      <div class="actions">
        <pv-button
            label="Sign Out"
            icon="pi pi-sign-out"
            class="p-button-danger"
            @click="handleSignOut" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #0079c2;
  margin-bottom: 2rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.actions {
  text-align: center;
  margin-top: 2rem;
}
</style>