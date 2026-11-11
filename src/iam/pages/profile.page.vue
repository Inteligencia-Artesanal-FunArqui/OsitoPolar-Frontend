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
      currentUser: null,
      profile: null
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
        return;
      }
      // plan / balance / usage are optional extras: the card still renders from the sign-in payload
      authService.getUserProfile(this.currentUser.id).then(profile => { this.profile = profile; }).catch(() => {});
    }
  }
};
</script>

<template>
  <div class="profile-page">
    <op-page-header :title="$t('profile.title')" :subtitle="$t('profile.subtitle')" />

    <div v-if="currentUser" class="profile-content">
      <user-info-card :user="currentUser" :profile="profile" />
    </div>
  </div>
</template>

<style scoped>
.profile-page { max-width: 820px; margin: 0 auto; }
</style>
