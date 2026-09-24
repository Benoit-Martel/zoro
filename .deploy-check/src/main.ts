import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Login from "./pages/Login.vue";
import ResetPassword from "./pages/ResetPassword.vue";
import Clients from "./pages/Clients.vue";
import Projects from "./pages/Projects.vue";
import TimeSheet from "./pages/TimeSheet.vue";
import Invoices from "./pages/Invoices.vue";
import InvoiceDetail from "./pages/InvoiceDetail.vue";
import { useAuthStore } from "./stores/authStore";
import "./style.css";

console.log("App initializing...");

const routes = [
  { path: "/login", component: Login },
  { path: "/reset-password", component: ResetPassword },
  { path: "/", redirect: "/timesheet" },
  { path: "/clients", component: Clients, meta: { requiresAuth: true } },
  { path: "/projects", component: Projects, meta: { requiresAuth: true } },
  { path: "/timesheet", component: TimeSheet, meta: { requiresAuth: true } },
  { path: "/invoices", component: Invoices, meta: { requiresAuth: true } },
  {
    path: "/invoices/:id",
    component: InvoiceDetail,
    meta: { requiresAuth: true },
  },
  // Catch-all: redirect unknown routes to login
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory("/zoro/"),
  routes,
});

// Auth guard
router.beforeEach(async (to, from) => {
  console.log("Router guard: navigating to", to.path, "from", from.path);

  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Initialize auth on first navigation
  if (from.name === undefined && to.path !== "/login") {
    console.log("First navigation, initializing auth...");
    try {
      await authStore.initializeAuth();
    } catch (err) {
      console.error("Auth initialization failed:", err);
    }
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log(
      "Route requires auth but not authenticated, redirecting to login",
    );
    return "/login";
  }

  // If user is authenticated and trying to access login, redirect to timesheet
  if (to.path === "/login" && authStore.isAuthenticated) {
    console.log(
      "Authenticated user trying to access login, redirecting to timesheet",
    );
    return "/timesheet";
  }

  console.log("Navigation allowed");
});

// Error handling
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error("Navigation failed:", failure);
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");

console.log("App mounted");
