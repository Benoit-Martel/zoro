import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SupabaseService } from "../services/supabase";

export const useAuthStore = defineStore("auth", () => {
  const userEmail = ref<string | null>(null);
  const authToken = ref<string | null>(localStorage.getItem("zoro_auth_token"));
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!authToken.value);

  const initializeAuth = async () => {
    loading.value = true;
    try {
      const token = localStorage.getItem("zoro_auth_token");
      if (token) {
        const user = await SupabaseService.getCurrentUser();
        if (user) {
          userEmail.value = user.email || null;
        }
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      loading.value = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const user = await SupabaseService.signInWithPassword(email, password);
      userEmail.value = user.email || null;
      // Update reactive token to trigger isAuthenticated computed property
      authToken.value = localStorage.getItem("zoro_auth_token");
      return user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur de connexion";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const signUp = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const user = await SupabaseService.signUpWithPassword(email, password);
      userEmail.value = user.email || null;
      // Update reactive token to trigger isAuthenticated computed property
      authToken.value = localStorage.getItem("zoro_auth_token");
      return user;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur lors de l'inscription";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendPasswordRecovery = async (email: string) => {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.sendPasswordRecoveryLink(email);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur lors de l'envoi du lien";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (password: string, token?: string) => {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.updatePassword(password, token);
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Erreur lors de la réinitialisation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const signOut = async () => {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.signOut();
      userEmail.value = null;
      authToken.value = null;
      localStorage.removeItem("zoro_auth_token");
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur de déconnexion";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    userEmail,
    loading,
    error,
    isAuthenticated,
    initializeAuth,
    signIn,
    signUp,
    signOut,
    sendPasswordRecovery,
    resetPassword,
  };
});
