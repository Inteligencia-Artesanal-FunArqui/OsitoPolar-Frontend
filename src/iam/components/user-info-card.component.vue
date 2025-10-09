<script>
/**
 * @component UserInfoCard
 * @description Enhanced card component to display comprehensive user information for OsitoPolar system
 */
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'UserInfoCard',

  props: {
    user: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      userStats: {
        equipmentCount: 0,
        activeServiceRequests: 0,
        totalServiceRequests: 0,
        lastLoginDate: null
      }
    };
  },

  computed: {
    userRole() {

      return this.user.role || 'CLIENT';
    },

    roleLabel() {
      const roleLabels = {
        'ADMIN': 'Administrator',
        'TECHNICIAN': 'Technician',
        'CLIENT': 'Client'
      };
      return roleLabels[this.userRole] || 'User';
    },

    roleBadgeColor() {
      const colors = {
        'ADMIN': 'danger',
        'TECHNICIAN': 'warning',
        'CLIENT': 'success'
      };
      return colors[this.userRole] || 'info';
    },

    membershipDuration() {
      if (!this.user.createdAt) return 'Unknown';

      const now = new Date();
      const created = new Date(this.user.createdAt);
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} days`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''}`;
      }
    }
  },

  async mounted() {
    if (this.showStats) {
      await this.loadUserStats();
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Not available';

      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    async loadUserStats() {
      try {
        // SIMULATE STATS LOADING
        // const equipmentResponse = await equipmentService.getUserEquipmentCount();
        // const serviceResponse = await serviceRequestService.getUserStats();

        // FAKE DATA MUST BE CHANGE
        this.userStats = {
          equipmentCount: Math.floor(Math.random() * 10) + 1,
          activeServiceRequests: Math.floor(Math.random() * 3),
          totalServiceRequests: Math.floor(Math.random() * 20) + 1,
          lastLoginDate: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    },

    handleEditProfile() {
      this.$emit('edit-profile', this.user);
    },

    handleChangePassword() {
      this.$emit('change-password', this.user);
    },

    handleViewActivity() {
      this.$emit('view-activity', this.user);
    },

    handleSignOut() {
      this.$confirm.require({
        message: 'Are you sure you want to sign out?',
        header: 'Confirm Sign Out',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.authStore.signOut();
          this.$toast.add({
            severity: 'success',
            summary: 'Signed Out',
            detail: 'You have been signed out successfully',
            life: 3000
          });
          this.$router.push('/home');
        }
      });
    }
  }
};
</script>

<template>
  <pv-card class="user-info-card">
    <!-- Header with user avatar and role -->
    <template #header>
      <div class="user-header">
        <div class="user-avatar">
          <i class="pi pi-user" style="font-size: 3rem;"></i>
        </div>
        <pv-tag
            :value="roleLabel"
            :severity="roleBadgeColor"
            class="role-badge" />
      </div>
    </template>

    <!-- User name and basic info -->
    <template #title>
      <div class="user-title">
        <h3>{{ user.username }}</h3>
        <span class="user-id">ID: {{ user.id }}</span>
      </div>
    </template>

    <!-- Detailed user information -->
    <template #content>
      <div class="user-details">

        <!-- Basic Information Section -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-info-circle"></i>
            Account Information
          </h4>

          <div class="detail-item">
            <span class="label">Member Since:</span>
            <span class="value">{{ formatDate(user.createdAt) }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Membership Duration:</span>
            <span class="value">{{ membershipDuration }}</span>
          </div>

          <div class="detail-item" v-if="user.email">
            <span class="label">Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>

          <div class="detail-item" v-if="user.companyName">
            <span class="label">Company:</span>
            <span class="value">{{ user.companyName }}</span>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="info-section" v-if="showStats">
          <h4 class="section-title">
            <i class="pi pi-chart-bar"></i>
            Activity Summary
          </h4>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.equipmentCount }}</div>
              <div class="stat-label">Equipment</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ userStats.activeServiceRequests }}</div>
              <div class="stat-label">Active Requests</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalServiceRequests }}</div>
              <div class="stat-label">Total Requests</div>
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="actions-section" v-if="showActions">
          <h4 class="section-title">
            <i class="pi pi-cog"></i>
            Account Actions
          </h4>

          <div class="action-buttons">
            <pv-button
                label="Edit Profile"
                icon="pi pi-pencil"
                class="p-button-outlined p-button-primary action-btn"
                @click="handleEditProfile" />

            <pv-button
                label="Change Password"
                icon="pi pi-key"
                class="p-button-outlined p-button-secondary action-btn"
                @click="handleChangePassword" />

            <pv-button
                label="View Activity"
                icon="pi pi-history"
                class="p-button-outlined p-button-info action-btn"
                @click="handleViewActivity" />

            <pv-button
                label="Sign Out"
                icon="pi pi-sign-out"
                class="p-button-outlined p-button-danger action-btn"
                @click="handleSignOut" />
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.user-info-card {
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-header {
  position: relative;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0079c2 0%, #005a8f 100%);
  color: white;
}

.user-avatar {
  margin-bottom: 1rem;
}

.role-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-title {
  text-align: center;
  margin-bottom: 1rem;
}

.user-title h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.user-id {
  color: #666;
  font-size: 0.875rem;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: #0079c2;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  color: #212529;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0079c2;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.action-btn {
  font-size: 0.875rem;
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-info-card {
    max-width: 100%;
    margin: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Hover effects */
.action-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  background: #f8f9fa;
  transition: background 0.2s ease;
}
</style>