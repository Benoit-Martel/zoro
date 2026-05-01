<template>
  <div id="app">
    <Header v-if="authStore.isAuthenticated" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Header from "./components/Header.vue";
import { useAuthStore } from "./stores/authStore";

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

#app {
  min-height: 100vh;
  font-family: "Inter Tight", system-ui, sans-serif;
}

main {
  min-height: calc(100vh - 88px);
}
</style>
