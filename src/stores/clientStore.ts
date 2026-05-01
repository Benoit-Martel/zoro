import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Client } from "../types";
import { SupabaseService } from "../services/supabase";
import { useProjectStore } from "./projectStore";

export const useClientStore = defineStore("clients", () => {
  const clients = ref<Client[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchClients = async () => {
    loading.value = true;
    error.value = null;
    console.log("fetching clients...");
    try {
      clients.value = await SupabaseService.getClients();
      console.log(clients);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch clients";
    } finally {
      loading.value = false;
    }
  };

  const getClientById = (id: string) => {
    return clients.value.find((c) => c.id === id);
  };

  const addClient = async (
    client: Omit<Client, "id" | "created_at" | "updated_at">,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const newClient = await SupabaseService.createClient(client);
      clients.value.push(newClient);
      return newClient;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create client";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await SupabaseService.updateClient(id, updates);
      const index = clients.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        clients.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update client";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteClient = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Check if client has any projects
      const projectStore = useProjectStore();
      const clientProjects = projectStore.getProjectsByClientId(id);

      if (clientProjects.length > 0) {
        throw new Error(
          `Cannot delete client with ${clientProjects.length} project(s). Please delete or reassign all projects first.`,
        );
      }

      await SupabaseService.deleteClient(id);
      clients.value = clients.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete client";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    clients: computed(() => clients.value),
    loading,
    error,
    fetchClients,
    getClientById,
    addClient,
    updateClient,
    deleteClient,
  };
});
