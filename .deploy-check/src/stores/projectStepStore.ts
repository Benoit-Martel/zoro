import { defineStore } from "pinia";
import { ref } from "vue";
import { SupabaseService } from "../services/supabase";
import type { ProjectStep } from "../types";

export const useProjectStepStore = defineStore("projectStep", () => {
  const steps = ref<ProjectStep[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSteps = async (projectId: string) => {
    loading.value = true;
    error.value = null;
    try {
      steps.value = await SupabaseService.getProjectSteps(projectId);
      console.log("Fetched project steps:", steps.value);
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error fetching project steps:", err);
    } finally {
      loading.value = false;
    }
  };

  const addStep = async (
    projectId: string,
    step: Omit<ProjectStep, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const newStep = await SupabaseService.createProjectStep({
        ...step,
        project_id: projectId,
      });
      steps.value.push(newStep);
      return newStep;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error creating project step:", err);
      throw err;
    }
  };

  const updateStep = async (id: string, updates: Partial<ProjectStep>) => {
    try {
      const updated = await SupabaseService.updateProjectStep(id, updates);
      const index = steps.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        steps.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error updating project step:", err);
      throw err;
    }
  };

  const deleteStep = async (id: string) => {
    try {
      await SupabaseService.deleteProjectStep(id);
      steps.value = steps.value.filter((s) => s.id !== id);
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error deleting project step:", err);
      throw err;
    }
  };

  const getStepById = (id: string) => {
    return steps.value.find((s) => s.id === id);
  };

  const getStepsByProjectId = (projectId: string) => {
    return steps.value.filter((s) => s.project_id === projectId);
  };

  return {
    steps,
    loading,
    error,
    fetchSteps,
    addStep,
    updateStep,
    deleteStep,
    getStepById,
    getStepsByProjectId,
  };
});
