const DB_NAME = 'ZJU-CompNet-Lab';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let db = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImage = async (id, data) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put({ id, data });
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Error saving image', event.target.error);
  });
};

export const getImage = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('Error getting image', event.target.error);
  });
};

export const getAllImages = async () => {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Error getting all images', event.target.error);
    });
};