<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          Réinitialiser le mot de passe
        </h1>
        <p class="text-gray-600">Entrez votre nouveau mot de passe</p>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
      >
        {{ error }}
      </div>

      <!-- Success message -->
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
      >
        {{ successMessage }}
      </div>

      <!-- Reset Form -->
      <form @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-bold mb-2"
            >Nouveau mot de passe</label
          >
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="••••••••"
          />
          <p class="text-sm text-gray-600 mt-1">Minimum 8 caractères</p>
        </div>

        <div>
          <label class="block text-gray-700 font-bold mb-2"
            >Confirmer le mot de passe</label
          >
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {{
            loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"
          }}
        </button>
      </form>

      <router-link
        to="/login"
        class="block text-center text-blue-600 hover:text-blue-700 font-semibold mt-6 transition"
      >
        Retour à la connexion
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Get the reset token from URL query parameter
const resetToken = (route.query.token as string) || "";

const handleReset = async () => {
  error.value = null;
  successMessage.value = null;

  if (!resetToken) {
    error.value = "Lien de réinitialisation invalide";
    return;
  }

  // Validate passwords
  if (newPassword.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  loading.value = true;

  try {
    // Pass the reset token to the resetPassword method
    await authStore.resetPassword(newPassword.value, resetToken);
    successMessage.value = "Mot de passe réinitialisé avec succès!";

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erreur lors de la réinitialisation";
  } finally {
    loading.value = false;
  }
};
</script>
