<script>
/**
 * @component navbar
 * @description Main navigation: desktop bar + slide-in drawer on small screens.
 * Exposes every real route (public, owner pages and the "Operations" group for
 * company requests / work orders / technicians) with active-route highlighting.
 */
import LanguageSwitcher from "./language-switcher.component.vue";
import authService from "../../iam/services/auth.service.js";

export default {
  name: "navbar",
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      // `match` = path prefixes that should light the item up (some routes are singular/plural mismatched)
      primaryItems: [
        { label: 'nav.home', to: '/home', icon: 'pi pi-home', match: ['/home'], auth: false },
        { label: 'nav.dashboard', to: '/dashboard', icon: 'pi pi-chart-line', match: ['/dashboard'], auth: true },
        { label: 'nav.equipment', to: '/equipment', icon: 'pi pi-box', match: ['/equipment'], auth: true },
        { label: 'nav.serviceRequests', to: '/service-requests', icon: 'pi pi-wrench', match: ['/service-requests', '/service-request/'], auth: true },
        { label: 'nav.rental', to: '/rental', icon: 'pi pi-shopping-cart', match: ['/rental'], auth: true },
        { label: 'nav.plans', to: '/plans', icon: 'pi pi-credit-card', match: ['/plans'], auth: true }
      ],
      operationsItems: [
        { label: 'nav.companyRequests', to: '/company/service-requests', icon: 'pi pi-inbox', match: ['/company/service-requests'] },
        { label: 'nav.workOrders', to: '/work-orders', icon: 'pi pi-clipboard', match: ['/work-orders'] },
        { label: 'nav.technicians', to: '/technicians', icon: 'pi pi-users', match: ['/technicians'] }
      ],
      publicTail: [
        { label: 'nav.about', to: '/about', icon: 'pi pi-info-circle', match: ['/about'], auth: false },
        { label: 'nav.contact', to: '/contact', icon: 'pi pi-envelope', match: ['/contact'], auth: false }
      ],
      mobileMenuOpen: false,
      isAuthenticated: false,
      currentUser: null
    }
  },
  computed: {
    visiblePrimary() {
      return this.primaryItems.filter(item => !item.auth || this.isAuthenticated);
    },
    operationsActive() {
      return this.operationsItems.some(item => this.isActive(item));
    },
    operationsMenuModel() {
      return this.operationsItems.map(item => ({
        label: this.$t(item.label),
        icon: item.icon,
        class: this.isActive(item) ? 'is-active' : '',
        command: () => this.$router.push(item.to)
      }));
    },
    userMenuItems() {
      return [
        { label: this.$t('nav.profile'), icon: 'pi pi-user', command: () => this.$router.push('/profile') },
        { separator: true },
        { label: this.$t('nav.signOut'), icon: 'pi pi-sign-out', command: () => this.handleSignOut() }
      ];
    }
  },
  watch: {
    // close the drawer whenever navigation happens (links, back button, programmatic pushes)
    '$route.fullPath'() {
      this.mobileMenuOpen = false;
      this.checkAuth();
    },
    mobileMenuOpen(open) {
      document.body.classList.toggle('mobile-menu-open', open);
    }
  },
  mounted() {
    this.checkAuth();
    window.addEventListener('auth-changed', this.checkAuth);
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('auth-changed', this.checkAuth);
    window.removeEventListener('keydown', this.onKeydown);
    document.body.classList.remove('mobile-menu-open');
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = authService.isAuthenticated();
      this.currentUser = authService.getCurrentUser();
    },

    isActive(item) {
      const path = this.$route.path;
      return item.match.some(prefix => path === prefix || path.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`));
    },

    onKeydown(event) {
      if (event.key === 'Escape') this.mobileMenuOpen = false;
    },

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },

    goNotifications() {
      this.$router.push({ name: 'notifications' });
    },

    goToSignIn() {
      this.$router.push({ name: 'sign-in' });
    },

    handleSignOut() {
      authService.signOut();
      this.checkAuth();
      this.$toast.add({
        severity: 'success',
        summary: this.$t('nav.signedOutTitle'),
        detail: this.$t('nav.signedOutDetail'),
        life: 3000
      });
      this.$router.push('/home');
    },

    toggleUserMenu(event) {
      this.$refs.userMenu.toggle(event);
    },

    toggleOperationsMenu(event) {
      this.$refs.operationsMenu.toggle(event);
    }
  }
}
</script>

<template>
  <header class="navbar-container">
    <a href="#main-content" class="skip-link">{{ $t('nav.skipToContent') }}</a>
    <div class="navbar">
      <router-link to="/home" class="navbar-brand" :aria-label="'OsitoPolar - ' + $t('nav.home')">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path style="fill: var(--op-brand)" d="M14,15.25C14,15.11 13.89,15 13.75,15H13.5V10.37C13.5,10.23 13.39,10.12 13.25,10.12H10.75C10.61,10.12 10.5,10.23 10.5,10.37V15H10.25C10.11,15 10,15.11 10,15.25V18.5C10,18.64 10.11,18.75 10.25,18.75H13.75C13.89,18.75 14,18.64 14,18.5V15.25M12,9.25C12.83,9.25 13.5,8.58 13.5,7.75C13.5,6.92 12.83,6.25 12,6.25C11.17,6.25 10.5,6.92 10.5,7.75C10.5,8.58 11.17,9.25 12,9.25M16.08,16.22C15.8,15.94 15.36,15.94 15.08,16.22L12,19.29L8.92,16.22C8.64,15.94 8.2,15.94 7.92,16.22C7.65,16.5 7.65,16.93 7.92,17.21L11.5,20.79C11.7,21 12.3,21 12.5,20.79L16.07,17.22C16.35,16.94 16.35,16.5 16.08,16.22Z" />
        </svg>
        <span class="logo-text">
          <span class="company-name">OsitoPolar</span>
          <span class="company-slogan">{{ $t('nav.tagline') }}</span>
        </span>
      </router-link>

      <pv-button
          icon="pi pi-bars"
          class="p-button-text hamburger-button"
          @click="toggleMobileMenu"
          :aria-label="$t('nav.openMenu')"
          :aria-expanded="mobileMenuOpen"
      />

      <div class="desktop-menu-container">
        <nav class="navbar-menu" :aria-label="$t('nav.mainNavigation')">
          <router-link
              v-for="item in visiblePrimary"
              :key="item.to"
              :to="item.to"
              class="menu-item"
              :class="{ 'is-active': isActive(item) }"
              :aria-current="isActive(item) ? 'page' : undefined">
            {{ $t(item.label) }}
          </router-link>

          <template v-if="isAuthenticated">
            <button
                type="button"
                class="menu-item menu-item--button"
                :class="{ 'is-active': operationsActive }"
                aria-haspopup="true"
                @click="toggleOperationsMenu">
              {{ $t('nav.operations') }}
              <i class="pi pi-angle-down" aria-hidden="true"></i>
            </button>
            <pv-menu ref="operationsMenu" :model="operationsMenuModel" :popup="true" class="user-dropdown-menu" />
          </template>

          <router-link
              v-for="item in publicTail"
              :key="item.to"
              :to="item.to"
              class="menu-item"
              :class="{ 'is-active': isActive(item) }"
              :aria-current="isActive(item) ? 'page' : undefined">
            {{ $t(item.label) }}
          </router-link>
        </nav>

        <div class="navbar-actions">
          <LanguageSwitcher />

          <template v-if="!isAuthenticated">
            <pv-button
                :label="$t('nav.signIn')"
                icon="pi pi-sign-in"
                class="sign-in-button"
                size="small"
                @click="goToSignIn" />
          </template>

          <template v-else>
            <pv-button
                icon="pi pi-bell"
                class="p-button-text p-button-rounded notification-button"
                :aria-label="$t('nav.notifications')"
                @click="goNotifications" />

            <pv-button
                :label="currentUser?.username || $t('nav.user')"
                icon="pi pi-user"
                class="p-button-text user-button"
                aria-haspopup="true"
                @click="toggleUserMenu" />

            <pv-menu
                ref="userMenu"
                :model="userMenuItems"
                :popup="true"
                class="user-dropdown-menu" />
          </template>
        </div>
      </div>
    </div>

    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu">
        <div class="mobile-menu-drawer" role="dialog" aria-modal="true" :aria-label="$t('mobile.menu')" @click.stop>
          <div class="mobile-menu-header">
            <h3>{{ $t('mobile.menu') }}</h3>
            <pv-button icon="pi pi-times"
                       class="p-button-text p-button-rounded close-button"
                       @click="closeMobileMenu"
                       :aria-label="$t('nav.closeMenu')" />
          </div>

          <nav class="mobile-nav" :aria-label="$t('nav.mainNavigation')">
            <router-link
                v-for="item in visiblePrimary"
                :key="item.to"
                :to="item.to"
                class="mobile-menu-item"
                :class="{ 'is-active': isActive(item) }">
              <i :class="[item.icon, 'menu-icon']" aria-hidden="true"></i>
              {{ $t(item.label) }}
            </router-link>

            <template v-if="isAuthenticated">
              <h4 class="mobile-group-title">{{ $t('nav.operations') }}</h4>
              <router-link
                  v-for="item in operationsItems"
                  :key="item.to"
                  :to="item.to"
                  class="mobile-menu-item"
                  :class="{ 'is-active': isActive(item) }">
                <i :class="[item.icon, 'menu-icon']" aria-hidden="true"></i>
                {{ $t(item.label) }}
              </router-link>
            </template>

            <div class="menu-divider"></div>
            <router-link
                v-for="item in publicTail"
                :key="item.to"
                :to="item.to"
                class="mobile-menu-item"
                :class="{ 'is-active': isActive(item) }">
              <i :class="[item.icon, 'menu-icon']" aria-hidden="true"></i>
              {{ $t(item.label) }}
            </router-link>
          </nav>

          <div class="menu-divider"></div>

          <div class="mobile-section">
            <h4>{{ $t('nav.language') }}</h4>
            <LanguageSwitcher />
          </div>

          <div class="mobile-section">
            <template v-if="!isAuthenticated">
              <pv-button
                  icon="pi pi-sign-in"
                  :label="$t('nav.signIn')"
                  class="mobile-action-button"
                  @click="goToSignIn" />
            </template>

            <template v-else>
              <pv-button
                  icon="pi pi-bell"
                  :label="$t('mobile.notifications')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="goNotifications" />
              <pv-button
                  icon="pi pi-user"
                  :label="currentUser?.username || $t('nav.myAccount')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="$router.push('/profile')" />
              <pv-button
                  icon="pi pi-sign-out"
                  :label="$t('nav.signOut')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="handleSignOut" />
            </template>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar-container {
  background-color: var(--op-surface);
  box-shadow: var(--op-shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  background: var(--op-brand);
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 2000;
}
.skip-link:focus { left: 0; }

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--op-space-4);
  padding: 0.75rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--op-space-2);
  text-decoration: none;
  flex-shrink: 0;
}

.logo-text { display: flex; flex-direction: column; }
.company-name { font-size: 1.4rem; font-weight: 700; color: var(--op-brand); line-height: 1.1; }
.company-slogan { font-size: 0.68rem; color: var(--op-text-muted); }

.desktop-menu-container {
  display: flex;
  align-items: center;
  gap: var(--op-space-3);
  min-width: 0;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 0;
}

.menu-item {
  position: relative;
  color: var(--op-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.92rem;
  padding: 0.5rem 0.55rem;
  border-radius: var(--op-radius-sm);
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.menu-item--button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.menu-item:hover { color: var(--op-brand); background: var(--op-brand-soft); }
.menu-item.is-active { color: var(--op-brand); background: var(--op-brand-soft); font-weight: 600; }
.menu-item.is-active::after {
  content: '';
  position: absolute;
  left: 0.55rem; right: 0.55rem; bottom: 0.15rem;
  height: 2px;
  background: var(--op-brand);
  border-radius: 2px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--op-space-2);
  padding-left: var(--op-space-2);
  border-left: 1px solid var(--op-border);
  flex-shrink: 0;
}

:deep(.notification-button), :deep(.user-button) {
  color: var(--op-text-muted);
}
:deep(.notification-button:hover), :deep(.user-button:hover) {
  color: var(--op-brand);
  background-color: var(--op-brand-soft);
}

:deep(.p-menu-item.is-active .p-menu-item-link) { color: var(--op-brand); font-weight: 600; }

.hamburger-button { display: none; }

/* Mobile drawer */
.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 30, 50, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 88vw;
  height: 100dvh;
  background-color: var(--op-surface);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  z-index: 1000;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--op-border);
}
.mobile-menu-header h3 { margin: 0; color: var(--op-brand); font-size: 1.15rem; }

.mobile-nav { padding: 0.5rem 0; }

.mobile-group-title {
  margin: 0.75rem 0 0.25rem;
  padding: 0 1.5rem;
  color: var(--op-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: var(--op-space-3);
  padding: 0.8rem 1.5rem;
  color: var(--op-text);
  text-decoration: none;
  font-size: 1rem;
  border-left: 3px solid transparent;
  transition: background-color 0.15s ease;
}
.mobile-menu-item:hover { background-color: var(--op-surface-muted); color: var(--op-brand); }
.mobile-menu-item.is-active {
  background-color: var(--op-brand-soft);
  color: var(--op-brand);
  border-left-color: var(--op-brand);
  font-weight: 600;
}
.menu-icon { font-size: 1rem; width: 1.25rem; text-align: center; }

.menu-divider { height: 1px; background-color: var(--op-border); margin: 0.75rem 0; }

.mobile-section { padding: 0.75rem 1.5rem; }
.mobile-section h4 {
  margin: 0 0 0.75rem 0;
  color: var(--op-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mobile-action-button {
  width: 100%;
  justify-content: flex-start;
  margin: 0.2rem 0;
}

.slide-enter-active .mobile-menu-drawer,
.slide-leave-active .mobile-menu-drawer { transition: transform 0.28s ease; }
.slide-enter-from .mobile-menu-drawer,
.slide-leave-to .mobile-menu-drawer { transform: translateX(100%); }
.slide-enter-active.mobile-menu-backdrop,
.slide-leave-active.mobile-menu-backdrop { transition: opacity 0.28s ease; }
.slide-enter-from.mobile-menu-backdrop,
.slide-leave-to.mobile-menu-backdrop { opacity: 0; }

/* The authenticated bar has 9 entries, so switch to the drawer a bit earlier than a typical 768px */
@media (max-width: 1400px) {
  .company-slogan { display: none; }
  .menu-item { font-size: 0.88rem; }
  /* keep the username out of the bar on mid-width screens; the icon still opens the user menu */
  :deep(.user-button .p-button-label) { display: none; }
}

@media (max-width: 1100px) {
  .desktop-menu-container { display: none; }
  .hamburger-button { display: inline-flex; color: var(--op-brand); }
  .navbar { padding: 0.6rem 1rem; }
}
</style>

<style>
/* body lock must be global (scoped styles can't reach <body>) */
body.mobile-menu-open { overflow: hidden; }
</style>
