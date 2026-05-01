import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Project } from "../types";
import { SupabaseService } from "../services/supabase";

export const useProjectStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;
    try {
      projects.value = await SupabaseService.getProjects();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch projects";
    } finally {
      loading.value = false;
    }
  };

  const getProjectById = (id: string) => {
    return projects.value.find((p) => p.id === id);
  };

  const getProjectsByClientId = (clientId: string) => {
    return projects.value.filter((p) => p.client_id === clientId);
  };

  const addProject = async (
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const newProject = await SupabaseService.createProject(project);
      projects.value.push(newProject);
      return newProject;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await SupabaseService.updateProject(id, updates);
      const index = projects.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProject = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.deleteProject(id);
      projects.value = projects.value.filter((p) => p.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete project";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    projects: computed(() => projects.value),
    loading,
    error,
    fetchProjects,
    getProjectById,
    getProjectsByClientId,
    addProject,
    updateProject,
    deleteProject,
  };
});
