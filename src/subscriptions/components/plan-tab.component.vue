<script lang="ts">

import {Button as PvButton} from "primevue";

/**
 * @component plan-tab
 * @description Displays tabs for switching between user and provider plans.
 */
export default {
  name: "plan-tab",
  components: {PvButton},
  data(){
    return {
      activeTab: "users",
    }
  },
  methods: {
    /**
     * Sets the active tab and emits an event to notify the parent component.
     * @param {string} tab - The tab to activate ('users' or 'providers').
     */
    setActiveTab(tab) {
      this.activeTab = tab;
      this.$emit('tab-changed', tab);
    }
  }
}
</script>

<template>
  <div class="plan-tabs">
    <pv-button :class="{ active: activeTab === 'users' }" @click="setActiveTab('users')" :label="$t('plans.forUsers')" />
    <pv-button :class="{ active: activeTab === 'providers' }" @click="setActiveTab('providers')" :label="$t('plans.forProviders')" />
  </div>
</template>

<style scoped>
.plan-tabs {
  margin-bottom: 40px;
  text-align: center;
}

.plan-tabs .p-button {
  margin: 0 10px;
  background: none;
  border: none;
  color: #555;
  padding: 5px 15px;
  font-size: 1rem;
  transition: color 0.3s;
}

.plan-tabs .p-button.active {
  color: #0079c2;
  border-bottom: 2px solid #0079c2;
}
</style>