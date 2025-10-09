<script>
/**
 * @component AdminKeyForm
 * @description Form component for admin key validation
 */
export default {
  name: 'AdminKeyForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      adminKey: ''
    };
  },

  methods: {
    handleSubmit() {
      this.$emit('submit', this.adminKey);
    },

    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="admin-key-form">
    <div class="text-center mb-3">
      <i class="pi pi-shield" style="font-size: 3rem; color: #0079c2;"></i>
      <h3>Administrator Access</h3>
      <p class="text-secondary">Enter the admin key to create users</p>
    </div>

    <div class="field">
      <pv-float-label>
        <pv-input-text
            id="adminKey"
            v-model="adminKey"
            type="password"
            class="w-full" />
        <label for="adminKey">Admin Key</label>
      </pv-float-label>
    </div>

    <pv-button
        type="submit"
        label="Validate Key"
        icon="pi pi-check"
        :loading="loading"
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