<script>
export default {
  name: 'SignUpForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      newUser: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },

  computed: {
    isFormValid() {
      return this.newUser.username?.trim() &&
          this.newUser.password?.trim() &&
          this.newUser.confirmPassword?.trim();
    }
  },

  methods: {
    handleSubmit() {
      if (this.loading) {
        return;
      }

      if (this.newUser.password !== this.newUser.confirmPassword) {
        this.$emit('error', 'Passwords do not match');
        return;
      }

      if (!this.isFormValid) {
        this.$emit('error', 'Please fill all fields');
        return;
      }

      this.$emit('submit', {
        username: this.newUser.username.trim(),
        password: this.newUser.password
      });

      this.$nextTick(() => {
        this.newUser = {
          username: '',
          password: '',
          confirmPassword: ''
        };
      });
    },

    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="sign-up-form">
    <div class="text-center mb-3">
      <i class="pi pi-user-plus" style="font-size: 3rem; color: #0079c2;"></i>
      <h3>Create New User</h3>
    </div>

    <div class="field">
      <pv-float-label>
        <pv-input-text
            id="newUsername"
            v-model="newUser.username"
            class="w-full" />
        <label for="newUsername">Username</label>
      </pv-float-label>
    </div>

    <div class="field">
      <pv-float-label>
        <pv-input-text
            id="newPassword"
            v-model="newUser.password"
            type="password"
            class="w-full" />
        <label for="newPassword">Password</label>
      </pv-float-label>
    </div>

    <div class="field">
      <pv-float-label>
        <pv-input-text
            id="confirmPassword"
            v-model="newUser.confirmPassword"
            type="password"
            class="w-full" />
        <label for="confirmPassword">Confirm Password</label>
      </pv-float-label>
    </div>

    <pv-button
        type="submit"
        label="Create User"
        icon="pi pi-user-plus"
        :loading="loading"
        :disabled="loading || !isFormValid"
        class="w-full mb-2" />

    <pv-button
        type="button"
        label="Back to Sign In"
        icon="pi pi-arrow-left"
        class="p-button-text w-full"
        @click="handleBack" />
  </form>
</template>

<style scoped>

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

:deep(.p-button) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
}
</style>