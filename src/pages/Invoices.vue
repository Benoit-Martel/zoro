<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Invoice Generator Modal -->
    <div
      v-if="showInvoiceModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="closeInvoiceModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-96 overflow-y-auto"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          Générer une facture
        </h3>
        <form @submit.prevent="generateInvoice" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-bold mb-2">Projet</label>
            <select
              v-model="invoiceForm.project_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
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
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Date de début</label
              >
              <input
                v-model="invoiceForm.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Date de fin</label
              >
              <input
                v-model="invoiceForm.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Numéro de facture</label
            >
            <input
              v-model="invoiceForm.invoice_number"
              type="text"
              placeholder="ex. FAC-001"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div class="flex gap-4 mt-6">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
            >
              {{ loading ? "Génération en cours..." : "Générer" }}
            </button>
            <button
              type="button"
              @click="closeInvoiceModal"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Preview -->
    <div
      v-if="previewData"
      class="bg-white rounded-lg shadow-md p-8 mb-8 border-2 border-gray-200"
    >
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">FACTURE</h1>
          <p class="text-gray-600 mt-2">
            Facture #{{ previewData.invoice_number }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-gray-600">{{ formatDate(previewData.date) }}</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="font-bold text-gray-900 mb-2">
          Projet: {{ getProjectName(previewData.project_id) }}
        </h3>
      </div>

      <table class="w-full mb-8">
        <thead>
          <tr class="border-b-2 border-gray-300">
            <th class="text-left py-2 font-bold text-gray-900">Date</th>
            <th class="text-left py-2 font-bold text-gray-900">Description</th>
            <th class="text-right py-2 font-bold text-gray-900">Heures</th>
            <th class="text-right py-2 font-bold text-gray-900">Taux</th>
            <th class="text-right py-2 font-bold text-gray-900">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in previewData.items"
            :key="item.id"
            class="border-b border-gray-200"
          >
            <td class="py-3 text-gray-700">{{ formatDate(item.date) }}</td>
            <td class="py-3 text-gray-700">{{ item.description }}</td>
            <td class="py-3 text-right text-gray-700">{{ item.hours }}</td>
            <td class="py-3 text-right text-gray-700">
              ${{ getProjectRate(previewData.project_id).toFixed(2) }}
            </td>
            <td class="py-3 text-right text-gray-700">
              ${{
                (item.hours * getProjectRate(previewData.project_id)).toFixed(2)
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-end mb-8">
        <div class="w-48">
          <div
            class="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-gray-900"
          >
            <span>Total:</span>
            <span>${{ previewData.total_amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <button
        @click="saveInvoice"
        :disabled="savingInvoice"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition disabled:opacity-50 mr-2"
      >
        {{
          savingInvoice
            ? "Enregistrement en cours..."
            : "Enregistrer la facture"
        }}
      </button>
      <button
        @click="previewData = null"
        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full transition"
      >
        Annuler
      </button>
    </div>

    <!-- Saved Invoices -->
    <div class="flex gap-4 items-center mb-8">
      <input
        v-model="invoiceFilter"
        type="text"
        placeholder="Filtrer par numéro de facture ou projet..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      />

      <button
        @click="createNewInvoice"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
      >
        Nouvelle facture
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr style="height: 62px">
            <th
              @click="toggleSort('invoice_number')"
              class="px-6 py-3 text-left text-gray-900 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
            >
              #
              <ChevronUp
                v-if="getSortIndicator('invoice_number') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('invoice_number') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('project')"
              class="px-6 py-3 text-left text-gray-900 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Projet
              <ChevronUp
                v-if="getSortIndicator('project') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('project') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('date')"
              class="px-6 py-3 text-left text-gray-900 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Date
              <ChevronUp
                v-if="getSortIndicator('date') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('date') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('total')"
              class="px-6 py-3 text-right text-gray-900 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Total
              <ChevronUp
                v-if="getSortIndicator('total') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('total') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th
              @click="toggleSort('status')"
              class="px-6 py-3 text-left text-gray-900 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Statut
              <ChevronUp
                v-if="getSortIndicator('status') === 'asc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
              <ChevronDown
                v-else-if="getSortIndicator('status') === 'desc'"
                :size="16"
                class="inline ml-2 text-gray-600"
              />
            </th>
            <th class="px-6 py-3 text-center text-gray-900 font-bold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in filteredSortedInvoices"
            :key="invoice.id"
            @click="viewInvoice(invoice.id)"
            style="height: 62px"
            class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
          >
            <td class="px-6 py-4 text-gray-700">
              {{ invoice.invoice_number }}
            </td>
            <td class="px-6 py-4 text-gray-700">
              {{ getProjectName(invoice.project_id) }}
            </td>
            <td class="px-6 py-4 text-gray-700">
              {{ formatDate(invoice.date) }}
            </td>
            <td class="px-6 py-4 text-right text-gray-900 font-semibold">
              ${{ getInvoiceTotal(invoice.id).toFixed(2) }}
            </td>
            <td class="px-6 py-4">
              <select
                :value="invoice.status || 'draft'"
                @click.stop
                @change="updateInvoiceStatus(invoice.id, $event)"
                class="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
              </select>
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click.stop="deleteInvoice(invoice.id)"
                class="text-red-600 hover:text-red-800 transition"
                title="Supprimer la facture"
              >
                <Trash2 :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="filteredSortedInvoices.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Aucune facture enregistrée pour le moment.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { SupabaseService } from "../services/supabase";
import type { Invoice } from "../types";

const projectStore = useProjectStore();
const timeEntryStore = useTimeEntryStore();
const router = useRouter();

const loading = ref(false);
const savingInvoice = ref(false);
const savedInvoices = ref<Invoice[]>([]);
const invoiceItems = ref<Map<string, any[]>>(new Map()); // Store items by invoice ID
const sortColumn = ref<
  "invoice_number" | "project" | "date" | "total" | "status"
>("invoice_number");
const sortDirection = ref<"asc" | "desc">("desc");
const showInvoiceModal = ref(false);
const invoiceFilter = ref("");

const invoiceForm = ref({
  project_id: "",
  invoice_number: "",
  startDate: "",
  endDate: "",
});

const previewData = ref<Invoice | null>(null);

onMounted(async () => {
  await projectStore.fetchProjects();
  await loadSavedInvoices();
});

const loadSavedInvoices = async () => {
  try {
    savedInvoices.value = await SupabaseService.getInvoices();
    // Load invoice items for each invoice to calculate totals
    for (const invoice of savedInvoices.value) {
      const items = await SupabaseService.getInvoiceItems(invoice.id);
      invoiceItems.value.set(invoice.id, items);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des factures:", error);
  }
};

const generateInvoice = async () => {
  if (!invoiceForm.value.project_id || !invoiceForm.value.invoice_number) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }

  loading.value = true;
  try {
    const entries = await SupabaseService.getProjectTimeEntries(
      invoiceForm.value.project_id,
      invoiceForm.value.startDate || undefined,
      invoiceForm.value.endDate || undefined,
    );

    const project = projectStore.getProjectById(invoiceForm.value.project_id);
    if (!project) {
      alert("Projet non trouvé");
      return;
    }

    const totalAmount = SupabaseService.calculateInvoiceTotal(
      entries,
      project.hourly_rate,
    );

    previewData.value = {
      id: "",
      project_id: invoiceForm.value.project_id,
      invoice_number: invoiceForm.value.invoice_number,
      date: new Date().toISOString().split("T")[0],
      total_amount: totalAmount,
      status: "draft",
      items: entries,
    };
  } catch (error) {
    console.error("Erreur lors de la génération de la facture:", error);
    alert("Échec de la génération de la facture");
  } finally {
    loading.value = false;
  }
};

const saveInvoice = async () => {
  if (!previewData.value) return;

  savingInvoice.value = true;
  try {
    await SupabaseService.createInvoice({
      project_id: previewData.value.project_id,
      invoice_number: previewData.value.invoice_number,
      date: previewData.value.date,
      total_amount: previewData.value.total_amount,
      status: previewData.value.status,
      items: previewData.value.items,
    });

    await loadSavedInvoices();
    previewData.value = null;
    invoiceForm.value = {
      project_id: "",
      invoice_number: "",
      startDate: "",
      endDate: "",
    };
    closeInvoiceModal();
    alert("Facture enregistrée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la facture:", error);
    alert("Échec de l'enregistrement de la facture");
  } finally {
    savingInvoice.value = false;
  }
};

const getInvoiceTotal = (invoiceId: string) => {
  const items = invoiceItems.value.get(invoiceId) || [];
  if (items.length === 0) return 0;
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  return subtotal + tps + tvq;
};

const getProjectName = (projectId: string) => {
  return projectStore.getProjectById(projectId)?.name || "Inconnu";
};

const getProjectRate = (projectId: string) => {
  return projectStore.getProjectById(projectId)?.hourly_rate || 0;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const viewInvoice = (invoiceId: string) => {
  router.push(`/invoices/${invoiceId}`);
};

const deleteInvoice = async (invoiceId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture?")) {
    return;
  }

  try {
    await SupabaseService.deleteInvoice(invoiceId);
    savedInvoices.value = savedInvoices.value.filter(
      (inv) => inv.id !== invoiceId,
    );
    invoiceItems.value.delete(invoiceId);
    alert("Facture supprimée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error);
    alert("Erreur lors de la suppression de la facture");
  }
};

const activeProjects = computed(() => {
  return projectStore.projects.filter((p) => p.status === "active");
});

const filteredSortedInvoices = computed(() => {
  let filtered = [...savedInvoices.value];

  // Apply text filter
  if (invoiceFilter.value) {
    const filterLower = invoiceFilter.value.toLowerCase();
    filtered = filtered.filter((invoice) => {
      const invoiceNumber = invoice.invoice_number.toLowerCase();
      const projectName = getProjectName(invoice.project_id).toLowerCase();
      return (
        invoiceNumber.includes(filterLower) || projectName.includes(filterLower)
      );
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortColumn.value === "invoice_number") {
      aVal = a.invoice_number;
      bVal = b.invoice_number;
    } else if (sortColumn.value === "project") {
      aVal = getProjectName(a.project_id);
      bVal = getProjectName(b.project_id);
    } else if (sortColumn.value === "date") {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    } else if (sortColumn.value === "total") {
      aVal = getInvoiceTotal(a.id);
      bVal = getInvoiceTotal(b.id);
    } else if (sortColumn.value === "status") {
      aVal = a.status || "draft";
      bVal = b.status || "draft";
    }

    if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
});

const toggleSort = (
  column: "invoice_number" | "project" | "date" | "total" | "status",
) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const getSortIndicator = (
  column: "invoice_number" | "project" | "date" | "total" | "status",
) => {
  if (sortColumn.value !== column) return "none";
  return sortDirection.value === "asc" ? "asc" : "desc";
};

const getNextInvoiceNumber = (): string => {
  let maxNum = 0;
  for (const inv of savedInvoices.value) {
    const match = inv.invoice_number.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return String(maxNum + 1);
};

const createNewInvoice = async () => {
  try {
    const newInvoice = await SupabaseService.createInvoice({
      project_id: null as any,
      invoice_number: getNextInvoiceNumber(),
      date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      status: "draft",
    });
    router.push(`/invoices/${newInvoice.id}`);
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
  }
};

const updateInvoiceStatus = async (invoiceId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newStatus = target.value;

  try {
    await SupabaseService.updateInvoice(invoiceId, { status: newStatus });

    // Update the local state
    const invoiceIndex = savedInvoices.value.findIndex(
      (inv) => inv.id === invoiceId,
    );
    if (invoiceIndex !== -1) {
      savedInvoices.value[invoiceIndex].status = newStatus;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    alert("Erreur lors de la mise à jour du statut de la facture");
  }
};
</script>
