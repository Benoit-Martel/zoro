<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Calendar Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <button
          @click="previousMonth"
          class="text-blue-600 hover:text-blue-700 transition p-2"
          :aria-label="'Mois précédent'"
        >
          <ChevronLeft :size="28" />
        </button>
        <div class="flex items-center pl-12 gap-12 flex-1">
          <!-- Project Filter -->
          <div class="">
            <select
              v-model="selectedProject"
              @change="loadEntries"
              class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">Tous les projets</option>
              <option
                v-for="project in activeProjects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">
            {{ monthYearDisplay }}
          </h3>
        </div>
        <button
          @click="nextMonth"
          class="text-blue-600 hover:text-blue-700 transition p-2"
          :aria-label="'Mois suivant'"
        >
          <ChevronRight :size="28" />
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7">
        <!-- Day headers -->
        <div
          v-for="dayName in dayNames"
          :key="dayName"
          class="bg-blue-600 text-white font-bold p-2 text-center"
        >
          {{ dayName }}
        </div>

        <!-- Empty cells for days before month starts -->
        <div
          v-for="_ in firstDayOfMonth"
          :key="`empty-${_}`"
          class="bg-gray-100 min-h-24"
        ></div>

        <!-- Calendar days -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          @click="openNewEntryModal(day)"
          class="border border-gray-200 p-2 min-h-24 transition cursor-pointer aspect-square"
          :class="{
            'bg-blue-100': isToday(day),
            'bg-gray-100': isWeekend(day) && !isToday(day),
            'bg-white': !isWeekend(day) && !isToday(day),
          }"
        >
          <div
            v-if="getDayEntries(day).length === 0"
            class="font-bold text-lg text-gray-900 mb-1"
          >
            {{ day }}
          </div>
          <div class="text-xs space-y-1 overflow-hidden max-h-20" @click.stop>
            <div
              v-for="entry in getDayEntries(day)"
              :key="entry.id"
              @click.stop="openEditModal(entry)"
              class="rounded px-1 py-0.5 cursor-pointer transition hover:shadow-md flex items-start justify-between gap-1 overflow-hidden"
              :style="{
                backgroundColor: getProjectColor(entry.project_id),
                color: getContrastTextColor(getProjectColor(entry.project_id)),
              }"
            >
              <div class="font-semibold flex-shrink-0">{{ entry.hours }}h</div>
              <div class="flex-1 text-right overflow-hidden">
                <div class="truncate text-xs">
                  {{ getProjectName(entry.project_id) }}
                </div>
                <div
                  v-if="getServiceName(entry.service_id)"
                  class="truncate text-xs font-medium"
                >
                  {{ getServiceName(entry.service_id) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Entry Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="closeEditModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-2 text-gray-900">Modifier l'entrée</h3>
        <p class="text-sm text-gray-500 mb-6">
          ID:
          <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{
            editingEntryId
          }}</span>
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-bold mb-2">Date</label>
            <input
              v-model="editFormData.date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Heures</label>
            <input
              v-model.number="editFormData.hours"
              type="number"
              step="0.25"
              min="0.25"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Étape (optionnel)</label
            >
            <select
              v-model="editFormData.step_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Pas d'étape --</option>
              <option
                v-for="step in getStepsForProject(editingProjectId)"
                :key="step.id"
                :value="step.id"
              >
                {{ step.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Service</label>
            <select
              v-model="editFormData.service_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Aucun service --</option>
              <option
                v-for="service in serviceStore.services"
                :key="service.id"
                :value="service.id"
              >
                {{ service.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Description</label
            >
            <textarea
              v-model="editFormData.description"
              placeholder="Description du travail effectué"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-4 mt-6">
          <button
            @click="saveEdit"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Sauvegarder
          </button>
          <button
            @click="closeEditModal"
            class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Annuler
          </button>
          <button
            @click="deleteEdit"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- New Entry from Calendar Modal -->
    <div
      v-if="showNewEntryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="closeNewEntryModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          Nouvelle entrée de temps
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-bold mb-2">Projet</label>
            <select
              v-model="newEntryFormData.project_id"
              @change="updateAvailableSteps"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">Sélectionner un projet</option>
              <option
                v-for="project in activeProjects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div v-if="newEntryFormData.project_id">
            <label class="block text-gray-700 font-bold mb-2"
              >Étape (optionnel)</label
            >
            <select
              v-model="newEntryFormData.step_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Pas d'étape --</option>
              <option
                v-for="step in availableSteps"
                :key="step.id"
                :value="step.id"
              >
                {{ step.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Service</label>
            <select
              v-model="newEntryFormData.service_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Aucun service --</option>
              <option
                v-for="service in serviceStore.services"
                :key="service.id"
                :value="service.id"
              >
                {{ service.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Date</label>
            <input
              v-model="newEntryFormData.date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Heures</label>
            <input
              v-model.number="newEntryFormData.hours"
              type="number"
              step="0.25"
              min="0.25"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Description</label
            >
            <textarea
              v-model="newEntryFormData.description"
              placeholder="Description du travail effectué"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-4 mt-6">
          <button
            @click="saveNewEntry"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Créer
          </button>
          <button
            @click="closeNewEntryModal"
            class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="timeEntryStore.error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4"
    >
      {{ timeEntryStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useProjectStepStore } from "../stores/projectStepStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { useServiceStore } from "../stores/serviceStore";
import { SupabaseService } from "../services/supabase";

const route = useRoute();
const projectStore = useProjectStore();
const projectStepStore = useProjectStepStore();
const timeEntryStore = useTimeEntryStore();
const serviceStore = useServiceStore();

const selectedProject = ref<string>((route.query.project as string) || "");
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

// Edit modal state
const showEditModal = ref(false);
const editingEntryId = ref<string | null>(null);
const editingProjectId = ref<string>("");
const editFormData = ref({
  date: "",
  hours: 8,
  description: "",
  step_id: "",
  service_id: "",
});

// New entry modal state
const showNewEntryModal = ref(false);
const newEntryFormData = ref({
  project_id: "",
  step_id: "",
  date: new Date().toISOString().split("T")[0],
  hours: 8,
  description: "",
  service_id: "",
});

// Steps
const availableSteps = ref<any[]>([]);

// Calendar computed properties
const firstDayOfMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1);
  // Return day of week starting with Sunday (0 = Sunday)
  return date.getDay();
});

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const monthYearDisplay = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value);
  return date.toLocaleDateString("fr-CA", { month: "long", year: "numeric" });
});

const activeProjects = computed(() => {
  return projectStore.projects.filter((p) => p.status === "active");
});

onMounted(async () => {
  await projectStore.fetchProjects();
  await serviceStore.fetchServices();
  await loadEntries();
});

const loadEntries = async () => {
  if (selectedProject.value) {
    await timeEntryStore.fetchTimeEntries(selectedProject.value);
  } else {
    await timeEntryStore.fetchTimeEntries();
  }
};

// Edit modal methods
const openEditModal = async (entry: any) => {
  editingEntryId.value = entry.id;
  editingProjectId.value = entry.project_id;
  // Load the steps for this project FIRST (await the fetch)
  if (entry.project_id) {
    await projectStepStore.fetchSteps(entry.project_id);
  }
  // THEN set the form data with the loaded steps available
  editFormData.value = {
    date: entry.date,
    hours: entry.hours,
    description: entry.description || "",
    step_id: entry.step_id || "",
    service_id: entry.service_id || "",
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEntryId.value = null;
};

const saveEdit = async () => {
  if (!editingEntryId.value) return;

  try {
    // Get the original entry to keep project_id
    const originalEntry = timeEntryStore.entries.find(
      (e) => e.id === editingEntryId.value,
    );

    if (!originalEntry) return;

    await timeEntryStore.updateTimeEntry(editingEntryId.value, {
      project_id: originalEntry.project_id,
      step_id: editFormData.value.step_id || undefined,
      service_id: editFormData.value.service_id || undefined,
      date: editFormData.value.date,
      hours: editFormData.value.hours,
      description: editFormData.value.description,
    });

    closeEditModal();
    await loadEntries();
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
  }
};

const deleteEdit = async () => {
  if (
    !editingEntryId.value ||
    !confirm("Êtes-vous sûr de vouloir supprimer cette entrée?")
  ) {
    return;
  }

  try {
    await timeEntryStore.deleteTimeEntry(editingEntryId.value);
    closeEditModal();
    await loadEntries();
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
};

// New entry modal methods
const openNewEntryModal = async (day: number) => {
  const dateStr = new Date(currentYear.value, currentMonth.value, day)
    .toISOString()
    .split("T")[0];

  try {
    // Get all entries directly
    const allEntries = await SupabaseService.getTimeEntries();

    // Find the most recent entry by created_at (most recently entered)
    let latestEntry = null;
    if (allEntries && allEntries.length > 0) {
      const sorted = [...allEntries].sort((a, b) => {
        // Sort by created_at descending (newest entry first)
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      latestEntry = sorted[0];
    }

    console.log("Latest entry entered:", latestEntry);

    // Set form with latest entry defaults
    newEntryFormData.value = {
      project_id: latestEntry?.project_id || "",
      step_id: latestEntry?.step_id || "",
      date: dateStr,
      hours: 8,
      description: "",
      service_id: latestEntry?.service_id || "",
    };

    // Load steps for the pre-filled project
    if (latestEntry?.project_id) {
      await projectStepStore.fetchSteps(latestEntry.project_id);
      availableSteps.value = projectStepStore.steps;
    } else {
      availableSteps.value = [];
    }

    showNewEntryModal.value = true;
  } catch (error) {
    console.error("Error opening new entry modal:", error);
    showNewEntryModal.value = true;
  }
};

const closeNewEntryModal = () => {
  showNewEntryModal.value = false;
};

const saveNewEntry = async () => {
  if (!newEntryFormData.value.project_id) {
    alert("Veuillez sélectionner un projet");
    return;
  }

  try {
    await timeEntryStore.addTimeEntry({
      project_id: newEntryFormData.value.project_id,
      step_id: newEntryFormData.value.step_id || undefined,
      date: newEntryFormData.value.date,
      hours: newEntryFormData.value.hours,
      description: newEntryFormData.value.description,
      service_id: newEntryFormData.value.service_id || undefined,
    });

    closeNewEntryModal();
    await loadEntries();
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée:", error);
  }
};

const getProjectName = (projectId: string) => {
  return projectStore.getProjectById(projectId)?.name || "Inconnu";
};

const getServiceName = (serviceId: string | undefined) => {
  if (!serviceId) return "";
  return serviceStore.getServiceById(serviceId)?.name || "";
};

const getProjectColor = (projectId: string): string => {
  const project = projectStore.getProjectById(projectId);
  return project?.color || "#3B82F6";
};

const getContrastTextColor = (hexColor: string): string => {
  // Convert hex to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return dark or light text based on luminance
  return luminance > 0.5 ? "#1F2937" : "#FFFFFF";
};

// Calendar methods
const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const isToday = (day: number) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  );
};

const isWeekend = (day: number) => {
  const dayOfWeek = new Date(
    currentYear.value,
    currentMonth.value,
    day,
  ).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

const getDayEntries = (day: number) => {
  const dateStr = new Date(currentYear.value, currentMonth.value, day)
    .toISOString()
    .split("T")[0];

  let entries = timeEntryStore.entries.filter((e) => e.date === dateStr);

  // Apply project filter if selected
  if (selectedProject.value) {
    entries = entries.filter((e) => e.project_id === selectedProject.value);
  }

  return entries;
};

// Step management methods
const updateAvailableSteps = async () => {
  if (newEntryFormData.value.project_id) {
    await projectStepStore.fetchSteps(newEntryFormData.value.project_id);
    availableSteps.value = projectStepStore.steps;
  } else {
    availableSteps.value = [];
    newEntryFormData.value.step_id = "";
  }
};

const getStepsForProject = (projectId: string) => {
  return projectStepStore.getStepsByProjectId(projectId);
};
</script>
