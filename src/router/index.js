/**
 * @fileoverview Router configuration for the OsitoPolar application
 * Defines all routes and navigation behavior for the application
 */

import { createRouter, createWebHistory } from "vue-router";
import authService from "../iam/services/auth.service.js";

/**
 * @description Lazy-loaded component imports for route configuration
 * Using dynamic imports to enable code splitting and improve initial load performance
 */
const HomeComponent            = () => import('../public/pages/home.component.vue');
const AboutComponent           = () => import('../public/pages/about.component.vue');
const DashboardComponent       = () => import('../analytics/pages/dashboard.component.vue');
const EquipmentListComponent   = () => import('../equipment/pages/equipment-list.component.vue');
const SignInPage              = () => import('../iam/pages/sign-in.page.vue');
const ProfilePage             = () => import('../iam/pages/profile.page.vue');
const EquipmentDetailComponent = () => import('../equipment/pages/equipment-detail.component.vue');
const EquipmentFormComponent   = () => import('../equipment/pages/equipment-form.page.vue');
const EquipmentAnalyticsComponent = () => import('../analytics/pages/equipment-analytics.component.vue');
const NewServiceRequestComponent = () => import('../service/pages/new-service-request.component.vue');
const ServiceRequestListComponent = () => import('../service/pages/service-request-list.component.vue');
const NotificationsComponent   = () => import('../notifications/pages/notifications.component.vue');
const PageNotFoundComponent    = () => import('../public/pages/page-not-found.component.vue');
const RentalCatalogComponent   = () => import('../rental/pages/rental-catalog.page.vue');
const RentalCheckoutComponent  = () => import('../rental/pages/rental-checkout.page.vue');
const ContactComponent        = () => import('../public/pages/contact.page.vue');
const PlansComponent          = () => import('../subscriptions/pages/plans.component.vue');
const WorkOrderListComponent = () => import('../field-operations/pages/work-order-list.component.vue');
const NewWorkOrderComponent = () => import('../field-operations/pages/new-work-order.component.vue');
const TechnicianListComponent = () => import('../field-operations/pages/technician-list.component.vue');
const CompanyServiceRequestsListComponent = () => import('../service/pages/company-service-requests-list.component.vue');

/**
 * @type {import('vue-router').RouteRecordRaw[]}
 * @description Application route definitions.
 * Each route object contains:
 * - path: URL path for the route
 * - name: Unique identifier for the route
 * - component: Vue component to render
 * - meta: Additional metadata including page title and auth requirements
 */
const routes = [
    // Public routes (no authentication required)
    {
        path: '/home',
        name: 'home',
        component: HomeComponent,
        meta: { title: 'Home', requiresAuth: false }
    },
    {
        path: '/about',
        name: 'about',
        component: AboutComponent,
        meta: { title: 'About us', requiresAuth: false }
    },
    {
        path: '/sign-in',
        name: 'sign-in',
        component: SignInPage,
        meta: { title: 'Sign In', requiresAuth: false }
    },
    {
        path: '/contact',
        name: 'contact',
        component: ContactComponent,
        meta: { title: 'Contact Us', requiresAuth: false }
    },

    // Protected routes (authentication required)
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage,
        meta: { title: 'Profile', requiresAuth: true }
    },
    {
        path: '/notifications',
        name: 'notifications',
        component: NotificationsComponent,
        meta: { title: 'Notifications', requiresAuth: true }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardComponent,
        meta: { title: 'Dashboard', requiresAuth: true }
    },

    // Equipment routes (all protected)
    {
        path: '/equipment/:id/analytics',
        name: 'equipment-analytics',
        component: EquipmentAnalyticsComponent,
        meta: { title: 'Equipment Analytics', requiresAuth: true }
    },
    {
        path: '/equipment',
        name: 'equipment-list',
        component: EquipmentListComponent,
        meta: { title: 'My Equipment', requiresAuth: true }
    },
    {
        path: '/equipment/new',
        name: 'equipment-new',
        component: EquipmentFormComponent,
        meta: { title: 'New Equipment', requiresAuth: true }
    },
    {
        path: '/equipment/:id',
        name: 'equipment-detail',
        component: EquipmentDetailComponent,
        meta: { title: 'Equipment Details', requiresAuth: true }
    },

    // Service Request routes (all protected)
    {
        path: '/service-requests',
        name: 'service-requests',
        component: ServiceRequestListComponent,
        meta: { title: 'Service Requests', requiresAuth: true }
    },
    {
        path: '/service-request/new',
        name: 'new-service-request',
        component: NewServiceRequestComponent,
        meta: { title: 'New Service Request', requiresAuth: true }
    },
    {
        path: '/company/service-requests',
        name: 'company-service-requests',
        component: CompanyServiceRequestsListComponent,
        meta: { title: 'Company Service Requests', requiresAuth: true }
    },

    // Rental routes (all protected)
    {
        path: '/rental',
        name: 'rental-catalog',
        component: RentalCatalogComponent,
        meta: { title: 'Rent Equipment', requiresAuth: true }
    },
    {
        path: '/rental/checkout/:equipmentId',
        name: 'rental-checkout',
        component: RentalCheckoutComponent,
        meta: { title: 'Rental Checkout', requiresAuth: true }
    },

    // Plans (protected)
    {
        path: '/plans',
        name: 'plans',
        component: PlansComponent,
        meta: { title: 'Subscription Plans', requiresAuth: true }
    },

    // Work Order routes (all protected)
    {
        path: '/work-orders',
        name: 'work-orders-list',
        component: WorkOrderListComponent,
        meta: { title: 'Work Orders', requiresAuth: true }
    },
    {
        path: '/work-orders/new',
        name: 'new-work-order',
        component: NewWorkOrderComponent,
        meta: { title: 'New Work Order', requiresAuth: true }
    },

    // Technician routes (protected)
    {
        path: '/technicians',
        name: 'technician-list',
        component: TechnicianListComponent,
        meta: { title: 'Technicians', requiresAuth: true }
    },

    // Default route
    {
        path: '/',
        name: 'default',
        redirect: { name: 'home' }
    },

    // Not found route (public)
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: PageNotFoundComponent,
        meta: { title: 'Page not found', requiresAuth: false }
    }
];

/**
 * @type {import('vue-router').Router}
 * @description Vue Router instance configured with HTML5 history mode
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * @description Global navigation guard that runs before each route change
 * Handles:
 * - Authentication checking
 * - Navigation logging
 * - Dynamic page title updates based on route metadata
 * - Redirect management
 */
router.beforeEach((to, from, next) => {
    // Log navigation
    console.log(`Navigating from ${from.name} to ${to.name}`);

    // Update page title
    document.title = `OsitoPolar | ${to.meta.title || 'Welcome'}`;

    // Check authentication
    const isAuthenticated = authService.isAuthenticated();
    const requiresAuth = to.meta.requiresAuth === true;

    // If route requires auth and user is not authenticated
    if (requiresAuth && !isAuthenticated) {
        console.log('Authentication required, redirecting to sign-in');
        next({
            name: 'sign-in',
            query: { redirect: to.fullPath } // Save intended destination
        });
    }
    // If user is authenticated and trying to access sign-in page
    else if (to.name === 'sign-in' && isAuthenticated) {
        console.log('User already authenticated, redirecting to dashboard');
        next({ name: 'dashboard' });
    }
    // Otherwise, proceed normally
    else {
        next();
    }
});

export default router;