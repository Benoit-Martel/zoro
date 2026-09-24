<template>
  <PageLoad :loading="pageLoading" :error="pageError" @retry="reloadPage">
  <div v-if="invoice" class="invoice-container">
    <!-- Top Buttons with Icons -->
    <div class="flex justify-center gap-4 mt-6 mb-6 px-4 flex-wrap">
      <button
        @click="saveChanges"
        title="Sauvegarder les changements"
        class="flex items-center justify-center bg-blue-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition"
      >
        Sauvegarder
      </button>
      <button
        @click="openImportModal"
        title="Importer des heures"
        class="flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
      >
        <Download :size="24" />
      </button>
      <button
        @click="openCustomItemModal"
        title="Ajouter un article"
        class="flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
      >
        <Plus :size="24" />
      </button>
      <button
        @click="printInvoice"
        title="Imprimer"
        class="flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
      >
        <Printer :size="24" />
      </button>
      <button
        @click="downloadPDF"
        title="Télécharger PDF"
        class="flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
      >
        <FileText :size="24" />
      </button>
      <button
        @click="sendInvoice"
        title="Envoyer"
        class="flex items-center justify-center text-gray-700 hover:text-gray-900 transition"
      >
        <Send :size="24" />
      </button>
      <button
        @click="openEmailLogs"
        title="Historique des emails"
        class="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-full transition text-sm"
      >
        📋 Logs
      </button>
    </div>

    <!-- Printable Invoice -->
    <div class="invoice-content bg-white p-10 max-w-4xl mx-auto my-8 relative">
      <!-- Header -->
      <div
        class="flex justify-between items-center mb-8 pb-8 border-b-2 border-green-300"
      >
        <div>
          <h1 class="text-4xl font-bold text-gray-900">Facture</h1>
        </div>
        <div class="text-left">
          <!-- Print-only display -->
          <div class="print-only">
            <p class="text-gray-600">
              <span class="font-semibold w-12 inline-block">No:</span>
              {{ invoice.invoice_number }}
            </p>
            <p class="text-gray-600">
              <span class="font-semibold w-12 inline-block">Date:</span>
              {{ formatDate(invoice.date) }}
            </p>
          </div>

          <!-- Editable fields -->
          <div class="no-print space-y-2">
            <!-- Invoice Number Input -->
            <div>
              <label class="text-gray-600 text-sm font-semibold">No:</label>
              <input
                v-model="editableInvoiceNumber"
                type="text"
                placeholder="Numéro de facture"
                class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <!-- Invoice Date Input -->
            <div>
              <label class="text-gray-600 text-sm font-semibold">Date:</label>
              <input
                v-model="editableInvoiceDate"
                type="date"
                class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Client & Project Info (2-column) -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <!-- Bill To - Always Visible with Dropdowns -->
        <div class="space-y-0">
          <h3 class="text-sm font-bold text-gray-700 mb-2">Facturé à</h3>

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
              class="w-full px-3 py-2 border border-gray-300 rounded-full mb-2"
            >
              <option value="">-- Sélectionner un client --</option>
              <option v-for="c in availableClients" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Project Dropdown -->
          <div class="print-only" v-if="project?.name">
            <p class="text-gray-700 text-sm">
              <span class="font-semibold">Projet:</span> {{ project.name }}
            </p>
          </div>
          <div class="no-print">
            <select
              v-model="selectedProjectId"
              @change="onProjectChange"
              :disabled="!selectedClientId"
              class="w-full px-3 py-2 border border-gray-300 rounded-full mb-2"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-full mb-2"
            >
              <option value="">-- Sélectionner un contact --</option>
              <option v-for="c in availableContacts" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Client Details (Print only) -->
          <div class="print-only">
            <p v-if="client?.email" class="text-gray-600 text-sm">
              {{ client.email }}
            </p>
            <p v-if="client?.phone" class="text-gray-600 text-sm">
              {{ client.phone }}
            </p>
            <p v-if="client?.address" class="text-gray-600 text-sm">
              {{ client.address }}
            </p>
            <p v-if="client?.city" class="text-gray-600 text-sm">
              {{ client.city
              }}{{ client.province ? ", " + client.province : "" }}
              {{ client.postal_code || "" }}
            </p>
          </div>
        </div>

        <!-- From -->
        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-2">De</h3>
          <p class="text-gray-900 font-semibold">Benoit Martel</p>
          <p class="text-gray-600 text-sm">
            58 rue Varennes<br />Laval (Québec) H7M 1V6
          </p>
        </div>
      </div>

      <!-- Import Modal -->
      <div
        v-if="showImportModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        @mousedown.self="closeImportModal"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto no-print"
          @click.stop
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
              <label for="excludeInvoiced" class="text-gray-700 font-semibold">
                Exclure les heures déjà facturées
              </label>
            </div>

            <!-- Available Entries Preview -->
            <div
              v-if="availableTimeEntries.length > 0"
              class="bg-gray-50 p-4 rounded overflow-y-auto"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-gray-900">
                  {{ availableTimeEntries.length }} entrée(s) disponible(s)
                  <span class="text-blue-600 ml-2"
                    >({{ selectedEntryIds.size }} sélectionnée(s))</span
                  >
                </p>
                <label
                  class="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :checked="allEntriesSelected"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 w-4 h-4"
                  />
                  Tout sélectionner
                </label>
              </div>
              <div class="space-y-1">
                <label
                  v-for="entry in availableTimeEntries"
                  :key="entry.id"
                  class="flex items-start gap-3 text-sm text-gray-700 pb-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                >
                  <input
                    type="checkbox"
                    :checked="selectedEntryIds.has(entry.id)"
                    @change="toggleEntry(entry.id)"
                    class="mt-0.5 rounded border-gray-300 w-4 h-4 shrink-0"
                  />
                  <span>
                    <strong>{{ formatDate(entry.date) }}</strong> —
                    {{ getServiceName(entry.service_id) || "Sans service" }}
                    <span
                      v-if="getStepName(entry.step_id)"
                      class="text-blue-600"
                    >
                      — {{ getStepName(entry.step_id) }}</span
                    >
                    — <strong>{{ entry.hours }}h</strong>
                    <span
                      v-if="entry.description"
                      class="block text-gray-500"
                      >{{ entry.description }}</span
                    >
                  </span>
                </label>
              </div>
            </div>
            <div v-else class="bg-yellow-50 p-4 rounded text-yellow-800">
              Aucune entrée de temps disponible pour cette plage de dates.
            </div>
          </div>

          <div class="flex gap-4 mt-6">
            <button
              @click="importTimeEntries"
              :disabled="selectedEntryIds.size === 0"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
            >
              Ajouter à la facture ({{ selectedEntryIds.size }})
            </button>
            <button
              @click="closeImportModal"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div
        v-if="showEditItemModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        @mousedown.self="closeEditModal"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-96 overflow-y-auto no-print"
          @click.stop
        >
          <form @submit.prevent="updateInvoiceItem" class="space-y-4">
            <p v-if="loadingEditEntries" role="status" class="text-sm text-gray-600">Chargement des étapes…</p>
            <p v-if="editEntriesError" role="alert" class="text-sm text-red-600">{{ editEntriesError }}</p>
            <fieldset :disabled="savingItem || loadingEditEntries" class="space-y-4">
            <div v-if="editingTimeEntries.length" class="space-y-3">
              <p class="font-bold text-gray-700">Étapes des entrées de temps</p>
              <div v-for="entry in editingTimeEntries" :key="entry.id">
                <label :for="`entry-step-${entry.id}`" class="block text-sm text-gray-700 mb-1">
                  {{ formatDate(entry.date) }} — {{ entry.hours }}h
                  <span v-if="entry.description" class="block text-gray-500">{{ entry.description }}</span>
                </label>
                <select
                  :id="`entry-step-${entry.id}`"
                  v-model="editedEntrySteps[entry.id]"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="">Sans étape</option>
                  <option
                    v-for="step in editProjectSteps.filter((step) => step.project_id === entry.project_id)"
                    :key="step.id"
                    :value="step.id"
                  >{{ step.name }}</option>
                </select>
              </div>
              <p class="text-xs text-gray-500">Les changements seront aussi appliqués aux entrées dans la feuille de temps.</p>
            </div>
            <!-- Service Dropdown -->
            <div>
              <label class="block text-gray-700 font-bold mb-2">Service</label>
              <select
                v-model="editItemForm.service_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Sélectionner ou laisser vide --</option>
                <option
                  v-for="service in serviceStore.services"
                  :key="service.id"
                  :value="service.id"
                >
                  {{ service.name }}
                </option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Description</label
              >
              <textarea
                v-model="editItemForm.description"
                placeholder="Décrivez l'article..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                rows="3"
              ></textarea>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-gray-700 font-bold mb-2">Qté</label>
              <input
                v-model.number="editItemForm.quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <!-- Unit Price -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Prix unitaire ($)</label
              >
              <input
                v-model.number="editItemForm.unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <!-- Subtotal Display -->
            <div class="bg-blue-50 p-3 rounded">
              <p class="text-sm text-gray-600">Sous-total:</p>
              <p class="text-lg font-bold text-blue-600">
                {{
                  formatCurrency(
                    editItemForm.quantity * editItemForm.unit_price,
                  )
                }}
              </p>
            </div>

            <!-- Exempt Tax Checkbox -->
            <div class="flex items-center gap-2">
              <input
                id="editExemptTax"
                v-model="editItemForm.exempt_tax"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="editExemptTax" class="text-gray-700 font-semibold">
                Exemptée de taxe
              </label>
            </div>

            <!-- Form Buttons -->
            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                :disabled="!!editEntriesError"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
              >
                {{ savingItem ? "Enregistrement…" : "Enregistrer les modifications" }}
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Annuler
              </button>
            </div>
            </fieldset>
          </form>
        </div>
      </div>

      <!-- Custom Item Modal -->
      <div
        v-if="showCustomItemModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        @mousedown.self="closeCustomItemModal"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-96 overflow-y-auto no-print"
          @click.stop
        >
          <form @submit.prevent="addCustomItem" class="space-y-4">
            <!-- Service Dropdown -->
            <div>
              <label class="block text-gray-700 font-bold mb-2">Service</label>
              <select
                v-model="customItemForm.service_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
              >
                <option value="">-- Sélectionner ou laisser vide --</option>
                <option
                  v-for="service in serviceStore.services"
                  :key="service.id"
                  :value="service.id"
                >
                  {{ service.name }}
                </option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Description</label
              >
              <textarea
                v-model="customItemForm.description"
                placeholder="Décrivez l'article..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                rows="3"
                required
              ></textarea>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-gray-700 font-bold mb-2">Qté</label>
              <input
                v-model.number="customItemForm.quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                required
              />
            </div>

            <!-- Unit Price -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Prix unitaire ($)</label
              >
              <input
                v-model.number="customItemForm.unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                required
              />
            </div>

            <!-- Subtotal Display -->
            <div class="bg-orange-50 p-3 rounded">
              <p class="text-sm text-gray-600">Sous-total:</p>
              <p class="text-lg font-bold text-orange-600">
                {{
                  formatCurrency(
                    customItemForm.quantity * customItemForm.unit_price,
                  )
                }}
              </p>
            </div>

            <!-- Exempt Tax Checkbox -->
            <div class="flex items-center gap-2">
              <input
                id="customExemptTax"
                v-model="customItemForm.exempt_tax"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="customExemptTax" class="text-gray-700 font-semibold">
                Exempté de taxe
              </label>
            </div>

            <!-- Form Buttons -->
            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Ajouter l'article
              </button>
              <button
                type="button"
                @click="closeCustomItemModal"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Email Invoice Modal -->
      <div
        v-if="showEmailModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        @mousedown.self="showEmailModal = false"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl no-print max-h-[90vh] flex flex-col"
          @click.stop
        >
          <h3 class="text-2xl font-bold mb-6 text-gray-900">
            Envoyer la facture par courriel
          </h3>
          <form
            @submit.prevent="submitEmailInvoice"
            class="space-y-4 overflow-y-auto flex-1"
          >
            <!-- Recipients Dropdown Selection -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Ajouter des destinataires</label
              >
              <div class="flex gap-2">
                <select
                  @change="selectContact"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Sélectionner un contact --</option>
                  <option
                    v-for="contact in emailRecipientContacts"
                    :key="contact.id"
                    :value="contact.email"
                  >
                    {{ contact.name }} ({{ contact.email }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Custom Email Input -->
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Ou entrer une adresse personnalisée</label
              >
              <div class="flex gap-2">
                <input
                  v-model="emailForm.customRecipient"
                  type="email"
                  placeholder="exemple@email.com"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  @click="addRecipient"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <!-- Selected Recipients List -->
            <div
              v-if="emailForm.recipients.length > 0"
              class="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <label class="block text-gray-700 font-bold mb-2"
                >Destinataires ({{ emailForm.recipients.length }})</label
              >
              <div class="space-y-2">
                <div
                  v-for="(recipient, index) in emailForm.recipients"
                  :key="index"
                  class="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                >
                  <span class="text-gray-700">{{ recipient }}</span>
                  <button
                    type="button"
                    @click="removeRecipient(recipient)"
                    class="text-red-600 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-bold mb-2">Objet</label>
              <input
                v-model="emailForm.subject"
                type="text"
                placeholder="Facture #INV-001"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2">Message</label>
              <textarea
                v-model="emailForm.message"
                placeholder="Veuillez trouver ci-joint votre facture..."
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>
            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                :disabled="sendingEmail || emailForm.recipients.length === 0"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                {{ sendingEmail ? "Envoi en cours..." : "Envoyer" }}
              </button>
              <button
                type="button"
                @click="showEmailModal = false"
                :disabled="sendingEmail"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Email Logs Popup Modal -->
      <div
        v-if="showEmailLogs"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        @mousedown.self="showEmailLogs = false"
      >
        <div
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl no-print max-h-[90vh] flex flex-col"
          @click.stop
        >
          <h3 class="text-2xl font-bold mb-6 text-gray-900">
            Historique des emails envoyés
          </h3>
          <div class="flex-1 overflow-y-auto">
            <div
              v-if="emailLogs.length === 0"
              class="text-center py-8 text-gray-500"
            >
              Aucun email envoyé pour cette facture
            </div>
            <table v-else class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-200 border-b">
                  <th class="text-left py-3 px-4 font-bold">Date/Heure</th>
                  <th class="text-left py-3 px-4 font-bold">Destinataire</th>
                  <th class="text-left py-3 px-4 font-bold">Objet</th>
                  <th class="text-left py-3 px-4 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in emailLogs"
                  :key="log.id"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="py-3 px-4">{{ formatDateTime(log.sent_at) }}</td>
                  <td class="py-3 px-4">{{ log.recipient }}</td>
                  <td class="py-3 px-4">{{ log.subject }}</td>
                  <td class="py-3 px-4">
                    <span
                      :class="{
                        'bg-green-100 text-green-800': log.success,
                        'bg-red-100 text-red-800': !log.success,
                      }"
                      class="px-2 py-1 rounded text-xs font-bold"
                    >
                      {{ log.success ? "✓ Succès" : "✗ Erreur" }}
                    </span>
                    <div
                      v-if="log.error_message"
                      class="text-red-600 text-xs mt-1"
                    >
                      {{ log.error_message }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex gap-4 mt-6">
            <button
              @click="showEmailLogs = false"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Fermer
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
                Services/Produits
              </th>
              <th
                class="text-center py-3 px-4 min-w-[100px] font-bold text-gray-900"
              >
                Prix un.
              </th>
              <th class="text-center py-3 px-4 font-bold text-gray-900">Qté</th>
              <th class="text-center py-3 px-4 font-bold text-gray-900">TPS</th>
              <th class="text-center py-3 px-4 font-bold text-gray-900">TVQ</th>
              <th
                v-if="hasAnyTaxExemptItems"
                class="text-center py-3 px-4 font-bold text-gray-900"
              >
                Taxes
              </th>
              <th class="text-right py-3 px-4 font-bold text-gray-900">
                Sous-total
              </th>
              <th
                class="text-center py-3 px-4 font-bold text-gray-900 no-print"
              >
                <!-- Delete column header -->
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="group in itemsDisplayForTable"
              :key="group.id ?? 'no-step'"
            >
              <tr class="bg-gray-100 border-b border-gray-200">
                <th :colspan="hasAnyTaxExemptItems ? 7 : 6" scope="rowgroup" class="invoice-step-header text-left py-3 px-4 font-bold text-gray-900">
                  {{ group.id ? group.name : "" }}
                </th>
                <td class="no-print"></td>
              </tr>
              <!-- Service Items -->
              <template v-for="item in group.items" :key="item.id">
              <tr
                @click="openEditModal(item)"
                class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition group relative"
              >
                <td class="py-3 px-4 text-gray-900 font-semibold">
                  <div class="flex items-start">
                  <span class="no-print w-14 shrink-0">
                  <button
                    v-if="item.sourceIds.length > 1"
                    type="button"
                    class="no-print inline-flex align-middle mr-2 p-1 rounded text-blue-600 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2"
                    :aria-expanded="expandedItemIds.has(item.id)"
                    :aria-controls="`invoice-entries-${item.id}`"
                    :aria-label="`${expandedItemIds.has(item.id) ? 'Masquer' : 'Afficher'} les ${item.sourceIds.length} entrées regroupées`"
                    :title="`${item.sourceIds.length} entrées regroupées`"
                    @click.stop="toggleExpandedItem(item.id)"
                  >
                    <span class="text-xs font-medium whitespace-nowrap" aria-hidden="true">
                      {{ item.sourceIds.length }} {{ expandedItemIds.has(item.id) ? "▼" : "▶" }}
                    </span>
                  </button>
                  </span>
                  <div class="min-w-0">
                  {{ getServiceName(item.service_id) || "Sans service" }}
                  <p v-if="item.description" class="invoice-item-description text-xs font-normal text-gray-600 mt-1 whitespace-pre-line">{{ item.description }}</p>
                  </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-center text-gray-900">
                  {{ formatCurrency(item.unit_price) }}
                </td>
                <td class="py-3 px-4 text-center text-gray-900">
                  {{
                    parseFloat(item.quantity.toFixed(2)) % 1 === 0
                      ? Math.floor(item.quantity)
                      : item.quantity.toFixed(2)
                  }}
                </td>
                <td class="min-w-[72px] py-3 px-4 text-center text-gray-900">
                  <span v-if="!item.exempt_tax">
                    {{ formatCurrency(item.subtotal * 0.05) }}
                  </span>
                  <span v-else class="text-orange-600">-</span>
                </td>
                <td class="min-w-[72px] py-3 px-4 text-center text-gray-900">
                  <span v-if="!item.exempt_tax">
                    {{ formatCurrency(item.subtotal * 0.09975) }}
                  </span>
                  <span v-else class="text-orange-600">-</span>
                </td>
                <td v-if="hasAnyTaxExemptItems" class="py-3 px-4 text-center">
                  <span
                    v-if="item.exempt_tax"
                    class="text-sm font-semibold text-orange-600"
                  >
                    N/D
                  </span>
                </td>
                <td class="py-3 px-4 text-right text-gray-900">
                  {{ formatCurrency(item.subtotal) }}
                </td>
                <!-- Delete Button -->
                <td class="relative no-print">
                  <button
                    @click.stop="deleteInvoiceItem(item)"
                    class="text-red-600 hover:text-red-800 transition"
                    title="Supprimer cet article"
                  >
                    <X :size="20" />
                  </button>
                </td>
              </tr>
              <tr
                v-if="item.sourceIds.length > 1 && expandedItemIds.has(item.id)"
                :id="`invoice-entries-${item.id}`"
                class="no-print bg-blue-50 border-b border-blue-100"
              >
                <td :colspan="hasAnyTaxExemptItems ? 8 : 7" class="px-4 py-3">
                  <p class="text-xs text-gray-600 mb-2 ml-6">Entrées regroupées — cliquez sur une entrée pour la modifier.</p>
                  <div class="space-y-1 ml-6">
                    <button
                      v-for="source in getSourceItems(item)"
                      :key="source.id"
                      type="button"
                      class="w-full flex items-center justify-between gap-4 rounded border border-blue-100 bg-white px-3 py-2 text-left text-sm hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                      @click.stop="openEditModal(source)"
                    >
                      <span>
                        <span class="font-semibold">{{ getServiceName(source.service_id) || "Sans service" }}</span>
                        <span v-if="getItemEntry(source)" class="block text-xs text-gray-500">
                          {{ formatDate(getItemEntry(source)!.date) }}
                          — {{ getStepName(getItemEntry(source)!.step_id) || "Sans étape" }}
                        </span>
                        <span v-if="source.description" class="block text-xs text-gray-600 whitespace-pre-line">{{ source.description }}</span>
                      </span>
                      <span class="shrink-0 text-right">
                        <span class="block">{{ source.quantity }} × {{ formatCurrency(source.unit_price) }}</span>
                        <span class="block font-semibold">{{ formatCurrency(source.subtotal) }}</span>
                        <span class="block text-xs text-blue-600">Modifier</span>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
              </template>
            </template>
          </tbody>
          <tfoot>
            <!-- Taxable Subtotal Row -->
            <tr class="border-t-2 border-gray-300">
              <td
                :colspan="hasAnyTaxExemptItems ? 6 : 5"
                class="text-right font-bold text-gray-900 py-3 px-4"
              >
                Sous-total:
              </td>
              <td class="text-right font-bold text-gray-900 py-3 px-4 w-32">
                {{ formatCurrency(taxableSubtotal) }}
              </td>
              <td class="no-print"></td>
            </tr>

            <!-- TPS Row -->
            <tr class="border-b border-t border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 6 : 5"
                class="text-right font-semibold text-gray-900 py-3 px-4"
              >
                <div class="flex justify-end">
                  <div>TPS (5%)</div>
                  <div class="ml-2 text-xs font-normal text-gray-600">
                    14374 6444 RT 0001
                  </div>
                </div>
              </td>
              <td class="text-right text-gray-900 py-3 px-4">
                {{ formatCurrency(tpsAmount) }}
              </td>
              <td class="no-print"></td>
            </tr>

            <!-- TVQ Row -->
            <tr class="border-b border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 6 : 5"
                class="text-right font-semibold text-gray-900 py-3 px-4"
              >
                <div class="flex justify-end">
                  <div>TVQ (9.975%)</div>
                  <div class="ml-2 text-xs font-normal text-gray-600">
                    10 2434 3363 TQ 0002
                  </div>
                </div>
              </td>
              <td class="text-right text-gray-900 py-3 px-4">
                {{ formatCurrency(tvqAmount) }}
              </td>
              <td class="no-print"></td>
            </tr>

            <!-- Tax-Exempt Subtotal Row -->
            <tr v-if="taxExemptSubtotal > 0" class="border-b border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 6 : 5"
                class="text-right font-bold text-gray-900 py-3 px-4"
              >
                Sous-total (articles exonérés):
              </td>
              <td class="text-right font-bold text-gray-900 py-3 px-4">
                {{ formatCurrency(taxExemptSubtotal) }}
              </td>
              <td class="no-print"></td>
            </tr>

            <!-- Grand Total Row -->
            <tr class="border-t-2 border-green-300">
              <td
                :colspan="hasAnyTaxExemptItems ? 6 : 5"
                class="text-right text-lg font-bold text-gray-900 py-3 px-4"
              >
                TOTAL:
              </td>
              <td class="text-right text-lg font-bold text-gray-900 py-3 px-4">
                {{ formatCurrency(grandTotal) }}
              </td>
              <td class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- Footer -->
      <div
        class="invoice-footer border-t pt-8 text-center text-gray-600 text-sm w-full"
      >
        <p>Merci de votre confiance!</p>
      </div>
    </div>
  </div>
  </PageLoad>
</template>

<script setup lang="ts">
import { groupInvoiceItems, type InvoiceDisplayItem } from "../utils/invoiceDisplay";
import PageLoad from "../components/PageLoad.vue";
import { usePageLoad } from "../composables/usePageLoad";
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { X, Download, Plus, Printer, Send, FileText } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { useServiceStore } from "../stores/serviceStore";
import { useProjectStepStore } from "../stores/projectStepStore";
import type { Invoice, InvoiceItem, ProjectStep } from "../types";
import { SupabaseService } from "../services/supabase";
import html2pdf from "html2pdf.js";

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const clientStore = useClientStore();
const contactStore = useContactStore();
const timeEntryStore = useTimeEntryStore();
const serviceStore = useServiceStore();
const projectStepStore = useProjectStepStore();

const invoice = ref<Invoice | null>(null);
const invoiceItems = ref<InvoiceItem[]>([]);
const expandedItemIds = ref(new Set<string>());
const toggleExpandedItem = (id: string) => {
  const expanded = new Set(expandedItemIds.value);
  if (expanded.has(id)) expanded.delete(id);
  else expanded.add(id);
  expandedItemIds.value = expanded;
};
const getSourceItems = (item: InvoiceDisplayItem): InvoiceDisplayItem[] => {
  const ids = new Set(item.sourceIds);
  return invoiceItems.value
    .filter((source) => ids.has(source.id))
    .map((source) => ({ ...source, sourceIds: [source.id] }));
};
const getItemEntry = (item: InvoiceItem) => item.time_entry_id
  ? timeEntryStore.getTimeEntryById(item.time_entry_id)
  : undefined;
const selectedClientId = ref<string>("");
const selectedProjectId = ref<string>("");
const selectedContactId = ref<string>("");

// Editable invoice fields
const editableInvoiceNumber = ref<string>("");
const editableInvoiceDate = ref<string>("");

// Import Modal refs
const showImportModal = ref(false);
const selectedEntryIds = ref<Set<string>>(new Set());

const allEntriesSelected = computed(
  () =>
    availableTimeEntries.value.length > 0 &&
    availableTimeEntries.value.every((e) => selectedEntryIds.value.has(e.id)),
);

const toggleSelectAll = () => {
  if (allEntriesSelected.value) {
    selectedEntryIds.value = new Set();
  } else {
    selectedEntryIds.value = new Set(
      availableTimeEntries.value.map((e) => e.id),
    );
  }
};

const toggleEntry = (id: string) => {
  const next = new Set(selectedEntryIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedEntryIds.value = next;
};
const importForm = ref({
  startDate: "",
  endDate: "",
  importAll: false,
  excludeInvoiced: true,
});

// Custom Item Modal refs
const showCustomItemModal = ref(false);
const customItemForm = ref({
  service_id: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  exempt_tax: false,
});

// Edit Item Modal refs
const showEditItemModal = ref(false);
const editingItemId = ref<string | null>(null);
const savingItem = ref(false);
const loadingEditEntries = ref(false);
const editEntriesError = ref("");
const editProjectSteps = ref<ProjectStep[]>([]);
const editedEntrySteps = ref<Record<string, string>>({});
const editItemForm = ref({
  service_id: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  exempt_tax: false,
});

// Email Modal refs
const showEmailModal = ref(false);
const sendingEmail = ref(false);
const emailRecipientContacts = ref<any[]>([]);
const showEmailLogs = ref(false);
const emailLogs = ref<any[]>([]);
const emailForm = ref({
  recipients: [] as string[],
  customRecipient: "",
  subject: "",
  message: "Veuillez trouver ci-joint votre facture.",
});

// Format currency in Quebec/Canadian French format (140,60 $)
const formatCurrency = (amount: number): string => {
  const formatted = amount.toFixed(2);
  const [whole, decimal] = formatted.split(".");
  const withThousands = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withThousands},${decimal} $`;
};

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
  const clientsWithActiveProjects = new Set(
    projectStore.projects
      .filter((p) => p.status === "active")
      .map((p) => p.client_id),
  );
  return clientStore.clients.filter((c) => clientsWithActiveProjects.has(c.id));
});

const availableProjects = computed(() => {
  if (!selectedClientId.value) return [];
  return projectStore.projects.filter(
    (p) => p.client_id === selectedClientId.value && p.status === "active",
  );
});

const availableContacts = computed(() => {
  if (!selectedClientId.value) return [];
  return contactStore.getContactsByClientId(selectedClientId.value);
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

const taxableSubtotal = computed(() => {
  return invoiceItems.value
    .filter((item) => !item.exempt_tax)
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const hasAnyTaxExemptItems = computed(() => {
  return invoiceItems.value.some((item) => item.exempt_tax);
});

const taxExemptSubtotal = computed(() => {
  return invoiceItems.value
    .filter((item) => item.exempt_tax)
    .reduce((sum, item) => sum + item.subtotal, 0);
});

const tpsAmount = computed(() => {
  return taxableSubtotal.value * 0.05; // 5% TPS
});

const tvqAmount = computed(() => {
  return taxableSubtotal.value * 0.09975; // 9.975% TVQ
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

const itemsDisplayForTable = computed(() =>
  groupInvoiceItems(invoiceItems.value, (item) => {
    const entry = item.time_entry_id
      ? timeEntryStore.getTimeEntryById(item.time_entry_id)
      : null;
    const stepId = entry?.step_id || null;
    // Older imports stored the service name when the entry had no description.
    const legacyFallback = entry && !entry.description?.trim()
      && item.description === getServiceName(item.service_id);
    return {
      stepId,
      stepName: getStepName(stepId) || "Sans étape",
      description: legacyFallback ? "" : (item.description || "").trim(),
    };
  }),
);

const { pageLoading, pageError, reloadPage } = usePageLoad(async () => {
  const invoiceId = route.params.id as string;
  if (!invoiceId) {
    router.push("/invoices");
    return;
  }

  // Fetch invoice
  try {
    invoice.value = await SupabaseService.getInvoice(invoiceId);

    // Initialize editable fields
    if (invoice.value) {
      editableInvoiceNumber.value = invoice.value.invoice_number;
      editableInvoiceDate.value = invoice.value.date;
    }

    // Fetch project and client data
    if (invoice.value.project_id) {
      await projectStore.fetchProjects();
      if (projectStore.error) throw new Error(projectStore.error);
      await clientStore.fetchClients();
      if (clientStore.error) throw new Error(clientStore.error);

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
        if (contactStore.error) throw new Error(contactStore.error);
      }

      // Fetch invoice items from the database
      invoiceItems.value = await SupabaseService.getInvoiceItems(invoiceId);

      // Fetch services for dropdown/display
      await serviceStore.fetchServices();
      if (serviceStore.error) throw new Error(serviceStore.error);

      // Fetch time entries for import functionality
      await timeEntryStore.fetchTimeEntries();
      if (timeEntryStore.error) throw new Error(timeEntryStore.error);
      await timeEntryStore.fetchTimeEntriesByIds(
        invoiceItems.value.flatMap((item) => item.time_entry_id ? [item.time_entry_id] : []),
      );
      // Fetch project steps
      await projectStepStore.fetchSteps(invoice.value.project_id);
      if (projectStepStore.error) throw new Error(projectStepStore.error);
      console.log(invoiceItems.value);
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la facture:", error);
    throw error;
  }
});

const formatDate = (date: string) => {
  const [year, month, day] = date.substring(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (datetime: string) => {
  return new Date(datetime).toLocaleString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const printInvoice = () => {
  window.print();
};

// Helper function to generate PDF with consistent settings
const generateInvoicePDF = async (): Promise<string> => {
  const invoiceContent = document.querySelector(".invoice-content");
  if (!invoiceContent) {
    throw new Error("Invoice content not found");
  }

  // Export a separate copy without action cells. Hidden table cells can
  // otherwise leave layout artifacts in the canvas/PDF renderer.
  const pdfContent = invoiceContent.cloneNode(true) as HTMLElement;
  pdfContent.querySelectorAll(".no-print").forEach((element) => element.remove());
  pdfContent.querySelectorAll<HTMLElement>(".invoice-step-header").forEach((element) => {
    element.style.paddingTop = "16px";
    element.style.paddingBottom = "16px";
  });
  pdfContent.querySelectorAll<HTMLElement>(".print-only").forEach((element) => {
    element.style.display = "block";
  });

  // Common PDF options
  const options = {
    margin: 0,
    filename: `Benoit-Martel-facture-${invoice.value!.invoice_number}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scrollY: 0,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: { orientation: "portrait", unit: "in", format: "letter" },
  };

  const pdfDataUrl: string = await html2pdf()
    .set(options)
    .from(pdfContent)
    .outputPdf("dataurlstring");
  return pdfDataUrl.split(",")[1];
};

const downloadPDF = async () => {
  if (!invoice.value) return;

  try {
    const pdfBase64 = await generateInvoicePDF();

    // Convert base64 to blob and download
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Benoit-Martel-facture-${invoice.value.invoice_number}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF:", error);
    alert("Erreur lors du téléchargement du PDF: " + (error as Error).message);
  }
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
  if (!selectedClientId.value) {
    selectedProjectId.value = "";
    selectedContactId.value = "";
    return;
  }

  try {
    // Fetch contacts for the new client
    await contactStore.fetchContacts(selectedClientId.value);

    // Reset project and contact - user will select them
    selectedProjectId.value = "";
    selectedContactId.value = "";
  } catch (error) {
    console.error("Erreur lors du chargement des contacts:", error);
  }
};

const onProjectChange = async () => {
  // Reset contact when project changes
  selectedContactId.value = "";
  if (selectedProjectId.value) {
    await projectStepStore.fetchSteps(selectedProjectId.value);
  }
};

const onContactChange = async () => {
  // No automatic save - user will click Save button
};

const saveChanges = async () => {
  if (!invoice.value || !selectedProjectId.value) {
    alert("Veuillez sélectionner un client et un projet");
    return;
  }

  try {
    console.log("Saving invoice changes...");

    // Prepare update data
    const updateData: any = {
      project_id: selectedProjectId.value,
    };

    // Add invoice number if changed
    if (editableInvoiceNumber.value !== invoice.value.invoice_number) {
      updateData.invoice_number = editableInvoiceNumber.value;
    }

    // Add date if changed
    if (editableInvoiceDate.value !== invoice.value.date) {
      updateData.date = editableInvoiceDate.value;
    }

    // Update invoice with all changes
    await SupabaseService.updateInvoice(invoice.value.id, updateData);
    invoice.value.project_id = selectedProjectId.value;
    invoice.value.invoice_number = editableInvoiceNumber.value;
    invoice.value.date = editableInvoiceDate.value;

    // Update project with new contact_id if selected
    if (selectedContactId.value) {
      await SupabaseService.updateProject(selectedProjectId.value, {
        contact_id: selectedContactId.value,
      });
    }

    expandedItemIds.value = new Set();
    console.log("Invoice saved successfully");
    alert("Changements sauvegardés avec succès!");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
  }
};

// Import Modal functions
const openImportModal = () => {
  // Reset form to defaults
  importForm.value = {
    startDate: "",
    endDate: "",
    importAll: false,
    excludeInvoiced: true,
  };
  selectedEntryIds.value = new Set();
  showImportModal.value = true;
};

const closeImportModal = () => {
  showImportModal.value = false;
};

// Custom Item Modal functions
const openCustomItemModal = () => {
  // Reset form
  customItemForm.value = {
    service_id: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    exempt_tax: false,
  };
  showCustomItemModal.value = true;
};

const closeCustomItemModal = () => {
  showCustomItemModal.value = false;
};

// Edit Item Modal functions
const editingSourceIds = ref<string[]>([]);
const editingTimeEntries = computed(() => {
  const entryIds = new Set(invoiceItems.value
    .filter((item) => editingSourceIds.value.includes(item.id))
    .map((item) => item.time_entry_id));
  return timeEntryStore.entries.filter((entry) => entryIds.has(entry.id));
});

const openEditModal = async (item: InvoiceDisplayItem) => {
  if (loadingEditEntries.value || savingItem.value) return;
  editingItemId.value = item.id;
  editingSourceIds.value = [...item.sourceIds];
  editedEntrySteps.value = Object.fromEntries(
    editingTimeEntries.value.map((entry) => [entry.id, entry.step_id || ""]),
  );
  const actualItem = item;
  editItemForm.value = {
    service_id: actualItem.service_id || "",
    description: actualItem.description,
    quantity: item.quantity, // merged quantity for display only
    unit_price: actualItem.unit_price,
    exempt_tax: actualItem.exempt_tax || false,
  };
  showEditItemModal.value = true;
  loadingEditEntries.value = true;
  editEntriesError.value = "";
  editProjectSteps.value = [];
  try {
    const entryIds = invoiceItems.value
      .filter((source) => item.sourceIds.includes(source.id))
      .flatMap((source) => source.time_entry_id ? [source.time_entry_id] : []);
    const entries = await timeEntryStore.fetchTimeEntriesByIds(entryIds);
    if (entries.length !== new Set(entryIds).size) {
      throw new Error("Une entrée de temps liée est introuvable.");
    }
    const projectIds = [...new Set(entries.map((entry) => entry.project_id))];
    editProjectSteps.value = (await Promise.all(
      projectIds.map((id) => SupabaseService.getProjectSteps(id)),
    )).flat();
    editedEntrySteps.value = Object.fromEntries(
      entries.map((entry) => [entry.id, entry.step_id || ""]),
    );
  } catch {
    editEntriesError.value = "Impossible de charger les entrées et leurs étapes. Fermez puis rouvrez cet article pour réessayer.";
  } finally {
    loadingEditEntries.value = false;
  }
};

const closeEditModal = () => {
  if (savingItem.value || loadingEditEntries.value) return;
  showEditItemModal.value = false;
  editingItemId.value = null;
  editingSourceIds.value = [];
  editedEntrySteps.value = {};
};

const updateInvoiceItem = async () => {
  if (savingItem.value || loadingEditEntries.value || editEntriesError.value) return;
  if (!editingItemId.value) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }

  savingItem.value = true;
  try {
    const stepChanges = editingTimeEntries.value
      .filter((entry) => (entry.step_id || "") !== editedEntrySteps.value[entry.id])
      .map((entry) => ({ entry, stepId: editedEntrySteps.value[entry.id] || null }));
    for (const { entry, stepId } of stepChanges) {
      if (stepId && !editProjectSteps.value.some((step) => step.project_id === entry.project_id && step.id === stepId)) {
        throw new Error("L'étape doit appartenir au projet de l'entrée de temps.");
      }
    }
    const siblingItems = invoiceItems.value.filter((item) =>
      editingSourceIds.value.includes(item.id),
    );
    const originalQuantity = siblingItems.reduce((sum, item) => sum + item.quantity, 0);
    let remainingQuantity = editItemForm.value.quantity;
    for (const [index, sibling] of siblingItems.entries()) {
      // Distribute the displayed total without counting merged hours twice.
      const quantity = index === siblingItems.length - 1
        ? remainingQuantity
        : originalQuantity > 0
          ? editItemForm.value.quantity * sibling.quantity / originalQuantity
          : editItemForm.value.quantity / siblingItems.length;
      remainingQuantity -= quantity;
      const subtotal = quantity * editItemForm.value.unit_price;
      const updateData = {
        service_id: editItemForm.value.service_id || null,
        description: editItemForm.value.description,
        quantity,
        unit_price: editItemForm.value.unit_price,
        subtotal,
        line_total: subtotal,
        exempt_tax: editItemForm.value.exempt_tax,
      };

      await SupabaseService.updateInvoiceItem(sibling.id, updateData);

      const idx = invoiceItems.value.findIndex((i) => i.id === sibling.id);
      if (idx !== -1) {
        invoiceItems.value[idx] = { ...invoiceItems.value[idx], ...updateData };
      }
    }

    for (const { entry, stepId } of stepChanges) {
      await timeEntryStore.updateTimeEntry(entry.id, { step_id: stepId });
    }

    alert(
      siblingItems.length > 1
        ? `Article modifié — taux appliqué aux ${siblingItems.length} entrées du groupe.`
        : "Article modifié avec succès!",
    );
    savingItem.value = false;
    expandedItemIds.value = new Set();
    closeEditModal();
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    alert("Erreur lors de la modification de l'article");
  } finally {
    savingItem.value = false;
  }
};

const addCustomItem = async () => {
  if (!invoice.value || !customItemForm.value.description) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }

  try {
    const subtotal =
      customItemForm.value.quantity * customItemForm.value.unit_price;

    const itemData = {
      invoice_id: invoice.value.id,
      time_entry_id: null,
      description: customItemForm.value.description,
      quantity: customItemForm.value.quantity,
      unit_price: customItemForm.value.unit_price,
      subtotal: subtotal,
      service_id: customItemForm.value.service_id || null,
      tax_1_amount: 0,
      tax_2_amount: 0,
      discount_amount: 0,
      line_total: subtotal,
      exempt_tax: customItemForm.value.exempt_tax,
    };

    // Save to database
    const savedItem = await SupabaseService.createInvoiceItem(itemData);
    invoiceItems.value.push(savedItem);

    alert("Article ajouté avec succès!");
    closeCustomItemModal();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article:", error);
    alert("Erreur lors de l'ajout de l'article");
  }
};

const getServiceName = (
  serviceId: string | null | undefined,
): string | null => {
  if (!serviceId) return null;
  const service = serviceStore.services.find((s) => s.id === serviceId);
  return service ? service.name : null;
};

const getStepName = (stepId?: string | null): string | null => {
  if (!stepId) return null;
  return projectStepStore.getStepById(stepId)?.name || null;
};

const importTimeEntries = async () => {
  if (selectedEntryIds.value.size === 0 || !invoice.value) return;

  const entriesToImport = availableTimeEntries.value.filter((e) =>
    selectedEntryIds.value.has(e.id),
  );

  try {
    // Fetch the hourly rate for the project
    const hourlyRate = project.value?.hourly_rate || 0;

    // Create invoice items from selected entries, fetching fresh data to ensure service_id is included
    for (const entry of entriesToImport) {
      // Get fresh entry data to ensure all fields including service_id are present
      const freshEntry = timeEntryStore.getTimeEntryById(entry.id);
      const subtotal = entry.hours * hourlyRate;

      // Create item without id - let Supabase generate it
      const itemData = {
        invoice_id: invoice.value.id,
        time_entry_id: entry.id || null,
        description:
          freshEntry?.description ?? entry.description ?? "",
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
      `${entriesToImport.length} entrée(s) de temps importée(s) avec succès!`,
    );
    closeImportModal();
  } catch (error) {
    console.error("Erreur lors de l'import des heures:", error);
    alert("Erreur lors de l'import des heures");
  }
};

const deleteInvoiceItem = async (row: InvoiceDisplayItem) => {
  if (!row.sourceIds.length) return;

  if (!confirm("Êtes-vous sûr de vouloir supprimer cet article?")) {
    return;
  }

  try {
    for (const itemId of row.sourceIds) {
      await SupabaseService.deleteInvoiceItem(itemId);
      invoiceItems.value = invoiceItems.value.filter((item) => item.id !== itemId);
    }
    alert("Article supprimé avec succès!");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Erreur lors de la suppression de l'article");
  }
};

const sendInvoice = async () => {
  if (!invoice.value) return;

  // Ensure client is available
  if (!client.value) {
    alert("Veuillez sélectionner un client pour cette facture");
    return;
  }

  // Fetch contacts for the client
  try {
    emailRecipientContacts.value = await SupabaseService.getContacts(
      client.value.id,
    );
    console.log("Fetched contacts:", emailRecipientContacts.value);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    emailRecipientContacts.value = [];
  }

  // Pre-fill email form with the contact associated to the invoice
  const recipients: string[] = [];

  // Use the invoice's associated contact email as the primary recipient
  if (contact.value?.email && contact.value.email.trim()) {
    recipients.push(contact.value.email);
  } else if (client.value.email && client.value.email.trim()) {
    // Fall back to client email if no contact is set
    recipients.push(client.value.email);
  }

  console.log("Initialized recipients:", recipients);

  emailForm.value.recipients = recipients;
  emailForm.value.customRecipient = "";
  emailForm.value.subject = `Projet ${project.value?.name || ""} - Facture #${invoice.value.invoice_number} de Benoit Martel`;
  emailForm.value.message = "Bonjour! Veuillez trouver ci-joint votre facture.";

  showEmailModal.value = true;
};

const addRecipient = () => {
  if (!emailForm.value.customRecipient) {
    alert("Veuillez entrer une adresse email");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailForm.value.customRecipient)) {
    alert("Veuillez entrer une adresse email valide");
    return;
  }

  // Add if not already in list
  if (!emailForm.value.recipients.includes(emailForm.value.customRecipient)) {
    emailForm.value.recipients.push(emailForm.value.customRecipient);
  }
  emailForm.value.customRecipient = "";
};

const removeRecipient = (email: string) => {
  emailForm.value.recipients = emailForm.value.recipients.filter(
    (r) => r !== email,
  );
};

const selectContact = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const email = target.value;
  if (email && !emailForm.value.recipients.includes(email)) {
    emailForm.value.recipients.push(email);
  }
  target.value = ""; // Reset dropdown
};

const openEmailLogs = async () => {
  if (!invoice.value) return;

  try {
    emailLogs.value = await SupabaseService.getEmailLogs(invoice.value.id);
    showEmailLogs.value = true;
  } catch (error) {
    console.error("Erreur lors du chargement des logs:", error);
    alert("Erreur lors du chargement des logs d'emails");
  }
};

const submitEmailInvoice = async () => {
  console.log("Submit Email Invoice called");
  console.log("Current emailForm.value:", emailForm.value);

  if (!invoice.value) {
    alert("Invoice non trouvée");
    return;
  }

  if (!emailForm.value.recipients || emailForm.value.recipients.length === 0) {
    alert("Veuillez sélectionner au moins une adresse email");
    return;
  }

  sendingEmail.value = true;

  try {
    // Generate PDF using the helper function
    const pdfBase64 = await generateInvoicePDF();
    console.log("PDF Generated:", {
      hasPdfBase64: !!pdfBase64,
      length: pdfBase64 ? pdfBase64.length : 0,
      preview: pdfBase64 ? pdfBase64.substring(0, 50) : "N/A",
    });

    const emailData = {
      invoiceId: invoice.value.id,
      recipient: emailForm.value.recipients,
      subject: emailForm.value.subject,
      message: emailForm.value.message,
      invoiceNumber: invoice.value.invoice_number,
      pdfBase64: pdfBase64,
    };

    console.log("About to send email with data:", {
      invoiceId: emailData.invoiceId,
      recipient: emailData.recipient,
      recipientType: typeof emailData.recipient,
      isArray: Array.isArray(emailData.recipient),
      subject: emailData.subject,
      message: emailData.message,
      invoiceNumber: emailData.invoiceNumber,
      hasPdf: !!emailData.pdfBase64,
    });

    // Send the email via Supabase Edge Function with PDF attachment
    const result = await SupabaseService.sendInvoiceEmail(emailData);

    // Save email logs for each recipient
    for (const recipient of emailForm.value.recipients) {
      await SupabaseService.saveEmailLog({
        invoice_id: invoice.value.id,
        recipient: recipient,
        subject: emailForm.value.subject,
        message: emailForm.value.message,
        sent_at: new Date().toISOString(),
        success: result.success,
        error_message: result.success ? null : result.message,
      });
    }

    // Update invoice status to "sent"
    await SupabaseService.updateInvoice(invoice.value.id, {
      status: "sent",
    });
    invoice.value.status = "sent";

    showEmailModal.value = false;
    emailForm.value = {
      recipients: [],
      customRecipient: "",
      subject: "",
      message: "Veuillez trouver ci-joint votre facture.",
    };

    // Refresh email logs
    await openEmailLogs();

    alert("Facture envoyée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);

    // Save failed email logs for each recipient
    if (invoice.value && emailForm.value.recipients.length > 0) {
      for (const recipient of emailForm.value.recipients) {
        try {
          await SupabaseService.saveEmailLog({
            invoice_id: invoice.value.id,
            recipient: recipient,
            subject: emailForm.value.subject,
            message: emailForm.value.message,
            sent_at: new Date().toISOString(),
            success: false,
            error_message: (error as Error).message,
          });
        } catch (logError) {
          console.error("Erreur lors de la sauvegarde du log:", logError);
        }
      }
    }

    alert("Erreur lors de l'envoi de la facture: " + (error as Error).message);
  } finally {
    sendingEmail.value = false;
  }
};
</script>

<style scoped>
.invoice-content {
  font-size: 0.9rem;
}

.invoice-content h1 {
  font-size: 2.25rem;
}

.invoice-content h3 {
  font-size: 0.75rem;
}

.invoice-content p {
  font-size: 0.8rem;
}

.invoice-content td {
  font-size: 0.75rem;
  p {
    display: flex;
    align-items: center;
    height: 100%;
  }
}

.invoice-content .invoice-item-description {
  font-size: 0.75rem;
  line-height: 1.4;
}

.invoice-content th {
  font-size: 0.75rem;
}

.print-only {
  display: none;
}

.no-print {
  /* display: block; */
}

.invoice-content {
  width: 8.5in;
  height: auto;
  margin: 0 !important;
}
.invoice-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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

  #app > header {
    display: none !important;
  }

  @page {
    size: letter;
    margin: 0;
  }

  /* Hide all modals and overlays */
  [role="dialog"],
  .modal,
  [class*="modal"] {
    display: none !important;
  }

  /* Hide all buttons */
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

  .invoice-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    background: white;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 8.5in;
  }

  .invoice-content {
    max-width: 100%;
    margin: 0;
    padding: 0.4in !important;
    background: white;
    width: 8.5in;
    height: auto;
    overflow: visible;
  }

  table {
    font-size: 0.9em;
    width: 100%;
  }

  th,
  td {
    padding: 0.15em 0.25em;
  }

  .invoice-step-header {
    padding-top: 16px;
    padding-bottom: 16px;
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
    gap: 1rem !important;
  }

  /* Footer styling for print */
  .invoice-footer {
    break-inside: avoid;
    width: 100%;
    margin: 0 !important;
    padding: 0.2in 0.4in !important;
    text-align: center;
    font-size: 0.85em;
  }
}
</style>
