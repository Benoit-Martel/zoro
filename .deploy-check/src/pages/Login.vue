<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <svg
          id="zorodateur-logo"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 278 138.84"
          class="w-16 h-16 mx-auto mb-4"
        >
          <path
            d="M273,21C261.43,1.99,237.73-3.33,209,3c-13.92,3.07-25.58,2.01-38,6-8.84,2.84-21.78,11.12-34,9-9.96-1.73-17.85-5.35-26-8C89.9,3.15,62.96-.1,37,0c-3.25,2.05-8.27,1.42-12,3-6.25,2.64-14.37,9.57-18,15C1.91,25.63,.04,36.6,0,49c-.18,61.65,30.94,77.5,80,89,19.58,4.59,38.37-13.45,46-22,2.98-3.34,3.24-6.21,8-8,1.97-1.33,6.53-1.13,10-1,11.79,12.46,22.59,26.15,42,31,13.1,3.27,27.51-3.89,36-7,35.89-13.16,56.01-30.21,56-80,0-11.94-.43-22.5-5-30ZM101,79c-29.66,15.02-42.19-4.25-59-16,.21-15.09,16.52-11.22,26-17,24.23-.03,31.86,10.53,44,22-.5,8.74-5.06,7.99-11,11ZM191,84c-8.61-1.99-15.38-6.72-23-9-.51-2.47-.92-3.67-1-7,6.32-6.03,11.93-13.82,20-18,4.06-2.11,9.29-1.59,13-4,17.31.07,26.67,4.56,37,11-.63,13.72-26.51,31.49-46,27Z"
            style="fill: #1f2937"
          />
        </svg>
        <h1 class="text-4xl text-gray-800 mb-2">
          <span class="font-bold">Zoro</span>dateur
        </h1>
        <p class="text-gray-600">Gestionnaire de feuilles de temps</p>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
      >
        {{ error }}
      </div>

      <!-- Success message for recovery -->
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
      >
        {{ successMessage }}
      </div>

      <!-- Login Form -->
      <form
        v-if="!showRecovery && !showSignUp"
        @submit.prevent="handleLogin"
        class="space-y-4"
      >
        <div>
          <label class="block text-gray-800 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label class="block text-gray-800 mb-2">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition"
        >
          {{ loading ? "Connexion..." : "Se connecter" }}
        </button>
      </form>

      <!-- Sign Up Form -->
      <form
        v-if="showSignUp && !showRecovery"
        @submit.prevent="handleSignUp"
        class="space-y-4"
      >
        <div>
          <label class="block text-gray-800 mb-2">Email</label>
          <input
            v-model="signUpEmail"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label class="block text-gray-800 mb-2">Mot de passe</label>
          <input
            v-model="signUpPassword"
            type="password"
            required
            minlength="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="••••••••"
          />
          <p class="text-sm text-gray-600 mt-1">Minimum 8 caractères</p>
        </div>

        <div>
          <label class="block text-gray-800 mb-2"
            >Confirmer le mot de passe</label
          >
          <input
            v-model="signUpPasswordConfirm"
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
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <UserPlus v-if="!loading" size="18" />
          {{ loading ? "Création..." : "Créer un compte" }}
        </button>
      </form>

      <!-- Password Recovery Form -->
      <form
        v-if="showRecovery"
        @submit.prevent="handleRecovery"
        class="space-y-4"
      >
        <div>
          <label class="block text-gray-800 mb-2">Email</label>
          <input
            v-model="recoveryEmail"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            placeholder="votre@email.com"
          />
        </div>

        <p class="text-gray-600 text-sm">
          Un lien de réinitialisation sera envoyé à votre adresse email.
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition"
        >
          {{ loading ? "Envoi..." : "Envoyer le lien" }}
        </button>
      </form>

      <!-- Toggle between login, signup and recovery -->
      <div class="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <button
          v-if="!showSignUp && !showRecovery"
          @click="showSignUp = true"
          type="button"
          class="w-full text-indigo-600 hover:text-indigo-700 py-2 transition flex items-center justify-center gap-2"
        >
          <UserPlus size="18" />
          Créer un nouveau compte
        </button>
        <button
          v-if="!showRecovery"
          @click="showRecovery = true"
          type="button"
          class="w-full text-indigo-600 hover:text-indigo-700 py-2 transition flex items-center justify-center gap-2"
        >
          <HelpCircle size="18" />
          Mot de passe oublié?
        </button>
        <button
          v-if="showRecovery"
          @click="showRecovery = false"
          type="button"
          class="w-full text-indigo-600 hover:text-indigo-700 py-2 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size="18" />
          Retour à la connexion
        </button>
        <button
          v-if="showSignUp"
          @click="showSignUp = false"
          type="button"
          class="w-full text-indigo-600 hover:text-indigo-700 py-2 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size="18" />
          Retour à la connexion
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserPlus, HelpCircle, ArrowLeft } from "lucide-vue-next";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const signUpEmail = ref("");
const signUpPassword = ref("");
const signUpPasswordConfirm = ref("");
const recoveryEmail = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const showRecovery = ref(false);
const showSignUp = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = "Veuillez remplir tous les champs";
    return;
  }

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await authStore.signIn(email.value, password.value);
    // isAuthenticated should be immediately true since signIn sets localStorage
    if (!authStore.isAuthenticated) {
      throw new Error("Authentification échouée");
    }
    await router.push("/timesheet");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erreur lors de la connexion";
  } finally {
    loading.value = false;
  }
};

const handleSignUp = async () => {
  if (
    !signUpEmail.value ||
    !signUpPassword.value ||
    !signUpPasswordConfirm.value
  ) {
    error.value = "Veuillez remplir tous les champs";
    return;
  }

  if (signUpPassword.value.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères";
    return;
  }

  if (signUpPassword.value !== signUpPasswordConfirm.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await authStore.signUp(signUpEmail.value, signUpPassword.value);
    successMessage.value = "Compte créé avec succès!";

    // Reset form
    signUpEmail.value = "";
    signUpPassword.value = "";
    signUpPasswordConfirm.value = "";

    // Redirect after success message shown
    setTimeout(async () => {
      if (authStore.isAuthenticated) {
        await router.push("/timesheet");
      }
    }, 1500);
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Erreur lors de la création du compte";
  } finally {
    loading.value = false;
  }
};

const handleRecovery = async () => {
  if (!recoveryEmail.value) {
    error.value = "Veuillez entrer votre adresse email";
    return;
  }

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await authStore.sendPasswordRecovery(recoveryEmail.value);
    successMessage.value =
      "Un lien de réinitialisation a été envoyé à votre email";
    recoveryEmail.value = "";
    setTimeout(() => {
      showRecovery.value = false;
    }, 3000);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erreur lors de l'envoi du lien";
  } finally {
    loading.value = false;
  }
};
</script>
