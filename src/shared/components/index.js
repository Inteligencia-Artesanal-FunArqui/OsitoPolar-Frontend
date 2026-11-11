import OpPageHeader from './page-header.component.vue';
import OpLoadingState from './loading-state.component.vue';
import OpErrorState from './error-state.component.vue';
import OpEmptyState from './empty-state.component.vue';
import OpStatusBadge from './status-badge.component.vue';

/** Vue plugin: registers the shared presentation components globally as <op-*>. */
export default {
  install(app) {
    app.component('op-page-header', OpPageHeader)
      .component('op-loading-state', OpLoadingState)
      .component('op-error-state', OpErrorState)
      .component('op-empty-state', OpEmptyState)
      .component('op-status-badge', OpStatusBadge);
  }
};
