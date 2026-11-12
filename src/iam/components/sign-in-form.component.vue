<script>
/**
 * @component SignInForm
 * @description Form component for user sign in
 */
export default {
  name: 'SignInForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isDemo: import.meta.env.VITE_DEMO_MODE === 'true',
      credentials: {
        username: '',
        password: ''
      },
      submitted: false
    };
  },

  watch: {
    loading(newVal) {
      if (!newVal) {
        this.submitted = false;
      }
    }
  },

  methods: {
    handleSubmit() {
      if (this.submitted || this.loading) {
        return;
      }
      
      if (!this.credentials.username?.trim() || !this.credentials.password?.trim()) {
        return;
      }
      
      this.submitted = true;
      this.$emit('submit', { 
        username: this.credentials.username.trim(), 
        password: this.credentials.password 
      });
    },

    // demo mode only: one click fills the only account the mock accepts
    fillDemoCredentials() {
      this.credentials.username = 'pedro@demo.local';
      this.credentials.password = 'Demo123!';
    },

    handleAdminMode() {
      if (this.loading || this.submitted) return;
      this.$emit('admin-mode');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="sign-in-form">
    <div class="form-header">
      <div class="logo-container">
        <i class="pi pi-user" style="font-size: 4rem; color: var(--op-brand);" aria-hidden="true"></i>
      </div>
      <h2>{{ $t('auth.signInTitle') }}</h2>
      <p class="form-subtitle">{{ $t('auth.signInSubtitle') }}</p>
    </div>

    <div class="field">
      <label for="username" class="field-label">{{ $t('auth.username') }}</label>
      <pv-input-text
          id="username"
          v-model="credentials.username"
          :placeholder="$t('auth.usernamePlaceholder')"
          autocomplete="username"
          class="w-full input-field" />
    </div>

    <div class="field">
      <label for="password" class="field-label">{{ $t('auth.password') }}</label>
      <pv-password
          id="password"
          v-model="credentials.password"
          :placeholder="$t('auth.passwordPlaceholder')"
          class="w-full input-field"
          input-class="w-full"
          fluid
          :feedback="false"
          toggleMask />
    </div>

    <pv-button
        type="submit"
        :label="$t('auth.signInButton')"
        icon="pi pi-sign-in"
        :loading="loading"
        :disabled="loading || submitted"
        class="w-full sign-in-button" />

    <div class="divider">
      <span>{{ $t('auth.or') }}</span>
    </div>

    <pv-button
        type="button"
        :label="$t('auth.adminButton')"
        icon="pi pi-shield"
        class="w-full admin-button"
        @click="handleAdminMode" />
  </form>
</template>

<style scoped>
.sign-in-form {
  padding: 1rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  margin-bottom: 1rem;
}

.form-header h2 {
  color: var(--op-brand);
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.w-full {
  width: 100%;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.p-inputtext:hover),
:deep(.p-password-input:hover) {
  border-color: #9ca3af;
}

:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
  border-color: var(--op-brand);
  box-shadow: 0 0 0 2px rgba(0, 121, 194, 0.1);
  outline: none;
}

.sign-in-button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: var(--op-brand);
  border: none;
  color: white;
  border-radius: 6px;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

:deep(.sign-in-button:hover) {
  background-color: #005a8f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 121, 194, 0.3);
}

.admin-button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.admin-button:hover) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Divider */
.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-toggle-icon) {
  color: #6b7280;
}

.form-subtitle { margin-top: var(--op-space-1); color: var(--op-text-muted); }
.demo-hint { margin-bottom: var(--op-space-4); }
.demo-hint__body { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--op-space-3); }
</style>
