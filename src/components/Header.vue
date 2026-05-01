<template>
  <header class="bg-blue-600 text-white shadow-lg">
    <div class="flex items-center justify-between max-w-7xl mx-auto px-4 py-4">
      <nav class="flex space-x-8">
        <router-link
          to="/timesheet"
          active-class="border-b-2 border-white"
          class="text-white hover:opacity-80 transition font-medium py-2"
        >
          Feuille de temps
        </router-link>
        <router-link
          to="/projects"
          active-class="border-b-2 border-white"
          class="text-white hover:opacity-80 transition font-medium py-2"
        >
          Projets
        </router-link>
        <router-link
          to="/clients"
          active-class="border-b-2 border-white"
          class="text-white hover:opacity-80 transition font-medium py-2"
        >
          Clients
        </router-link>
        <router-link
          to="/invoices"
          active-class="border-b-2 border-white"
          class="text-white hover:opacity-80 transition font-medium py-2"
        >
          Factures
        </router-link>
      </nav>
      <div class="flex items-center gap-4">
        <svg
          id="zorodateur-logo"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 278 138.84"
        >
          <path
            d="M273,21C261.43,1.99,237.73-3.33,209,3c-13.92,3.07-25.58,2.01-38,6-8.84,2.84-21.78,11.12-34,9-9.96-1.73-17.85-5.35-26-8C89.9,3.15,62.96-.1,37,0c-3.25,2.05-8.27,1.42-12,3-6.25,2.64-14.37,9.57-18,15C1.91,25.63.04,36.6,0,49c-.18,61.65,30.94,77.5,80,89,19.58,4.59,38.37-13.45,46-22,2.98-3.34,3.24-6.21,8-8,1.97-1.33,6.53-1.13,10-1,11.79,12.46,22.59,26.15,42,31,13.1,3.27,27.51-3.89,36-7,35.89-13.16,56.01-30.21,56-80,0-11.94-.43-22.5-5-30ZM101,79c-29.66,15.02-42.19-4.25-59-16,.21-15.09,16.52-11.22,26-17,24.23-.03,31.86,10.53,44,22-.5,8.74-5.06,7.99-11,11ZM191,84c-8.61-1.99-15.38-6.72-23-9-.51-2.47-.92-3.67-1-7,6.32-6.03,11.93-13.82,20-18,4.06-2.11,9.29-1.59,13-4,17.31.07,26.67,4.56,37,11-.63,13.72-26.51,31.49-46,27Z"
            style="fill: white"
          />
        </svg>
        <h1 class="text-3xl font-bold">Le Zorodateur</h1>
      </div>
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-4">
        <div class="text-sm">
          <p class="font-semibold">{{ authStore.userEmail }}</p>
          <p class="text-blue-100">Connecté</p>
        </div>
        <button
          @click="handleLogout"
          title="Déconnexion"
          class="hover:bg-indigo-700 p-2 rounded transition"
        >
          <LogOut size="20" class="text-white" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.signOut();
  router.push("/login");
};
</script>
<style>
#zorodateur-logo {
  width: 50px;
  height: 50px;
}
</style>
