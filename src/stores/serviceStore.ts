import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SupabaseService } from "../services/supabase";
import type { Service } from "../types";

export const useServiceStore = defineStore("service", () => {
  const services = ref<Service[]>([]);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const fetchServices = async () => {
    loading.value = true;
    error.value = null;
    try {
      services.value = await SupabaseService.getServices();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch services";
      console.error("Error fetching services:", err);
    } finally {
      loading.value = false;
    }
  };

  const getServiceById = (id: string): Service | undefined => {
    return services.value.find((s) => s.id === id);
  };

  const getServiceByName = (name: string): Service | undefined => {
    return services.value.find((s) => s.name === name);
  };

  return {
    services: computed(() => services.value),
    error,
    loading,
    fetchServices,
    getServiceById,
    getServiceByName,
  };
});
