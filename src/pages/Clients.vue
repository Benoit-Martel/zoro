<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex gap-4 items-center mb-8">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Filtrer par nom de client..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      />
      <button
        @click="showForm = true"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition"
      >
        Nouveau client
      </button>
    </div>

    <!-- New Client Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="showForm = false"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          Créer un nouveau client
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Nom du client</label
            >
            <input
              v-model="formData.name"
              type="text"
              placeholder="ex. Acme Corporation"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2">Courriel</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="ex. contact@acme.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2">Téléphone</label>
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="ex. +1-555-0123"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2">Adresse</label>
            <input
              v-model="formData.address"
              type="text"
              placeholder="ex. 123 rue Principal"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-bold mb-2">Ville</label>
              <input
                v-model="formData.city"
                type="text"
                placeholder="ex. Montréal"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-bold mb-2">Province</label>
              <input
                v-model="formData.province"
                type="text"
                placeholder="ex. QC"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div>
            <label class="block text-gray-700 font-bold mb-2"
              >Code postal</label
            >
            <input
              v-model="formData.postal_code"
              type="text"
              placeholder="ex. H1A 1A1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div class="flex gap-4 mt-6">
            <button
              type="submit"
              :disabled="clientStore.loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition disabled:opacity-50"
            >
              {{
                clientStore.loading ? "Création en cours..." : "Créer un client"
              }}
            </button>
            <button
              type="button"
              @click="showForm = false"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Clients Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr style="height: 62px">
            <th
              @click="toggleSort('name')"
              class="px-6 py-3 text-left font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition select-none"
            >
              Client
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
            <th class="px-6 py-3 text-center font-bold text-gray-900"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in filteredClients"
            :key="client.id"
            @click="openEditModal(client)"
            style="height: 62px"
            class="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            <td class="px-6 py-2 text-gray-900">{{ client.name }}</td>
            <td class="text-right px-6">
              <button
                @click.stop="deleteClient(client.id)"
                class="text-red-600"
                title="Supprimer ce client"
              >
                <X :size="28" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredClients.length === 0" style="height: 62px">
            <td colspan="2" class="px-6 py-8 text-center text-gray-500">
              Aucun client. Créez votre premier client pour commencer.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Client Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @mousedown.self="closeEditModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Modifier le client</h3>
          <button
            @click="closeEditModal"
            class="text-gray-500 hover:text-gray-700"
          >
            <X :size="24" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Client Info Section -->
          <div>
            <h4 class="font-bold text-lg mb-4 text-gray-900">
              Informations du client
            </h4>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 font-bold mb-2"
                  >Nom du client</label
                >
                <input
                  v-model="editFormData.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-700 font-bold mb-2">
                  Courriel
                </label>
                <input
                  v-model="editFormData.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label class="block text-gray-700 font-bold mb-2">
                  Téléphone
                </label>
                <input
                  v-model="editFormData.phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label class="block text-gray-700 font-bold mb-2">Ville</label>
                <input
                  v-model="editFormData.city"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label class="block text-gray-700 font-bold mb-2">
                  Province
                </label>
                <input
                  v-model="editFormData.province"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label class="block text-gray-700 font-bold mb-2"
                  >Code postal</label
                >
                <input
                  v-model="editFormData.postal_code"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <!-- Contacts Section -->
          <div class="border-l pl-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-lg text-gray-900">Contacts</h4>
              <button
                v-if="!showAddContactForm && editingContactId === null"
                @click="showAddContactForm = true"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded flex items-center gap-2 text-sm"
              >
                <Plus :size="16" />
                Ajouter
              </button>
            </div>

            <!-- Add Contact Form -->
            <div v-if="showAddContactForm" class="bg-gray-50 p-4 rounded mb-4">
              <div class="space-y-3">
                <div>
                  <label class="block text-gray-700 font-bold mb-1">Nom</label>
                  <input
                    v-model="contactFormData.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-600"
                    placeholder="Nom du contact"
                    required
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-bold mb-1">
                    Téléphone
                  </label>
                  <input
                    v-model="contactFormData.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-600"
                    placeholder="Téléphone"
                  />
                </div>
                <div>
                  <label class="block text-gray-700 font-bold mb-1">
                    Courriel
                  </label>
                  <input
                    v-model="contactFormData.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-600"
                    placeholder="Courriel"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    @click="addContact"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm transition"
                  >
                    Ajouter
                  </button>
                  <button
                    @click="showAddContactForm = false"
                    class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded text-sm transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>

            <!-- Contacts List -->
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="contact in clientContacts"
                :key="contact.id"
                class="bg-gray-50 p-3 rounded"
              >
                <!-- Display Mode -->
                <div
                  v-if="editingContactId !== contact.id"
                  class="flex justify-between items-start"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">
                      {{ contact.name }}
                    </p>
                    <p v-if="contact.phone" class="text-sm text-gray-600">
                      📱 {{ contact.phone }}
                    </p>
                    <p v-if="contact.email" class="text-sm text-gray-600">
                      📧 {{ contact.email }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openEditContact(contact)"
                      class="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Éditer
                    </button>
                    <button
                      @click="deleteContact(contact.id)"
                      class="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-else class="space-y-2">
                  <div>
                    <label class="block text-gray-700 font-bold mb-1 text-sm"
                      >Nom</label
                    >
                    <input
                      v-model="editContactFormData.name"
                      type="text"
                      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-700 font-bold mb-1 text-sm"
                      >Téléphone</label
                    >
                    <input
                      v-model="editContactFormData.phone"
                      type="tel"
                      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-700 font-bold mb-1 text-sm"
                      >Courriel</label
                    >
                    <input
                      v-model="editContactFormData.email"
                      type="email"
                      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="saveContact"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm transition"
                    >
                      Sauvegarder
                    </button>
                    <button
                      @click="closeEditContact"
                      class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded text-sm transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-if="clientContacts.length === 0 && !showAddContactForm"
                class="text-center text-gray-500 text-sm py-4"
              >
                Aucun contact. Ajoutez-en un!
              </div>
            </div>
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
        </div>
      </div>
    </div>
    <div
      v-if="!clientStore.loading && clientStore.clients.length === 0"
      class="text-center py-12"
    >
      <p class="text-gray-500 text-lg mb-4">
        Aucun client pour le moment. Créez-en un pour commencer!
      </p>
    </div>

    <!-- Error Messages -->
    <div
      v-if="clientStore.error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      {{ clientStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { Edit, X, Plus, ChevronUp, ChevronDown } from "lucide-vue-next";
import { useClientStore } from "../stores/clientStore";
import { useContactStore } from "../stores/contactStore";

const clientStore = useClientStore();
const contactStore = useContactStore();
const showForm = ref(false);
const showEditModal = ref(false);
const editingClientId = ref<string | null>(null);
const showAddContactForm = ref(false);
const editingContactId = ref<string | null>(null);
const clientContacts = ref<any[]>([]);
const searchTerm = ref("");
const sortColumn = ref<"name">("name");
const sortDirection = ref<"asc" | "desc">("asc");

// Sorted and filtered clients
const filteredClients = computed(() => {
  let clients = [...clientStore.clients];

  if (searchTerm.value.trim()) {
    clients = clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
    );
  }

  // Sort
  return clients.sort((a, b) => {
    let aVal = a.name.toLowerCase();
    let bVal = b.name.toLowerCase();

    if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
    return 0;
  });
});

const toggleSort = (column: "name") => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const getSortIndicator = (column: "name") => {
  if (sortColumn.value !== column) return "none";
  return sortDirection.value === "asc" ? "asc" : "desc";
};

const formData = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
});

const editFormData = ref({
  name: "",
  email: "",
  phone: "",
  city: "",
  province: "",
  postal_code: "",
});

const contactFormData = ref({
  name: "",
  phone: "",
  email: "",
});

const editContactFormData = ref({
  name: "",
  phone: "",
  email: "",
});

onMounted(async () => {
  await clientStore.fetchClients();
});

const submitForm = async () => {
  if (!formData.value.name) {
    alert("Le nom du client est obligatoire");
    return;
  }

  try {
    await clientStore.addClient({
      name: formData.value.name,
      email: formData.value.email || undefined,
      phone: formData.value.phone || undefined,
      address: formData.value.address || undefined,
      city: formData.value.city || undefined,
      province: formData.value.province || undefined,
      postal_code: formData.value.postal_code || undefined,
    });
    formData.value = {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
    };
    showForm.value = false;
  } catch (error) {
    alert("Erreur lors de la création du client. Veuillez réessayer.");
  }
};

const openEditModal = async (client: any) => {
  editingClientId.value = client.id;
  editFormData.value = {
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    city: client.city || "",
    province: client.province || "",
    postal_code: client.postal_code || "",
  };
  showAddContactForm.value = false;
  editingContactId.value = null;
  contactFormData.value = { name: "", phone: "", email: "" };
  editContactFormData.value = { name: "", phone: "", email: "" };

  // Fetch contacts for this client
  await contactStore.fetchContacts(client.id);
  clientContacts.value = contactStore.contacts;

  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingClientId.value = null;
  showAddContactForm.value = false;
  editingContactId.value = null;
};

const saveEdit = async () => {
  if (!editingClientId.value || !editFormData.value.name) {
    alert("Le nom du client est obligatoire");
    return;
  }

  try {
    await clientStore.updateClient(editingClientId.value, {
      name: editFormData.value.name,
      email: editFormData.value.email || undefined,
      phone: editFormData.value.phone || undefined,
      city: editFormData.value.city || undefined,
      province: editFormData.value.province || undefined,
      postal_code: editFormData.value.postal_code || undefined,
    });
    closeEditModal();
  } catch (error) {
    alert("Erreur lors de la mise à jour du client. Veuillez réessayer.");
  }
};

const deleteClient = async (id: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce client?")) {
    try {
      await clientStore.deleteClient(id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("projets existants")
      ) {
        alert(
          "Impossible de supprimer ce client car il a des projets existants.",
        );
      } else {
        alert("Échec de la suppression du client. Veuillez réessayer.");
      }
    }
  }
};

const addContact = async () => {
  if (!editingClientId.value || !contactFormData.value.name) {
    alert("Le nom du contact est obligatoire");
    return;
  }

  try {
    await contactStore.addContact({
      client_id: editingClientId.value,
      name: contactFormData.value.name,
      phone: contactFormData.value.phone || undefined,
      email: contactFormData.value.email || undefined,
    });
    // Refresh contacts from store
    clientContacts.value = contactStore.contacts;
    contactFormData.value = { name: "", phone: "", email: "" };
    showAddContactForm.value = false;
  } catch (error) {
    alert("Erreur lors de l'ajout du contact. Veuillez réessayer.");
  }
};

const openEditContact = (contact: any) => {
  editingContactId.value = contact.id;
  editContactFormData.value = {
    name: contact.name,
    phone: contact.phone || "",
    email: contact.email || "",
  };
};

const closeEditContact = () => {
  editingContactId.value = null;
  editContactFormData.value = { name: "", phone: "", email: "" };
};

const saveContact = async () => {
  if (!editingContactId.value || !editContactFormData.value.name) {
    alert("Le nom du contact est obligatoire");
    return;
  }

  try {
    const updated = await contactStore.updateContact(editingContactId.value, {
      name: editContactFormData.value.name,
      phone: editContactFormData.value.phone || undefined,
      email: editContactFormData.value.email || undefined,
    });
    const index = clientContacts.value.findIndex(
      (c) => c.id === editingContactId.value,
    );
    if (index > -1) {
      clientContacts.value[index] = updated;
    }
    closeEditContact();
  } catch (error) {
    alert("Erreur lors de la mise à jour du contact. Veuillez réessayer.");
  }
};

const deleteContact = async (id: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce contact?")) {
    try {
      await contactStore.deleteContact(id);
      clientContacts.value = clientContacts.value.filter((c) => c.id !== id);
    } catch (error) {
      alert("Erreur lors de la suppression du contact. Veuillez réessayer.");
    }
  }
};
</script>
