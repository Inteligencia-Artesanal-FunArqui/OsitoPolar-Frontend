<script>
/**
 * @component UserInfoCard
 * @description Account card: identity, role and real activity numbers (equipment / service requests).
 */
import { useAuthStore } from '../store/auth.store';
import { EquipmentService } from '../../equipment/services/equipment.service.js';
import { ServiceRequestService } from '../../service/services/service-request.service.js';
import { formatDate } from '../../shared/format.js';

const OPEN_STATUSES = ['pending', 'accepted', 'in_progress'];

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
    },
    /** GET /users/{id} resource (ownerProfile | providerProfile), optional */
    profile: {
      type: Object,
      default: null
    }
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      statsLoading: false,
      statsFailed: false,
      userStats: {
        equipmentCount: 0,
        activeServiceRequests: 0,
        totalServiceRequests: 0
      }
    };
  },

  computed: {
    // sign-in returns `userType` (Owner/Provider) on the real backend; older payloads used `role`
    roleKey() {
      const raw = String(this.user.userType || this.user.role || 'owner').toLowerCase();
      return ['owner', 'provider', 'admin', 'technician', 'client'].includes(raw) ? raw : 'owner';
    },

    roleSeverity() {
      return { admin: 'danger', provider: 'warn', technician: 'warn' }[this.roleKey] || 'success';
    },

    account() {
      return this.profile?.ownerProfile || this.profile?.providerProfile || null;
    },

    planLimitText() {
      const a = this.account;
      if (!a) return '';
      if (a.maxEquipment != null) return `${a.currentEquipmentCount ?? 0} / ${a.maxEquipment}`;
      return a.maxClients != null ? `${a.currentClientCount ?? 0} / ${a.maxClients}` : this.$t('profile.unlimited');
    },

    balanceText() {
      return this.account?.balance != null ? `$ ${Number(this.account.balance).toFixed(2)}` : '';
    },

    memberSince() {
      return formatDate(this.user.createdAt || this.user.memberSince || this.profile?.memberSince, this.$i18n.locale) || this.$t('common.notAvailable');
    }
  },

  async mounted() {
    if (this.showStats) {
      await this.loadUserStats();
    }
  },

  methods: {
    async loadUserStats() {
      this.statsLoading = true;
      this.statsFailed = false;
      try {
        const [equipment, requestsResponse] = await Promise.all([
          new EquipmentService().getAllEquipments(),
          new ServiceRequestService().getAll()
        ]);
        const requests = requestsResponse.data || [];
        this.userStats = {
          equipmentCount: equipment.length,
          activeServiceRequests: requests.filter(r => OPEN_STATUSES.includes(String(r.status).toLowerCase())).length,
          totalServiceRequests: requests.length
        };
      } catch (error) {
        console.error('Error loading user stats:', error);
        this.statsFailed = true;
      } finally {
        this.statsLoading = false;
      }
    },

    handleSignOut() {
      this.$confirm.require({
        message: this.$t('profile.confirmSignOut'),
        header: this.$t('profile.confirmSignOutHeader'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('common.yes'),
        rejectLabel: this.$t('common.no'),
        accept: () => {
          this.authStore.signOut();
          this.$toast.add({
            severity: 'success',
            summary: this.$t('nav.signedOutTitle'),
            detail: this.$t('nav.signedOutDetail'),
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
  <section class="user-info-card op-card">
    <header class="user-header">
      <div class="user-avatar" aria-hidden="true">
        <i class="pi pi-user"></i>
      </div>
      <div class="user-title">
        <h2>{{ user.username }}</h2>
        <span class="user-id">ID: {{ user.id }}</span>
      </div>
      <pv-tag :value="$t(`profile.roles.${roleKey}`)" :severity="roleSeverity" class="role-badge" />
    </header>

    <div class="info-section">
      <h3 class="section-title"><i class="pi pi-info-circle" aria-hidden="true"></i> {{ $t('profile.account') }}</h3>
      <dl class="detail-list">
        <div class="detail-item">
          <dt class="label">{{ $t('profile.memberSince') }}</dt>
          <dd class="value">{{ memberSince }}</dd>
        </div>
        <div class="detail-item" v-if="user.email">
          <dt class="label">{{ $t('profile.email') }}</dt>
          <dd class="value">{{ user.email }}</dd>
        </div>
        <div class="detail-item" v-if="user.companyName">
          <dt class="label">{{ $t('profile.company') }}</dt>
          <dd class="value">{{ user.companyName }}</dd>
        </div>
        <template v-if="account">
          <div class="detail-item">
            <dt class="label">{{ $t('profile.plan') }}</dt>
            <dd class="value">{{ account.plan?.planName }} · $ {{ account.plan?.price }}/{{ $t('profile.perMonth') }}</dd>
          </div>
          <div class="detail-item">
            <dt class="label">{{ account.maxEquipment != null ? $t('profile.equipmentUsage') : $t('profile.clientUsage') }}</dt>
            <dd class="value">{{ planLimitText }}</dd>
          </div>
          <div class="detail-item" v-if="balanceText">
            <dt class="label">{{ $t('profile.balance') }}</dt>
            <dd class="value">{{ balanceText }}</dd>
          </div>
        </template>
      </dl>
    </div>

    <div class="info-section" v-if="showStats">
      <h3 class="section-title"><i class="pi pi-chart-bar" aria-hidden="true"></i> {{ $t('profile.activity') }}</h3>
      <p v-if="statsFailed" class="stats-error">{{ $t('profile.statsError') }}</p>
      <div v-else class="stats-grid" :aria-busy="statsLoading">
        <div class="stat-item">
          <div class="stat-value">{{ statsLoading ? '-' : userStats.equipmentCount }}</div>
          <div class="stat-label">{{ $t('profile.equipment') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statsLoading ? '-' : userStats.activeServiceRequests }}</div>
          <div class="stat-label">{{ $t('profile.activeRequests') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statsLoading ? '-' : userStats.totalServiceRequests }}</div>
          <div class="stat-label">{{ $t('profile.totalRequests') }}</div>
        </div>
      </div>
    </div>

    <div class="info-section" v-if="showActions">
      <h3 class="section-title"><i class="pi pi-compass" aria-hidden="true"></i> {{ $t('profile.shortcuts') }}</h3>
      <div class="action-buttons">
        <pv-button :label="$t('nav.equipment')" icon="pi pi-box" severity="secondary" outlined @click="$router.push('/equipment')" />
        <pv-button :label="$t('nav.serviceRequests')" icon="pi pi-wrench" severity="secondary" outlined @click="$router.push('/service-requests')" />
        <pv-button :label="$t('nav.notifications')" icon="pi pi-bell" severity="secondary" outlined @click="$router.push('/notifications')" />
        <pv-button :label="$t('nav.signOut')" icon="pi pi-sign-out" severity="danger" outlined @click="handleSignOut" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.user-info-card { display: flex; flex-direction: column; gap: var(--op-space-6); }

.user-header { display: flex; align-items: center; gap: var(--op-space-4); flex-wrap: wrap; }
.user-avatar {
  width: 4rem; height: 4rem; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--op-brand-soft); color: var(--op-brand); font-size: 1.8rem;
}
.user-title { flex: 1; min-width: 0; }
.user-title h2 { font-size: 1.4rem; color: var(--op-text-strong); overflow-wrap: anywhere; }
.user-id { color: var(--op-text-muted); font-size: 0.85rem; }

.section-title {
  display: flex; align-items: center; gap: var(--op-space-2);
  font-size: 1rem; color: var(--op-brand-strong);
  margin-bottom: var(--op-space-3); padding-bottom: var(--op-space-2);
  border-bottom: 1px solid var(--op-border);
}

.detail-list { display: grid; gap: var(--op-space-2); margin: 0; }
.detail-item { display: flex; justify-content: space-between; gap: var(--op-space-4); flex-wrap: wrap; }
.label { color: var(--op-text-muted); }
.value { margin: 0; font-weight: 500; color: var(--op-text-strong); overflow-wrap: anywhere; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: var(--op-space-3); }
.stat-item { text-align: center; background: var(--op-surface-muted); border: 1px solid var(--op-border); border-radius: var(--op-radius-md); padding: var(--op-space-3); }
.stat-value { font-size: 1.7rem; font-weight: 700; color: var(--op-brand); line-height: 1.1; }
.stat-label { font-size: 0.8rem; color: var(--op-text-muted); }
.stats-error { color: var(--op-text-muted); }

.action-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--op-space-3); }
</style>
