import { ref, readonly, onMounted, type Ref } from 'vue';
import { debug } from '@/utils/debug';

export interface UseStorageReturn<T> {
  data: Readonly<Ref<T>>;
  loading: Readonly<Ref<boolean>>;
  error: Readonly<Ref<string | null>>;
  refetch: () => Promise<void>;
}

export function useStorage<T>(key: string, defaultValue: T): UseStorageReturn<T> {
  const data = ref<T>(defaultValue);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadData = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await chrome.storage.local.get([key]);

      if (result[key]) {
        try {
          data.value = JSON.parse(result[key]);
        } catch (parseError) {
          debug.error(`Error parsing ${key} from storage:`, parseError);
          error.value = `Failed to parse ${key} data`;
          data.value = defaultValue;
        }
      } else {
        debug.log(`No ${key} found in storage, using default value.`);
        data.value = defaultValue;
      }
    } catch (storageError) {
      debug.error(`Error retrieving ${key} from storage:`, storageError);
      error.value = `Failed to load ${key} from storage`;
      data.value = defaultValue;
    } finally {
      loading.value = false;
    }
  };

  // Listen for storage changes
  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes[key]) {
      try {
        data.value = JSON.parse(changes[key].newValue);
      } catch (parseError) {
        debug.error(`Error parsing updated ${key}:`, parseError);
        error.value = `Failed to parse updated ${key} data`;
      }
    }
  };

  onMounted(() => {
    loadData();
    chrome.storage.onChanged.addListener(handleStorageChange);
  });

  return {
    data: readonly(data) as Readonly<Ref<T>>,
    loading: readonly(loading),
    error: readonly(error),
    refetch: loadData
  };
}
