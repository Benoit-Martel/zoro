<template>
  <PageLoad :loading="pageLoading" :error="pageError" @retry="reloadPage">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex gap-4 items-center mb-8">
      <div class="flex-1 flex gap-4 items-center">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Filtrer par nom de projet..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        <!-- Filter Toggle -->
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
      <button
        @click="showNewProjectModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition whitespace-nowrap"
      >
        Nouveau projet
      </button>
    </div>

    <!-- Projects Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr style="height: 62px">
            <th
              @click="toggleSort('name')"
              class="px-6 py-2 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Nom
              <ChevronUp
                v-if="getSortIndicator('name') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('name') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('client')"
              class="px-6 py-2 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Client
              <ChevronUp
                v-if="getSortIndicator('client') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('client') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('hours')"
              class="px-6 py-2 text-center font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Heures
              <ChevronUp
                v-if="getSortIndicator('hours') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('hours') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th class="px-6 py-2 text-center font-bold text-gray-900">
              Statut
            </th>
            <th class="px-6 py-2 text-center font-bold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in filteredProjects"
            :key="project.id"
            style="height: 62px"
            class="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            @click="openProjectModal(project)"
          >
            <td class="px-6 py-2 font-semibold text-gray-900">
              {{ project.name }}
            </td>
            <td class="px-6 py-2 text-gray-700">
              {{ getClientName(project.client_id) }}
            </td>
            <td class="px-6 py-2 text-center text-gray-700">
              {{ getTotalProjectHours(project.id) }}h
            </td>
            <td class="px-6 py-2 text-center" @click.stop>
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
            <td class="px-6 py-2 flex justify-center items-center" @click.stop>
              <router-link
                :to="`/timesheet?project=${project.id}`"
                class="text-blue-600 hover:text-blue-700 transition mr-4"
                title="Enregistrer des heures"
              >
                <Clock :size="18" />
              </router-link>
              <button
                @click.stop="deleteProject(project.id)"
                class="text-red-600"
                title="Supprimer ce projet"
              >
                <X :size="28" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0" style="height: 62px">
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

    <!-- New Project Modal -->
    <div
      v-if="showNewProjectModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="showNewProjectModal = false"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          Créer un nouveau projet
        </h3>
        <form @submit.prevent="saveNewProject" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-bold mb-2">Client</label>
            <select
              v-model="newProjectData.client_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            >
              <option value="">Sélectionner un client</option>
              <option
                v-for="client in clientStore.clients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Nom du projet</label
            >
            <input
              v-model="newProjectData.name"
              type="text"
              placeholder="ex. Site web"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Taux horaire ($)</label
            >
            <input
              v-model.number="newProjectData.hourly_rate"
              type="number"
              placeholder="ex. 50"
              step="0.01"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div class="flex gap-4 mt-6">
            <button
              type="submit"
              :disabled="
                !newProjectData.client_id ||
                !newProjectData.name ||
                newProjectData.hourly_rate <= 0
              "
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
            >
              Créer le projet
            </button>
            <button
              type="button"
              @click="showNewProjectModal = false"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Project Detail Modal Component -->
    <Project
      :is-open="showProjectModal"
      :project="selectedProject"
      @close="closeProjectModal"
      @delete="handleProjectDelete"
    />
  </div>
  </PageLoad>
</template>

<script setup lang="ts">
import PageLoad from "../components/PageLoad.vue";
import { usePageLoad } from "../composables/usePageLoad";
import { ref, computed } from "vue";
import { Clock, X, ChevronUp, ChevronDown } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import Project from "../components/Project.vue";

const projectStore = useProjectStore();
const clientStore = useClientStore();
const contactStore = useContactStore();
const timeEntryStore = useTimeEntryStore();
const filterStatus = ref<"all" | "active" | "archived">("active");
const searchTerm = ref("");
const selectedProject = ref<any>(null);
const showProjectModal = ref(false);
const showNewProjectModal = ref(false);
const sortColumn = ref<"name" | "client" | "hours">("name");
const sortDirection = ref<"asc" | "desc">("asc");
const newProjectData = ref({
  client_id: "",
  name: "",
  hourly_rate: 0,
});

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

  // Sort
  return filtered.sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortColumn.value === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortColumn.value === "client") {
      aVal = (clientStore.getClientById(a.client_id)?.name || "").toLowerCase();
      bVal = (clientStore.getClientById(b.client_id)?.name || "").toLowerCase();
    } else if (sortColumn.value === "hours") {
      aVal = timeEntryStore.getProjectHours(a.id);
      bVal = timeEntryStore.getProjectHours(b.id);
    }

    if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
    return 0;
  });
});

const toggleSort = (column: "name" | "client" | "hours") => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const getSortIndicator = (column: "name" | "client" | "hours") => {
  if (sortColumn.value !== column) return "none";
  return sortDirection.value === "asc" ? "asc" : "desc";
};

const { pageLoading, pageError, reloadPage } = usePageLoad(async () => {
  await clientStore.fetchClients();
  if (clientStore.error) throw new Error(clientStore.error);
  await projectStore.fetchProjects();
  if (projectStore.error) throw new Error(projectStore.error);
  await timeEntryStore.fetchTimeEntries();
  if (timeEntryStore.error) throw new Error(timeEntryStore.error);
  // Fetch all contacts for all clients
  for (const client of clientStore.clients) {
    await contactStore.fetchContacts(client.id);
    if (contactStore.error) throw new Error(contactStore.error);
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
  showProjectModal.value = true;
};

const closeProjectModal = () => {
  showProjectModal.value = false;
  selectedProject.value = null;
};

const handleProjectDelete = async () => {
  if (selectedProject.value) {
    await deleteProject(selectedProject.value.id);
  }
};

const saveNewProject = async () => {
  if (
    !newProjectData.value.client_id ||
    !newProjectData.value.name ||
    newProjectData.value.hourly_rate <= 0
  ) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  try {
    await projectStore.addProject({
      client_id: newProjectData.value.client_id,
      name: newProjectData.value.name,
      hourly_rate: newProjectData.value.hourly_rate,
      status: "active",
    });
    showNewProjectModal.value = false;
    newProjectData.value = {
      client_id: "",
      name: "",
      hourly_rate: 0,
    };
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
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
