/**
 * PDF File Storage using IndexedDB
 * 
 * IndexedDB provides significantly more storage capacity than localStorage (~50MB+ vs ~5MB)
 * and is better suited for storing binary data like PDF files.
 * 
 * In a production environment, this would be replaced with cloud object storage
 * (e.g., AWS S3, Azure Blob) to support larger files and cross-device access.
 */

const DB_NAME = "dmh-pdf-storage";
const DB_VERSION = 1;
const STORE_NAME = "pdf-files";

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      
      // Handle database being closed unexpectedly
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for PDF files if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "storageKey" });
      }
    };
  });

  return dbPromise;
};

interface StoredPdfFile {
  storageKey: string;
  data: Uint8Array;
  createdAt: number;
}

export const persistPdfFile = async (storageKey: string, file: File): Promise<Uint8Array> => {
  const db = await openDatabase();
  const bytes = new Uint8Array(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredPdfFile = {
      storageKey,
      data: bytes,
      createdAt: Date.now(),
    };

    const request = store.put(record);

    request.onerror = () => {
      reject(new Error("Unable to store PDF in browser storage"));
    };

    request.onsuccess = () => {
      resolve(bytes);
    };
  });
};

export const loadPdfFile = async (storageKey: string): Promise<Uint8Array | null> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(storageKey);

      request.onerror = () => {
        console.error("Failed to load PDF from IndexedDB");
        resolve(null);
      };

      request.onsuccess = () => {
        const result = request.result as StoredPdfFile | undefined;
        resolve(result?.data ?? null);
      };
    });
  } catch (error) {
    console.error("Failed to open IndexedDB:", error);
    return null;
  }
};

export const removePdfFile = async (storageKey: string): Promise<void> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(storageKey);

      request.onerror = () => {
        console.error("Failed to remove PDF from IndexedDB");
        resolve();
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error("Failed to open IndexedDB:", error);
  }
};

/**
 * Get storage usage information (for debugging/monitoring)
 */
export const getStorageInfo = async (): Promise<{ count: number; estimatedSize: number } | null> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      
      let count = 0;
      let estimatedSize = 0;

      countRequest.onsuccess = () => {
        count = countRequest.result;
      };

      const cursorRequest = store.openCursor();
      
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          const record = cursor.value as StoredPdfFile;
          estimatedSize += record.data.byteLength;
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        resolve({ count, estimatedSize });
      };

      transaction.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
};
