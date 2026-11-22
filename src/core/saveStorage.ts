export interface SaveStorage {
  read(key: string): Promise<string | null>
  write(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export interface MemorySaveStorage extends SaveStorage {
  snapshot(): Record<string, string>
}

export function createMemorySaveStorage(
  initial: Record<string, string> = {},
): MemorySaveStorage {
  const data = new Map(Object.entries(initial))

  return {
    async read(key) {
      return data.get(key) ?? null
    },
    async write(key, value) {
      data.set(key, value)
    },
    async remove(key) {
      data.delete(key)
    },
    snapshot() {
      return Object.fromEntries(data)
    },
  }
}

export function createLocalStorageSaveStorage(
  storage: Storage | undefined = typeof localStorage === 'undefined' ? undefined : localStorage,
): SaveStorage {
  return {
    async read(key) {
      return storage?.getItem(key) ?? null
    },
    async write(key, value) {
      storage?.setItem(key, value)
    },
    async remove(key) {
      storage?.removeItem(key)
    },
  }
}

export interface IndexedDbSaveStorageOptions {
  databaseName?: string
  storeName?: string
  databaseVersion?: number
}

export function createIndexedDbSaveStorage(
  options: IndexedDbSaveStorageOptions = {},
): SaveStorage {
  const databaseName = options.databaseName ?? 'honghuang-chronicle'
  const storeName = options.storeName ?? 'saves'
  const databaseVersion = options.databaseVersion ?? 1
  let databasePromise: Promise<IDBDatabase> | null = null

  const openDatabase = (): Promise<IDBDatabase> => {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('当前环境不支持 IndexedDB'))
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName)
        }
      }
      request.onsuccess = () => {
        const database = request.result
        database.onversionchange = () => database.close()
        resolve(database)
      }
      request.onerror = () => reject(request.error ?? new Error('无法打开 IndexedDB'))
      request.onblocked = () => reject(new Error('IndexedDB 被其他页面占用'))
    })
  }

  const getDatabase = (): Promise<IDBDatabase> => {
    if (!databasePromise) {
      databasePromise = openDatabase().catch((error) => {
        databasePromise = null
        throw error
      })
    }
    return databasePromise
  }

  return {
    async read(key) {
      const database = await getDatabase()
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly')
        const request = transaction.objectStore(storeName).get(key)
        request.onsuccess = () => {
          resolve(typeof request.result === 'string' ? request.result : null)
        }
        request.onerror = () => reject(request.error ?? new Error('读取存档失败'))
      })
    },

    async write(key, value) {
      const database = await getDatabase()
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite')
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error ?? new Error('写入存档失败'))
        transaction.onabort = () => reject(transaction.error ?? new Error('写入存档被中止'))
        try {
          transaction.objectStore(storeName).put(value, key)
        } catch (error) {
          reject(error)
        }
      })
    },

    async remove(key) {
      const database = await getDatabase()
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite')
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error ?? new Error('删除存档失败'))
        transaction.onabort = () => reject(transaction.error ?? new Error('删除存档被中止'))
        try {
          transaction.objectStore(storeName).delete(key)
        } catch (error) {
          reject(error)
        }
      })
    },
  }
}
