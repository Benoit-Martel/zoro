<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex gap-4 items-center mb-8">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Filtrer par nom de projet..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      />
      <div class="flex gap-4 items-center flex-shrink-0">
        <!-- Filter Toggle -->
        <div class="flex items-center gap-2">
          <div class="flex bg-gray-200 rounded-full p-1">
            <button
              @click="filterStatus = 'all'"
              :class="[
                'px-4 py-1 rounded-full font-bold transition',
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              Tous
            </button>
            <button
              @click="filterStatus = 'active'"
              :class="[
                'px-4 py-1 rounded-full font-bold transition',
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              Actifs
            </button>
            <button
              @click="filterStatus = 'archived'"
              :class="[
                'px-4 py-1 rounded-full font-bold transition',
                filterStatus === 'archived'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              Archivés
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h3 class="font-bold text-gray-900">Liste des projets</h3>
      </div>
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left font-bold text-gray-900">Nom</th>
            <th class="px-6 py-3 text-left font-bold text-gray-900">Client</th>
            <th class="px-6 py-3 text-center font-bold text-gray-900">
              Heures
            </th>
            <th class="px-6 py-3 text-center font-bold text-gray-900">
              Statut
            </th>
            <th class="px-6 py-3 text-center font-bold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in filteredProjects"
            :key="project.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            @click="openProjectModal(project)"
          >
            <td class="px-6 py-4 font-semibold text-gray-900">
              {{ project.name }}
            </td>
            <td class="px-6 py-4 text-gray-700">
              {{ getClientName(project.client_id) }}
            </td>
            <td class="px-6 py-4 text-center text-gray-700">
              {{ getTotalProjectHours(project.id) }}h
            </td>
            <td class="px-6 py-4 text-center" @click.stop>
              <button
                @click.stop="toggleProjectStatus(project)"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  project.status === 'active' ? 'bg-green-600' : 'bg-gray-300',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                    project.status === 'active'
                      ? 'translate-x-6'
                      : 'translate-x-0',
                  ]"
                />
              </button>
            </td>
            <td class="px-6 py-4 text-center" @click.stop>
              <router-link
                :to="`/timesheet?project=${project.id}`"
                class="text-blue-600 hover:text-blue-700 transition mr-4"
                title="Enregistrer des heures"
              >
                <Clock :size="18" />
              </router-link>
              <button
                @click.stop="deleteProject(project.id)"
                class="text-red-600 hover:text-red-700 transition"
                title="Supprimer ce projet"
              >
                <Trash2 :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              Aucun projet. Créez-en un pour commencer!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Error Message -->
    <div
      v-if="projectStore.error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      {{ projectStore.error }}
    </div>

    <!-- Project Detail Modal -->
    <div
      v-if="showProjectModal && selectedProject"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeProjectModal"
    >
      <div
        class="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto"
        style="
          padding: 20px;
          scrollbar-width: thin;
          scrollbar-gutter: stable inside;
        "
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          {{ selectedProject.name }}
        </h3>

        <div class="space-y-4">
          <!-- Client Info -->
          <div>
            <label class="block text-gray-700 font-bold mb-1">Client</label>
            <p class="text-gray-900">
              {{ getClientName(selectedProject.client_id) }}
            </p>
          </div>

          <!-- Hourly Rate -->
          <div>
            <label class="block text-gray-700 font-bold mb-1"
              >Taux horaire</label
            >
            <p class="text-gray-900">
              {{ selectedProject.hourly_rate }}$ / heure
            </p>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-gray-700 font-bold mb-1">Statut</label>
            <p class="text-gray-900">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-semibold',
                  selectedProject.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ selectedProject.status === "active" ? "Actif" : "Archivé" }}
              </span>
            </p>
          </div>

          <!-- Color -->
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Couleur du tag</label
            >
            <div class="flex items-center gap-3">
              <input
                v-model="colorFormData"
                type="color"
                class="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <button
                @click="saveProjectColor"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition text-sm"
              >
                Appliquer
              </button>
            </div>
          </div>

          <!-- Total Hours -->
          <div>
            <label class="block text-gray-700 font-bold mb-1"
              >Heures enregistrées</label
            >
            <p class="text-gray-900">
              {{ getTotalProjectHours(selectedProject.id) }}h
            </p>
          </div>

          <!-- Number of Time Entries -->
          <div>
            <label class="block text-gray-700 font-bold mb-1"
              >Nombre d'entrées de temps</label
            >
            <p class="text-gray-900">
              {{ getProjectTimeEntryCount(selectedProject.id) }}
            </p>
          </div>

          <!-- Project ID -->
          <div>
            <label class="block text-gray-700 font-bold mb-1">ID Projet</label>
            <p class="text-gray-900 text-xs break-all">
              {{ selectedProject.id }}
            </p>
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
                </div>
                <button
                  @click="deleteStep(step.id)"
                  class="text-red-600 hover:text-red-800 text-xs"
                >
                  ✕
                </button>
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

        <div class="flex gap-4 mt-6">
          <button
            @click="closeProjectModal"
            class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
          >
            Fermer
          </button>
          <button
            @click="
              deleteProject(selectedProject.id);
              closeProjectModal();
            "
            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Add Step Modal -->
    <div
      v-if="showAddStepModal && selectedProject"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddStepModal = false"
    >
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
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
            <label class="block text-gray-700 font-bold mb-2"
              >Description</label
            >
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
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Créer
          </button>
          <button
            @click="showAddStepModal = false"
            class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { Trash2, Clock } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useProjectStepStore } from "../stores/projectStepStore";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";

const projectStore = useProjectStore();
const projectStepStore = useProjectStepStore();
const clientStore = useClientStore();
const contactStore = useContactStore();
const timeEntryStore = useTimeEntryStore();
const filterStatus = ref<"all" | "active" | "archived">("active");
const searchTerm = ref("");
const selectedProject = ref<any>(null);
const showProjectModal = ref(false);
const colorFormData = ref("#3B82F6");

const filteredProjects = computed(() => {
  let filtered = projectStore.projects;

  // Filter by status
  if (filterStatus.value === "all") {
    filtered = projectStore.projects;
  } else {
    filtered = projectStore.projects.filter(
      (project) => project.status === filterStatus.value,
    );
  }

  // Filter by search term
  if (searchTerm.value.trim()) {
    const searchLower = searchTerm.value.toLowerCase();
    filtered = filtered.filter((project) => {
      const projectNameMatches = project.name
        .toLowerCase()
        .includes(searchLower);
      const clientName =
        clientStore.getClientById(project.client_id)?.name || "";
      const clientNameMatches = clientName.toLowerCase().includes(searchLower);
      return projectNameMatches || clientNameMatches;
    });
  }

  // Sort by newest first (by created_at descending, or by id if no created_at)
  return filtered.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
});

onMounted(async () => {
  await clientStore.fetchClients();
  await projectStore.fetchProjects();
  await timeEntryStore.fetchTimeEntries();
  // Fetch all contacts for all clients
  for (const client of clientStore.clients) {
    await contactStore.fetchContacts(client.id);
  }
});

const deleteProject = async (id: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce projet?")) {
    try {
      await projectStore.deleteProject(id);
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
    }
  }
};

const getClientName = (clientId: string) => {
  return clientStore.getClientById(clientId)?.name || "Client inconnu";
};

const getTotalProjectHours = (projectId: string): number => {
  const total = timeEntryStore.entries
    .filter((entry) => entry.project_id === projectId)
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);
  // Round to nearest 0.5
  return Math.round(total * 2) / 2;
};

const toggleProjectStatus = async (project: any) => {
  try {
    const newStatus = project.status === "active" ? "archived" : "active";
    await projectStore.updateProject(project.id, {
      ...project,
      status: newStatus,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error);
  }
};

const openProjectModal = (project: any) => {
  selectedProject.value = project;
  colorFormData.value = project.color || "#3B82F6";
  showProjectModal.value = true;
  loadProjectSteps(project.id);
};

const closeProjectModal = () => {
  showProjectModal.value = false;
  selectedProject.value = null;
};

const saveProjectColor = async () => {
  if (!selectedProject.value) return;

  try {
    await projectStore.updateProject(selectedProject.value.id, {
      ...selectedProject.value,
      color: colorFormData.value,
    });
    selectedProject.value.color = colorFormData.value;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la couleur:", error);
  }
};

const getProjectTimeEntryCount = (projectId: string): number => {
  return timeEntryStore.entries.filter(
    (entry) => entry.project_id === projectId,
  ).length;
};

// Step management
const showAddStepModal = ref(false);
const newStepData = ref({
  name: "",
  description: "",
});

const projectSteps = computed(() => {
  if (!selectedProject.value) return [];
  return projectStepStore.getStepsByProjectId(selectedProject.value.id);
});

const saveNewStep = async () => {
  if (!newStepData.value.name || !selectedProject.value) {
    alert("Veuillez entrer le nom de l'étape");
    return;
  }

  try {
    await projectStepStore.addStep(selectedProject.value.id, {
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

const loadProjectSteps = async (projectId: string) => {
  try {
    await projectStepStore.fetchSteps(projectId);
  } catch (error) {
    console.error("Erreur lors du chargement des étapes:", error);
  }
};
</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
