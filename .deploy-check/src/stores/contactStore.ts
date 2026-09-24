import { defineStore } from "pinia";
import { ref } from "vue";
import { SupabaseService } from "../services/supabase";
import type { Contact } from "../types";

export const useContactStore = defineStore("contact", () => {
  const contacts = ref<Contact[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchContacts(clientId: string) {
    loading.value = true;
    error.value = null;
    try {
      contacts.value = await SupabaseService.getContacts(clientId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching contacts:", err);
    } finally {
      loading.value = false;
    }
  }

  async function addContact(
    contact: Omit<Contact, "id" | "created_at" | "updated_at">,
  ) {
    loading.value = true;
    error.value = null;
    try {
      const newContact = await SupabaseService.createContact(contact);
      contacts.value.unshift(newContact);
      return newContact;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error adding contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateContact(id: string, updates: Partial<Contact>) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await SupabaseService.updateContact(id, updates);
      const index = contacts.value.findIndex((c) => c.id === id);
      if (index > -1) {
        contacts.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error updating contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContact(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await SupabaseService.deleteContact(id);
      contacts.value = contacts.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      console.error("Error deleting contact:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function getContactById(id: string): Contact | undefined {
    return contacts.value.find((c) => c.id === id);
  }

  function getContactsByClientId(clientId: string): Contact[] {
    console.log
    return contacts.value.filter((c) => c.client_id === clientId);
  }

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    getContactById,
    getContactsByClientId,
  };
});
