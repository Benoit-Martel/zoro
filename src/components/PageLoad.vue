<template>
  <div v-if="loading" role="status" aria-live="polite" aria-busy="true" class="py-16 text-center text-gray-500">
    Chargement?
  </div>
  <div v-else-if="error" role="alert" class="py-16 text-center text-gray-600">
    <p>Impossible de charger la page.</p>
    <button class="mt-4 text-blue-600 hover:underline" @click="$emit('retry')">R?essayer</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
defineProps<{ loading: boolean; error: boolean }>();
defineEmits<{ retry: [] }>();
</script>
