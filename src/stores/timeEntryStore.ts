import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TimeEntry } from "../types";
import { SupabaseService } from "../services/supabase";

export const useTimeEntryStore = defineStore("timeEntries", () => {
  const entries = ref<TimeEntry[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTimeEntries = async (projectId?: string) => {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await SupabaseService.getTimeEntries(projectId);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch time entries";
    } finally {
      loading.value = false;
    }
  };

  const fetchProjectTimeEntries = async (
    projectId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      entries.value = await SupabaseService.getProjectTimeEntries(
        projectId,
        startDate,
        endDate,
      );
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch time entries";
    } finally {
      loading.value = false;
    }
  };

  const addTimeEntry = async (
    entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const newEntry = await SupabaseService.createTimeEntry(entry);
      entries.value.unshift(newEntry);
      return newEntry;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create time entry";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await SupabaseService.updateTimeEntry(id, updates);
      const index = entries.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        entries.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update time entry";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTimeEntry = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.deleteTimeEntry(id);
      entries.value = entries.value.filter((e) => e.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete time entry";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getEntriesByProject = (projectId: string) => {
    return computed(() =>
      entries.value.filter((e) => e.project_id === projectId),
    );
  };

  const getTimeEntryById = (id: string) => {
    return entries.value.find((e) => e.id === id);
  };

  return {
    entries: computed(() => entries.value),
    timeEntries: computed(() => entries.value),
    loading,
    error,
    fetchTimeEntries,
    fetchProjectTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getEntriesByProject,
    getTimeEntryById,
  };
});
