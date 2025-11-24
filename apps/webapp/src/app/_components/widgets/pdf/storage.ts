const STORAGE_PREFIX = "dmh:pdf-tab:";
const CHUNK_SIZE = 0x8000;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const toBase64 = (bytes: Uint8Array) => {
  if (typeof window === "undefined") {
    throw new Error("Browser environment is required");
  }

  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += CHUNK_SIZE) {
    const chunk = bytes.subarray(index, index + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
};

const fromBase64 = (value: string) => {
  if (typeof window === "undefined") {
    throw new Error("Browser environment is required");
  }

  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

export const persistPdfFile = async (storageKey: string, file: File) => {
  const storage = getStorage();
  if (!storage) {
    throw new Error("Browser storage is unavailable");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const serialized = toBase64(bytes);

  try {
    storage.setItem(`${STORAGE_PREFIX}${storageKey}`, serialized);
  } catch (error) {
    console.error(error);
    throw new Error("Unable to store PDF in browser storage");
  }

  return bytes;
};

export const loadPdfFile = (storageKey: string): Promise<Uint8Array | null> => {
  const storage = getStorage();
  if (!storage) {
    return Promise.resolve(null);
  }

  const payload = storage.getItem(`${STORAGE_PREFIX}${storageKey}`);
  if (!payload) {
    return Promise.resolve(null);
  }

  try {
    return Promise.resolve(fromBase64(payload));
  } catch (error) {
    console.error(error);
    return Promise.resolve(null);
  }
};

export const removePdfFile = (storageKey: string) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
  } catch (error) {
    console.error(error);
  }
};
