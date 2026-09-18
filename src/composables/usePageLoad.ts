import { onMounted, ref } from "vue";

export function usePageLoad(load: () => Promise<void>) {
  const pageLoading = ref(true);
  const pageError = ref(false);

  const reloadPage = async () => {
    pageLoading.value = true;
    pageError.value = false;
    try {
      await load();
    } catch (error) {
      console.error("Page loading failed:", error);
      pageError.value = true;
    } finally {
      pageLoading.value = false;
    }
  };

  onMounted(reloadPage);
  return { pageLoading, pageError, reloadPage };
}
