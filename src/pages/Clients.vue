<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Clients</h2>
      <button
        @click="showForm = !showForm"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
      >
        {{ showForm ? "Annuler" : "Nouveau client" }}
      </button>
    </div>

    <!-- New Client Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-900">
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
          <label class="block text-gray-700 font-bold mb-2">Code postal</label>
          <input
            v-model="formData.postal_code"
            type="text"
            placeholder="ex. H1A 1A1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>
        <button
          type="submit"
          :disabled="clientStore.loading"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition disabled:opacity-50"
        >
          {{ clientStore.loading ? "Création en cours..." : "Créer un client" }}
        </button>
      </form>
    </div>

    <!-- Clients Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h3 class="font-bold text-gray-900">Liste des clients</h3>
      </div>
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left font-bold text-gray-900">Nom</th>
            <th class="px-6 py-3 text-left font-bold text-gray-900">
              Courriel
            </th>
            <th class="px-6 py-3 text-left font-bold text-gray-900">
              Téléphone
            </th>
            <th class="px-6 py-3 text-left font-bold text-gray-900">Ville</th>
            <th class="px-6 py-3 text-left font-bold text-gray-900">
              Province
            </th>
            <th class="px-6 py-3 text-center font-bold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in sortedClients"
            :key="client.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 text-gray-900">{{ client.name }}</td>
            <td class="px-6 py-4 text-gray-700">{{ client.email || "-" }}</td>
            <td class="px-6 py-4 text-gray-700">{{ client.phone || "-" }}</td>
            <td class="px-6 py-4 text-gray-700">{{ client.city || "-" }}</td>
            <td class="px-6 py-4 text-gray-700">
              {{ client.province || "-" }}
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click="openEditModal(client)"
                class="text-blue-600 hover:text-blue-700 transition mr-4"
                title="Modifier ce client"
              >
                <Edit :size="18" />
              </button>
              <button
                @click="deleteClient(client.id)"
                class="text-red-600 hover:text-red-700 transition"
                title="Supprimer ce client"
              >
                <Trash2 :size="18" />
              </button>
            </td>
          </tr>
          <tr v-if="sortedClients.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
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
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h3 class="text-2xl font-bold mb-6 text-gray-900">
          Modifier le client
        </h3>

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
            <label class="block text-gray-700 font-bold mb-2">Courriel</label>
            <input
              v-model="editFormData.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-bold mb-2">Téléphone</label>
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
            <label class="block text-gray-700 font-bold mb-2">Province</label>
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

        <div class="flex gap-4 mt-6">
          <button
            @click="saveEdit"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Sauvegarder
          </button>
          <button
            @click="closeEditModal"
            class="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
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
import { Trash2, Edit } from "lucide-vue-next";
import { useClientStore } from "../stores/clientStore";

const clientStore = useClientStore();
const showForm = ref(false);
const showEditModal = ref(false);
const editingClientId = ref<string | null>(null);

// Sorted clients alphabetically by name
const sortedClients = computed(() => {
  return [...clientStore.clients].sort((a, b) => a.name.localeCompare(b.name));
});

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

const openEditModal = (client: any) => {
  editingClientId.value = client.id;
  editFormData.value = {
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    city: client.city || "",
    province: client.province || "",
    postal_code: client.postal_code || "",
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingClientId.value = null;
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
</script>
