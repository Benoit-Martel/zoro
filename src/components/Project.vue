<template>
  <!-- Project Detail Modal -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @mousedown.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto"
      style="
        padding: 20px;
        scrollbar-width: thin;
        scrollbar-gutter: stable inside;
      "
      @click.stop
    >
      <div class="header flex w-full justify-between items-start">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">
            {{ project.name }}
          </h3>
          <div>
            <p class="text-gray-900">
              {{ getClientName(project.client_id) }}
            </p>
          </div>
        </div>
        <!-- Project ID -->
        <div class="flex items-center gap-6">
          <label class="block text-gray-700 font-bold mb-1">ID </label>
          <span class="text-gray-900 text-xs break-all">
            {{ project.id }}
          </span>
        </div>
        <!-- Status -->
        <div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-semibold',
              project.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800',
            ]"
          >
            {{ project.status === "active" ? "Actif" : "Archivé" }}
          </span>
        </div>
      </div>

      <div class="flex space-y-4 w-full justify-between items-center mt-4">
        <!-- Client Info -->
        <!-- Color -->
        <div class="flex items-center gap-3">
          <input
            v-model="colorFormData"
            type="color"
            @change="saveProjectColor"
            class="w-10 h-10 rounded-full cursor-pointer"
          />
        </div>
        <!-- Hourly Rate -->
        <div>
          <p class="text-gray-900">{{ project.hourly_rate }}$ / h</p>
        </div>

        <!-- Total Hours -->
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5 text-blue-600" />
          <div>
            <p class="text-gray-900 font-semibold">
              {{ getTotalProjectHours(project.id) }}h
            </p>
          </div>
        </div>

        <!-- Number of Time Entries -->
        <div class="flex items-center gap-2">
          <FileStack class="w-5 h-5 text-blue-600" />
          <div>
            <p class="text-gray-900 font-semibold">
              {{ getProjectTimeEntryCount(project.id) }}
            </p>
          </div>
        </div>
      </div>
      <!-- Project Steps -->
      <div class="border-t pt-4 mt-4">
        <div class="flex justify-between items-center mb-3">
          <label class="block text-gray-700 font-bold">Étapes</label>
          <button
            @click="showAddStepModal = true"
            class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            + Ajouter
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="step in projectSteps"
            :key="step.id"
            class="bg-gray-50 p-2 rounded flex justify-between items-center"
          >
            <div>
              <p class="font-semibold text-sm text-gray-900">
                {{ step.name }}
              </p>
              <p class="text-xs text-gray-600">
                {{ step.description }}
              </p>
              <p class="text-xs font-semibold text-blue-600 mt-1">
                {{ getStepHours(step.id) }}h
              </p>
            </div>
            <button @click="deleteStep(step.id)" class="text-red-600">✕</button>
          </div>
          <div
            v-if="projectSteps.length === 0"
            class="text-gray-500 text-sm italic"
          >
            Aucune étape
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Step Modal -->
  <div
    v-if="showAddStepModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @mousedown.self="showAddStepModal = false"
  >
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md" @click.stop>
      <h3 class="text-2xl font-bold mb-6 text-gray-900">Ajouter une étape</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 font-bold mb-2">Nom</label>
          <input
            v-model="newStepData.name"
            type="text"
            placeholder="Nom de l'étape"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label class="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            v-model="newStepData.description"
            placeholder="Description optionnelle"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div class="flex gap-4 mt-6">
        <button
          @click="saveNewStep"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
        >
          Créer
        </button>
        <button
          @click="showAddStepModal = false"
          class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Clock, FileStack } from "lucide-vue-next";
import { useProjectStepStore } from "../stores/projectStepStore";
import { useClientStore } from "../stores/clientStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { useProjectStore } from "../stores/projectStore";

const props = defineProps<{
  isOpen: boolean;
  project: any;
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const projectStepStore = useProjectStepStore();
const clientStore = useClientStore();
const timeEntryStore = useTimeEntryStore();
const projectStore = useProjectStore();

const colorFormData = ref(props.project?.color || "#3B82F6");
const showAddStepModal = ref(false);
const newStepData = ref({
  name: "",
  description: "",
});

// Watch for project changes
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      colorFormData.value = newProject.color || "#3B82F6";
      loadProjectSteps(newProject.id);
    }
  },
  { deep: true },
);

// Load steps when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.project) {
      loadProjectSteps(props.project.id);
    }
  },
);

const projectSteps = computed(() => {
  if (!props.project) return [];
  return projectStepStore.getStepsByProjectId(props.project.id);
});

const getClientName = (clientId: string) => {
  return clientStore.getClientById(clientId)?.name || "Client inconnu";
};

const getTotalProjectHours = (projectId: string): number => {
  const total = timeEntryStore.entries
    .filter((entry) => entry.project_id === projectId)
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);
  return Math.round(total * 2) / 2;
};

const getProjectTimeEntryCount = (projectId: string): number => {
  return timeEntryStore.entries.filter(
    (entry) => entry.project_id === projectId,
  ).length;
};

const saveProjectColor = async () => {
  if (!props.project || !colorFormData.value) return;

  try {
    await projectStore.updateProject(props.project.id, {
      ...props.project,
      color: colorFormData.value,
    });
    props.project.color = colorFormData.value;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la couleur:", error);
  }
};

const saveNewStep = async () => {
  if (!newStepData.value.name || !props.project) {
    alert("Veuillez entrer le nom de l'étape");
    return;
  }

  try {
    await projectStepStore.addStep(props.project.id, {
      name: newStepData.value.name,
      description: newStepData.value.description || undefined,
      status: "active",
    });
    newStepData.value = { name: "", description: "" };
    showAddStepModal.value = false;
  } catch (error) {
    console.error("Erreur lors de la création de l'étape:", error);
  }
};

const deleteStep = async (stepId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette étape?")) {
    try {
      await projectStepStore.deleteStep(stepId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étape:", error);
    }
  }
};

const getStepHours = (stepId: string): number => {
  return timeEntryStore.entries
    .filter((entry) => entry.step_id === stepId)
    .reduce((sum, entry) => sum + entry.hours, 0);
};

const loadProjectSteps = async (projectId: string) => {
  try {
    await projectStepStore.fetchSteps(projectId);
  } catch (error) {
    console.error("Erreur lors du chargement des étapes:", error);
  }
};
</script>
<style scoped>
input[type="color"] {
  appearance: none;
  -webkit-appearance: none;
  /* border: 2px solid #e5e7eb; */
  border-radius: 100%;
  cursor: pointer;
}

/* input[type="color"]:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
} */
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
}
</style>
