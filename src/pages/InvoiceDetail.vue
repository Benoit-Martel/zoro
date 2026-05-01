<template>
  <div v-if="invoice" class="invoice-container">
    <!-- Top Buttons -->
    <div class="flex justify-between gap-4 mb-6 px-4 flex-wrap">
      <div class="flex gap-4 flex-wrap">
        <button
          @click="openImportModal"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition"
        >
          Importer des heures
        </button>
        <button
          @click="printInvoice"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
        >
          Imprimer
        </button>
        <button
          @click="sendInvoice"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition"
        >
          Envoyer
        </button>
      </div>
    </div>

    <!-- Printable Invoice -->
    <div class="invoice-content bg-white p-12 max-w-4xl mx-auto my-8">
      <!-- Header -->
      <div
        class="flex justify-between items-center mb-12 pb-8 border-b-2 border-green-300"
      >
        <div>
          <h1 class="text-4xl font-bold text-gray-900">FACTURE</h1>
        </div>
        <div class="text-right">
          <p class="text-gray-600">
            <span class="font-semibold">Facture:</span>
            {{ invoice.invoice_number }}
          </p>
          <p class="text-gray-600">
            <span class="font-semibold">Date:</span>
            {{ formatDate(invoice.date) }}
          </p>
        </div>
      </div>

      <!-- Client & Project Info (2-column) -->
      <div class="grid grid-cols-2 gap-8 mb-12">
        <!-- From -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 uppercase mb-2">De</h3>
          <p class="text-gray-900 font-semibold">Benoit Martel</p>
          <p class="text-gray-600 text-sm">
            58 rue Varennes<br />Laval (Québec) H7M 1V6
          </p>
        </div>

        <!-- Bill To - Always Visible with Dropdowns -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-gray-700 uppercase mb-2">
            Facturer à
          </h3>
          
          <!-- Client Dropdown -->
          <div class="print-only">
            <p class="text-gray-900 font-semibold">
              {{ client?.name || "Client inconnu" }}
            </p>
          </div>
          <div class="no-print">
            <select
              v-model="selectedClientId"
              @change="onClientChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Sélectionner un client --</option>
              <option v-for="c in availableClients" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          
          <!-- Project Dropdown -->
          <div class="print-only" v-if="project?.name">
            <p class="text-gray-700 text-sm mt-2">
              <span class="font-semibold">Projet:</span> {{ project.name }}
            </p>
          </div>
          <div class="no-print">
            <select
              v-model="selectedProjectId"
              @change="onProjectChange"
              :disabled="!selectedClientId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Sélectionner un projet --</option>
              <option v-for="p in availableProjects" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
          
          <!-- Contact Dropdown -->
          <div class="print-only" v-if="contact?.name">
            <p class="text-gray-700 text-sm">
              <span class="font-semibold">Contact:</span> {{ contact.name }}
            </p>
          </div>
          <div class="no-print">
            <select
              v-model="selectedContactId"
              @change="onContactChange"
              :disabled="!selectedClientId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Sélectionner un contact --</option>
              <option v-for="c in availableContacts" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          
          <!-- Client Details (Print only) -->
          <div class="print-only">
            <p v-if="client?.email" class="text-gray-600 text-sm mt-2">
              {{ client.email }}
            </p>
            <p v-if="client?.phone" class="text-gray-600 text-sm">
              {{ client.phone }}
            </p>
            <p v-if="client?.address" class="text-gray-600 text-sm">
              {{ client.address }}
            </p>
            <p v-if="client?.city" class="text-gray-600 text-sm">
              {{ client.city }}{{ client.province ? ", " + client.province : "" }}
              {{ client.postal_code || "" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Import Modal -->
      <div
        v-if="showImportModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="closeImportModal"
        >
          <div
            class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto"
          >
            <h3 class="text-2xl font-bold mb-6 text-gray-900">
              Importer des heures
            </h3>

            <div class="space-y-4">
              <!-- Date Range -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 font-bold mb-2"
                    >Date de début</label
                  >
                  <input
                    v-model="importForm.startDate"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-bold mb-2"
                    >Date de fin</label
                  >
                  <input
                    v-model="importForm.endDate"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <!-- Import All Checkbox -->
              <div class="flex items-center gap-2">
                <input
                  id="importAll"
                  v-model="importForm.importAll"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <label for="importAll" class="text-gray-700 font-semibold">
                  Importer toutes les heures (ignorer la plage de dates)
                </label>
              </div>

              <!-- Filter Checkbox -->
              <div class="flex items-center gap-2">
                <input
                  id="excludeInvoiced"
                  v-model="importForm.excludeInvoiced"
                  type="checkbox"
                  checked
                  class="rounded border-gray-300"
                />
                <label
                  for="excludeInvoiced"
                  class="text-gray-700 font-semibold"
                >
                  Exclure les heures déjà facturées
                </label>
              </div>

              <!-- Available Entries Preview -->
              <div
                v-if="availableTimeEntries.length > 0"
                class="bg-gray-50 p-4 rounded max-h-40 overflow-y-auto"
              >
                <p class="font-semibold text-gray-900 mb-3">
                  {{ availableTimeEntries.length }} entrée(s) disponible(s)
                </p>
                <div class="space-y-2">
                  <div
                    v-for="entry in availableTimeEntries"
                    :key="entry.id"
                    class="text-sm text-gray-700 pb-2 border-b border-gray-200"
                  >
                    <strong>{{ formatDate(entry.date) }}</strong> -
                    {{ getServiceName(entry.service_id) || "Sans service" }} -
                    <strong>{{ entry.hours }}h</strong>
                  </div>
                </div>
              </div>
              <div v-else class="bg-yellow-50 p-4 rounded text-yellow-800">
                Aucune entrée de temps disponible pour cette plage de dates.
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                @click="importTimeEntries"
                :disabled="availableTimeEntries.length === 0"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
              >
                Ajouter à la facture
              </button>
              <button
                @click="closeImportModal"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

      <!-- Items Table -->
      <div class="mb-12">
        <table class="w-full border-collapse">
            <thead>
              <tr class="bg-green-200 border-b-2 border-green-300">
                <th class="text-left py-3 px-4 font-bold text-gray-900">
                  Description
                </th>
                <th class="text-right py-3 px-4 font-bold text-gray-900">
                  Quantité
                </th>
                <th class="text-right py-3 px-4 font-bold text-gray-900">
                  Prix unitaire
                </th>
                <th class="text-right py-3 px-4 font-bold text-gray-900">
                  Sous-total
                </th>
                <th class="text-center py-3 px-4 font-bold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(items, service) in itemsGroupedByService"
                :key="service"
              >
                <!-- Service Items -->
                <tr
                  v-for="(item, index) in items"
                  :key="index"
                  class="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td class="py-3 px-4 text-gray-900">
                    <p class="font-semibold">{{ getItemDisplay(item).serviceName }}</p>
                    <p v-if="getItemDisplay(item).description" class="text-sm text-gray-600 mt-1">
                      {{ getItemDisplay(item).description }}
                    </p>
                  </td>
                  <td class="py-3 px-4 text-right text-gray-900">
                    {{ item.quantity.toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 text-right text-gray-900">
                    ${{ item.unit_price.toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 text-right text-gray-900">
                    ${{ item.subtotal.toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      @click="deleteInvoiceItem(item.id)"
                      class="text-red-600 hover:text-red-800 transition"
                      title="Supprimer cet article"
                    >
                      <X size="20" />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <!-- Subtotal Row -->
              <tr class="bg-gray-50 border-t-2 border-gray-300">
                <td
                  colspan="3"
                  class="text-right font-bold text-gray-900 py-3 px-4"
                >
                  Sous-total:
                </td>
                <td class="text-right font-bold text-gray-900 py-3 px-4">
                  ${{ subtotal.toFixed(2) }}
                </td>
                <td></td>
              </tr>

              <!-- TPS Row -->
              <tr class="border-b border-gray-200">
                <td
                  colspan="3"
                  class="text-right font-semibold text-gray-900 py-3 px-4"
                >
                  TPS (5%)
                </td>
                <td class="text-right text-gray-900 py-3 px-4">
                  ${{ tpsAmount.toFixed(2) }}
                </td>
                <td></td>
              </tr>

              <!-- TVQ Row -->
              <tr class="border-b border-gray-200">
                <td
                  colspan="3"
                  class="text-right font-semibold text-gray-900 py-3 px-4"
                >
                  TVQ (9.975%)
                </td>
                <td class="text-right text-gray-900 py-3 px-4">
                  ${{ tvqAmount.toFixed(2) }}
                </td>
                <td></td>
              </tr>

              <!-- Grand Total Row -->
              <tr class="bg-green-100 border-t-2 border-green-300">
                <td
                  colspan="3"
                  class="text-right text-lg font-bold text-gray-900 py-3 px-4"
                >
                  TOTAL:
                </td>
                <td
                  class="text-right text-lg font-bold text-gray-900 py-3 px-4"
                >
                  ${{ grandTotal.toFixed(2) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      <!-- Footer -->
      <div class="border-t pt-8 text-center text-gray-600 text-sm">
        <p>Merci de votre confiance!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { X } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { useServiceStore } from "../stores/serviceStore";
import type { Invoice, InvoiceItem } from "../types";
import { SupabaseService } from "../services/supabase";

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const clientStore = useClientStore();
const contactStore = useContactStore();
const timeEntryStore = useTimeEntryStore();
const serviceStore = useServiceStore();

const invoice = ref<Invoice | null>(null);
const invoiceItems = ref<InvoiceItem[]>([]);
const selectedClientId = ref<string>("");
const selectedProjectId = ref<string>("");
const selectedContactId = ref<string>("");

// Import Modal refs
const showImportModal = ref(false);
const importForm = ref({
  startDate: "",
  endDate: "",
  importAll: false,
  excludeInvoiced: true,
});
const project = computed(() => {
  if (!invoice.value) return null;
  return projectStore.getProjectById(invoice.value.project_id);
});

const client = computed(() => {
  if (selectedClientId.value) {
    return clientStore.getClientById(selectedClientId.value);
  }
  if (!project.value) return null;
  return clientStore.getClientById(project.value.client_id);
});

const availableClients = computed(() => {
  return clientStore.clients;
});

const availableProjects = computed(() => {
  if (!selectedClientId.value) return [];
  return projectStore.projects.filter(
    (p) => p.client_id === selectedClientId.value,
  );
});

const availableContacts = computed(() => {
  if (!selectedClientId.value) return [];
  return contactStore.contacts;
});

const contact = computed(() => {
  if (selectedContactId.value) {
    return contactStore.contacts.find((c) => c.id === selectedContactId.value);
  }
  if (!project.value || !project.value.contact_id) return null;
  return contactStore.contacts.find((c) => c.id === project.value!.contact_id);
});

const subtotal = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + item.subtotal, 0);
});

const tpsAmount = computed(() => {
  return subtotal.value * 0.05; // 5% TPS
});

const tvqAmount = computed(() => {
  return subtotal.value * 0.09975; // 9.975% TVQ
});

const grandTotal = computed(() => {
  return subtotal.value + tpsAmount.value + tvqAmount.value;
});

// Get available time entries based on filters
const availableTimeEntries = computed(() => {
  if (!invoice.value) return [];

  let entries = timeEntryStore.timeEntries.filter(
    (entry) => entry.project_id === invoice.value!.project_id,
  );

  // Filter by date range (unless import all is checked)
  if (!importForm.value.importAll) {
    const startDate = importForm.value.startDate
      ? new Date(importForm.value.startDate).getTime()
      : 0;
    const endDate = importForm.value.endDate
      ? new Date(importForm.value.endDate).getTime()
      : Number.MAX_VALUE;

    entries = entries.filter((entry) => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  // Filter out entries already linked to invoices (if option is checked)
  if (importForm.value.excludeInvoiced) {
    const invoicedEntryIds = new Set(
      invoiceItems.value.map((item) => item.time_entry_id),
    );
    entries = entries.filter((entry) => !invoicedEntryIds.has(entry.id));
  }

  return entries;
});

// Group invoice items by service for display
const itemsGroupedByService = computed(() => {
  const grouped: { [key: string]: InvoiceItem[] } = {};

  invoiceItems.value.forEach((item) => {
    const serviceName = getServiceName(item.service_id) || "Sans service";
    if (!grouped[serviceName]) {
      grouped[serviceName] = [];
    }
    grouped[serviceName].push(item);
  });

  return grouped;
});

onMounted(async () => {
  const invoiceId = route.params.id as string;
  if (!invoiceId) {
    router.push("/invoices");
    return;
  }

  // Fetch invoice
  try {
    invoice.value = await SupabaseService.getInvoice(invoiceId);

    // Fetch project and client data
    if (invoice.value.project_id) {
      await projectStore.fetchProjects();
      await clientStore.fetchClients();

      // Set initial selected values
      selectedProjectId.value = invoice.value.project_id;
      const proj = projectStore.getProjectById(invoice.value.project_id);
      if (proj) {
        selectedClientId.value = proj.client_id;
        if (proj.contact_id) {
          selectedContactId.value = proj.contact_id;
        }
        // Fetch contacts for this client
        await contactStore.fetchContacts(proj.client_id);
      }

      // Fetch invoice items from the database
      invoiceItems.value = await SupabaseService.getInvoiceItems(invoiceId);

      // Fetch services for dropdown/display
      await serviceStore.fetchServices();

      // Fetch time entries for import functionality
      await timeEntryStore.fetchTimeEntries();
      console.log(invoiceItems.value);
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la facture:", error);
    router.push("/invoices");
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const printInvoice = () => {
  window.print();
};

const closeInvoice = () => {
  router.push("/invoices");
};

const saveInvoiceAssignment = async () => {
  if (!selectedProjectId.value || !invoice.value) return;

  try {
    // Update invoice with new project_id
    await SupabaseService.updateInvoice(invoice.value.id, {
      project_id: selectedProjectId.value,
    });

    // Update project with new contact_id if selected
    const updatedProject = projectStore.getProjectById(selectedProjectId.value);
    if (updatedProject && selectedContactId.value) {
      await SupabaseService.updateProject(selectedProjectId.value, {
        contact_id: selectedContactId.value,
      });
    }

    // Update invoice object
    invoice.value.project_id = selectedProjectId.value;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
  }
};

// Dropdown change handlers that auto-save
const onClientChange = async () => {
  // Reset project and contact when client changes
  selectedProjectId.value = "";
  selectedContactId.value = "";
};

const onProjectChange = async () => {
  // Reset contact when project changes
  selectedContactId.value = "";
  // Save the assignment
  await saveInvoiceAssignment();
};

const onContactChange = async () => {
  // Save the assignment
  await saveInvoiceAssignment();
};

// Import time entries modal functions
const openImportModal = () => {
  // Set default date range to today
  const today = new Date().toISOString().split("T")[0];
  importForm.value.startDate = today;
  importForm.value.endDate = today;
  importForm.value.importAll = false;
  importForm.value.excludeInvoiced = true;
  showImportModal.value = true;
};

const closeImportModal = () => {
  showImportModal.value = false;
};

const getServiceName = (serviceId: string | null): string | null => {
  if (!serviceId) return null;
  const service = serviceStore.services.find((s) => s.id === serviceId);
  return service ? service.name : null;
};

const getItemDisplay = (item: InvoiceItem) => {
  const serviceName = getServiceName(item.service_id) || "Service";
  // If description is different from service name, it's a custom description
  const hasCustomDescription = item.description && item.description !== serviceName;
  return {
    serviceName,
    description: hasCustomDescription ? item.description : null,
  };
};

const importTimeEntries = async () => {
  if (availableTimeEntries.value.length === 0 || !invoice.value) return;

  try {
    // Fetch the hourly rate for the project
    const hourlyRate = project.value?.hourly_rate || 0;

    // Create invoice items from selected entries, fetching fresh data to ensure service_id is included
    for (const entry of availableTimeEntries.value) {
      // Get fresh entry data to ensure all fields including service_id are present
      const freshEntry = timeEntryStore.getTimeEntryById(entry.id);
      const subtotal = entry.hours * hourlyRate;

      // Create item without id - let Supabase generate it
      const serviceName = getServiceName(freshEntry?.service_id || entry.service_id) || "Service";
      const itemData = {
        invoice_id: invoice.value.id,
        time_entry_id: entry.id || null,
        description: freshEntry?.description || entry.description || serviceName,
        quantity: entry.hours,
        unit_price: hourlyRate,
        subtotal: subtotal,
        service_id: freshEntry?.service_id || entry.service_id || null,
        tax_1_amount: 0,
        tax_2_amount: 0,
        discount_amount: 0,
        line_total: subtotal,
      };

      // Ensure no empty strings in UUID fields (Supabase requires null, not "")
      if (!itemData.service_id || itemData.service_id === "") {
        itemData.service_id = null;
      }
      if (!itemData.time_entry_id || itemData.time_entry_id === "") {
        itemData.time_entry_id = null;
      }

      // Save to database
      const savedItem = await SupabaseService.createInvoiceItem(itemData);
      invoiceItems.value.push(savedItem);
    }

    alert(
      `${availableTimeEntries.value.length} entrée(s) de temps importée(s) avec succès!`,
    );
    closeImportModal();
  } catch (error) {
    console.error("Erreur lors de l'import des heures:", error);
    alert("Erreur lors de l'import des heures");
  }
};

const deleteInvoiceItem = async (itemId: string) => {
  if (!itemId) return;

  if (!confirm("Êtes-vous sûr de vouloir supprimer cet article?")) {
    return;
  }

  try {
    await SupabaseService.deleteInvoiceItem(itemId);
    invoiceItems.value = invoiceItems.value.filter(
      (item) => item.id !== itemId,
    );
    alert("Article supprimé avec succès!");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Erreur lors de la suppression de l'article");
  }
};

const sendInvoice = async () => {
  if (!invoice.value) return;

  try {
    // Update invoice status to "sent"
    await SupabaseService.updateInvoice(invoice.value.id, {
      status: "sent",
    });
    invoice.value.status = "sent";
    alert("Facture envoyée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    alert("Erreur lors de l'envoi de la facture");
  }
};
</script>

<style scoped>
.print-only {
  display: none;
}

.no-print {
  display: block;
}

@media print {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
  }

  @page {
    size: letter;
    margin: 0.5in;
  }

  /* Hide all buttons and top menu */
  button {
    display: none !important;
  }

  /* Hide invoice-container's first child (top buttons section) */
  .invoice-container > div:first-child {
    display: none !important;
  }

  /* Show print-only content and hide edit controls */
  .print-only {
    display: block;
  }

  .no-print {
    display: none !important;
  }

  /* Hide delete buttons */
  button[title="Supprimer cet article"],
  [class*="text-red"] {
    display: none !important;
  }

  /* Hide action column */
  th:last-child,
  td:last-child {
    display: none;
  }

  .invoice-container {
    background: white;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 8.5in;
  }

  .invoice-content {
    max-width: 100%;
    padding: 0.5in;
    margin: 0;
    background: white;
  }

  table {
    font-size: 0.9em;
    width: 100%;
  }

  th,
  td {
    padding: 0.2em 0.3em;
  }

  .flex {
    display: flex;
  }

  .space-y-4 {
    margin: 0 !important;
  }

  /* Avoid page breaks in the middle of content */
  table tr {
    page-break-inside: avoid;
  }

  /* Optimize spacing for letter format */
  h1 {
    font-size: 1.8em;
    margin: 0;
  }

  h3 {
    font-size: 0.85em;
    margin-top: 0.3em;
    margin-bottom: 0.2em;
  }

  p {
    margin: 0;
    font-size: 0.9em;
    line-height: 1.2;
  }

  div[class*="grid"] {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem !important;
  }
}
</style>
