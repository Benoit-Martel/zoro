<template>
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
          <p class="text-gray-600">
            <span class="font-semibold w-12 inline-block">No:</span>
            {{ invoice.invoice_number }}
          </p>
          <p class="text-gray-600">
            <span class="font-semibold w-12 inline-block">Date:</span>
            {{ formatDate(invoice.date) }}
          </p>
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
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto no-print"
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
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
            >
              Ajouter à la facture
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
                required
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
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Annuler
              </button>
            </div>
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
          class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md no-print"
          @click.stop
        >
          <h3 class="text-2xl font-bold mb-6 text-gray-900">
            Envoyer la facture par courriel
          </h3>
          <form @submit.prevent="submitEmailInvoice" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-bold mb-2"
                >Destinataire</label
              >
              <input
                v-model="emailForm.recipient"
                type="email"
                placeholder="exemple@client.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
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
                :disabled="sendingEmail"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
              >
                {{ sendingEmail ? "Envoi en cours..." : "Envoyer" }}
              </button>
              <button
                type="button"
                @click="showEmailModal = false"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
              >
                Annuler
              </button>
            </div>
          </form>
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
              <th class="text-left py-3 px-4 font-bold text-gray-900">
                Description
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
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(items, service) in itemsDisplayForTable"
              :key="service"
            >
              <!-- Service Items -->
              <tr
                v-for="(item, index) in items"
                :key="index"
                @click="openEditModal(item)"
                class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition group relative"
              >
                <td class="py-3 px-4 text-gray-900 font-semibold">
                  {{ getItemDisplay(item).serviceName }}
                </td>
                <td class="w-48 py-3 px-4 text-gray-900">
                  <p v-if="getItemDisplay(item).description">
                    {{ getItemDisplay(item).description }}
                  </p>
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
                <!-- Delete Button Outside Table -->
                <div class="text-center absolute -right-6 top-3 no-print">
                  <button
                    @click.stop="deleteInvoiceItem(item.id)"
                    class="text-red-600"
                    title="Supprimer cet article"
                  >
                    <X :size="20" />
                  </button>
                </div>
              </tr>
            </template>
          </tbody>
          <tfoot>
            <!-- Taxable Subtotal Row -->
            <tr class="border-t-2 border-gray-300">
              <td
                :colspan="hasAnyTaxExemptItems ? 7 : 6"
                class="text-right font-bold text-gray-900 py-3 px-4"
              >
                Sous-total:
              </td>
              <td class="text-right font-bold text-gray-900 py-3 px-4 w-32">
                {{ formatCurrency(taxableSubtotal) }}
              </td>
              <td></td>
            </tr>

            <!-- TPS Row -->
            <tr class="border-b border-t border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 7 : 6"
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
              <td></td>
            </tr>

            <!-- TVQ Row -->
            <tr class="border-b border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 7 : 6"
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
              <td></td>
            </tr>

            <!-- Tax-Exempt Subtotal Row -->
            <tr v-if="taxExemptSubtotal > 0" class="border-b border-gray-200">
              <td
                :colspan="hasAnyTaxExemptItems ? 7 : 6"
                class="text-right font-bold text-gray-900 py-3 px-4"
              >
                Sous-total (articles exonérés):
              </td>
              <td class="text-right font-bold text-gray-900 py-3 px-4">
                {{ formatCurrency(taxExemptSubtotal) }}
              </td>
              <td></td>
            </tr>

            <!-- Grand Total Row -->
            <tr class="border-t-2 border-green-300">
              <td
                :colspan="hasAnyTaxExemptItems ? 7 : 6"
                class="text-right text-lg font-bold text-gray-900 py-3 px-4"
              >
                TOTAL:
              </td>
              <td class="text-right text-lg font-bold text-gray-900 py-3 px-4">
                {{ formatCurrency(grandTotal) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- Footer -->
      <div
        class="border-t pt-8 text-center text-gray-600 text-sm bottom-0 absolute w-full mb-12"
      >
        <p>Merci de votre confiance!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { X, Download, Plus, Printer, Send, FileText } from "lucide-vue-next";
import { useProjectStore } from "../stores/projectStore";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";
import { useTimeEntryStore } from "../stores/timeEntryStore";
import { useServiceStore } from "../stores/serviceStore";
import type { Invoice, InvoiceItem } from "../types";
import { SupabaseService } from "../services/supabase";
import html2pdf from "html2pdf.js";

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
const emailForm = ref({
  recipient: "",
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

// Display items as they are without merging
const itemsDisplayForTable = computed(() => {
  return itemsGroupedByService.value;
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

// Helper function to generate PDF with consistent settings
const generateInvoicePDF = async (): Promise<string> => {
  const invoiceContent = document.querySelector(".invoice-content");
  if (!invoiceContent) {
    throw new Error("Invoice content not found");
  }

  // Temporarily show print-only elements and hide no-print elements
  const printOnlyElements = invoiceContent.querySelectorAll(".print-only");
  const noPrintElements = invoiceContent.querySelectorAll(".no-print");

  // Store original display values
  const originalDisplay = new Map<Element, string>();

  printOnlyElements.forEach((el) => {
    originalDisplay.set(el, (el as HTMLElement).style.display);
    (el as HTMLElement).style.display = "block";
  });

  noPrintElements.forEach((el) => {
    originalDisplay.set(el, (el as HTMLElement).style.display);
    (el as HTMLElement).style.display = "none";
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

  return new Promise<string>((resolve, reject) => {
    html2pdf()
      .set(options)
      .from(invoiceContent)
      .outputPdf("dataurlstring")
      .then((pdfDataUrl: string) => {
        // Extract base64 from data URL
        const base64 = pdfDataUrl.split(",")[1];

        // Restore original display values
        originalDisplay.forEach((value, el) => {
          (el as HTMLElement).style.display = value;
        });

        resolve(base64);
      })
      .catch((error: Error) => {
        // Restore original display values on error too
        originalDisplay.forEach((value, el) => {
          (el as HTMLElement).style.display = value;
        });
        reject(error);
      });
  });
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

    // Update invoice with new project_id
    await SupabaseService.updateInvoice(invoice.value.id, {
      project_id: selectedProjectId.value,
    });
    invoice.value.project_id = selectedProjectId.value;

    // Update project with new contact_id if selected
    if (selectedContactId.value) {
      await SupabaseService.updateProject(selectedProjectId.value, {
        contact_id: selectedContactId.value,
      });
    }

    console.log("Invoice saved successfully");
    alert("Changements sauvegardés avec succès!");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
  }
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
const openEditModal = (item: InvoiceItem) => {
  editingItemId.value = item.id;
  editItemForm.value = {
    service_id: item.service_id || "",
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    exempt_tax: item.exempt_tax || false,
  };
  showEditItemModal.value = true;
};

const closeEditModal = () => {
  showEditItemModal.value = false;
  editingItemId.value = null;
};

const updateInvoiceItem = async () => {
  if (!editingItemId.value || !editItemForm.value.description) {
    alert("Veuillez remplir tous les champs requis");
    return;
  }

  try {
    const subtotal =
      editItemForm.value.quantity * editItemForm.value.unit_price;

    const updateData = {
      service_id: editItemForm.value.service_id || null,
      description: editItemForm.value.description,
      quantity: editItemForm.value.quantity,
      unit_price: editItemForm.value.unit_price,
      subtotal: subtotal,
      line_total: subtotal,
      exempt_tax: editItemForm.value.exempt_tax,
    };

    // Update in database
    await SupabaseService.updateInvoiceItem(editingItemId.value, updateData);

    // Update in local state
    const itemIndex = invoiceItems.value.findIndex(
      (item) => item.id === editingItemId.value,
    );
    if (itemIndex !== -1) {
      invoiceItems.value[itemIndex] = {
        ...invoiceItems.value[itemIndex],
        ...updateData,
      };
    }

    alert("Article modifié avec succès!");
    closeEditModal();
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    alert("Erreur lors de la modification de l'article");
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

const getItemDisplay = (item: InvoiceItem) => {
  const serviceName = getServiceName(item.service_id) || null;
  // If description is different from service name, it's a custom description
  const hasCustomDescription =
    item.description && item.description !== serviceName;
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
      const serviceName =
        getServiceName(freshEntry?.service_id || entry.service_id) || "Service";
      const itemData = {
        invoice_id: invoice.value.id,
        time_entry_id: entry.id || null,
        description:
          freshEntry?.description || entry.description || serviceName,
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

  // Pre-fill email form with client info
  emailForm.value.recipient = client.value?.email || "";
  emailForm.value.subject = `Facture #${invoice.value.invoice_number}`;
  emailForm.value.message = "Veuillez trouver ci-joint votre facture.";

  showEmailModal.value = true;
};

const submitEmailInvoice = async () => {
  if (!invoice.value || !emailForm.value.recipient) {
    alert("Veuillez entrer une adresse email");
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

    // Send the email via Supabase Edge Function with PDF attachment
    await SupabaseService.sendInvoiceEmail({
      invoiceId: invoice.value.id,
      recipient: emailForm.value.recipient,
      subject: emailForm.value.subject,
      message: emailForm.value.message,
      invoiceNumber: invoice.value.invoice_number,
      pdfBase64: pdfBase64,
    });

    // Update invoice status to "sent"
    await SupabaseService.updateInvoice(invoice.value.id, {
      status: "sent",
    });
    invoice.value.status = "sent";

    showEmailModal.value = false;
    emailForm.value = {
      recipient: "",
      subject: "",
      message: "Veuillez trouver ci-joint votre facture.",
    };

    alert("Facture envoyée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
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
  height: 11in;
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

  /* Hide action column */
  tfoot td:last-child {
    display: none;
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
    height: 11in;
    overflow: hidden;
  }

  table {
    font-size: 0.9em;
    width: 100%;
  }

  th,
  td {
    padding: 0.15em 0.25em;
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
  .invoice-content > div:last-child {
    position: absolute;
    bottom: 0.3in;
    left: 0;
    right: 0;
    width: 100%;
    margin: 0 !important;
    padding: 0.2in 0.4in !important;
    text-align: center;
    font-size: 0.85em;
  }
}
</style>
