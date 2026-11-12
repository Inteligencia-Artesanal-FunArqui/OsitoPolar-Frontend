<script>
/**
 * @component TechnicianLayout
 * @description Own shell for the technician portal: slate topbar + bottom tab bar on phones, side rail on desktop.
 * App.vue skips the owner/provider navbar and footer for routes with meta.role === 'technician'.
 */
import authService from '../../iam/services/auth.service.js';
import '../technician-portal.css';

export default {
  name: 'TechnicianLayout',
  data() {
    return {
      user: authService.getCurrentUser(),
      items: [
        { to: '/technician', name: 'technician-today', icon: 'pi pi-sun', label: 'technician.nav.today', exact: true },
        { to: '/technician/orders', name: 'technician-orders', icon: 'pi pi-clipboard', label: 'technician.nav.orders', prefix: '/technician/orders' },
        { to: '/technician/equipment', name: 'technician-equipment', icon: 'pi pi-box', label: 'technician.nav.equipment', prefix: '/technician/equipment' },
        { to: '/technician/inventory', name: 'technician-inventory', icon: 'pi pi-wrench', label: 'technician.nav.inventory', prefix: '/technician/inventory' },
        { to: '/technician/profile', name: 'technician-profile', icon: 'pi pi-user', label: 'technician.nav.profile', prefix: '/technician/profile' }
      ]
    };
  },
  methods: {
    isActive(item) {
      const path = this.$route.path;
      return item.exact ? path === item.to : path === item.prefix || path.startsWith(item.prefix + '/');
    },
    signOut() {
      authService.signOut();
      this.$router.push('/sign-in');
    }
  }
};
</script>

<template>
  <div class="tp-shell">
    <header class="tp-topbar">
      <router-link to="/technician" class="tp-brand">
        <i class="pi pi-snowflake" aria-hidden="true"></i>
        <span>
          <strong>{{ $t('technician.brand') }}</strong>
          <small>{{ user?.companyName || $t('technician.company') }}</small>
        </span>
      </router-link>
      <div class="tp-user">
        <span class="tp-user__name">{{ user?.username }}</span>
        <button type="button" class="tp-signout" :aria-label="$t('technician.nav.signOut')" @click="signOut">
          <i class="pi pi-sign-out" aria-hidden="true"></i>
          <span>{{ $t('technician.nav.signOut') }}</span>
        </button>
      </div>
    </header>

    <nav class="tp-nav" :aria-label="$t('technician.nav.label')">
      <router-link v-for="item in items" :key="item.name" :to="item.to" class="tp-nav__item" :class="{ 'is-active': isActive(item) }" :aria-current="isActive(item) ? 'page' : undefined">
        <i :class="item.icon" aria-hidden="true"></i>
        <span>{{ $t(item.label) }}</span>
      </router-link>
    </nav>

    <main id="main-content" class="tp-main" tabindex="-1">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.tp-topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: var(--op-space-3); padding: 0.6rem var(--op-space-4); background: var(--tp-ink); color: #fff; box-shadow: var(--op-shadow-md); }
.tp-brand { display: flex; align-items: center; gap: var(--op-space-3); color: #fff; text-decoration: none; min-width: 0; }
.tp-brand > i { font-size: 1.5rem; color: var(--tp-accent); }
.tp-brand span { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
.tp-brand small { color: #b9d3e0; font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-user { display: flex; align-items: center; gap: var(--op-space-3); }
.tp-user__name { display: none; font-weight: 600; }
.tp-signout { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 var(--op-space-3); border-radius: var(--op-radius-pill); border: 1px solid rgba(255, 255, 255, 0.35); background: transparent; color: #fff; cursor: pointer; font: inherit; }
.tp-signout:hover { background: var(--tp-ink-soft); }
.tp-signout span { display: none; }

/* phones: bottom tab bar */
.tp-nav { position: fixed; z-index: 20; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(5, 1fr); background: var(--op-surface); border-top: 1px solid var(--op-border-strong); padding-bottom: env(safe-area-inset-bottom); }
.tp-nav__item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 58px; padding: 6px 2px; color: var(--op-text-muted); text-decoration: none; font-size: 0.7rem; font-weight: 600; border-top: 3px solid transparent; }
.tp-nav__item i { font-size: 1.25rem; }
.tp-nav__item.is-active { color: var(--op-brand-strong); border-top-color: var(--tp-accent); background: var(--op-brand-soft); }
.tp-main { flex: 1; width: 100%; max-width: 960px; margin: 0 auto; padding: var(--op-space-4) var(--op-space-4) 90px; outline: none; }

/* desktop: side rail instead of the bottom bar */
@media (min-width: 900px) {
  .tp-user__name { display: inline; }
  .tp-signout span { display: inline; }
  .tp-shell { display: grid; grid-template-columns: 220px 1fr; grid-template-rows: auto 1fr; }
  .tp-topbar { grid-column: 1 / -1; }
  .tp-nav { position: sticky; top: 64px; align-self: start; height: calc(100vh - 64px); grid-template-columns: 1fr; grid-auto-rows: 52px; align-content: start; border-top: 0; border-right: 1px solid var(--op-border-strong); padding: var(--op-space-3) 0; }
  .tp-nav__item { flex-direction: row; justify-content: flex-start; gap: var(--op-space-3); padding: 0 var(--op-space-5); min-height: 52px; font-size: 0.95rem; border-top: 0; border-left: 4px solid transparent; }
  .tp-nav__item.is-active { border-left-color: var(--tp-accent); }
  .tp-main { padding-bottom: var(--op-space-8); max-width: 1000px; }
}
</style>
