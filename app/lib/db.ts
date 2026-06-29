// IndexedDB client — versioned schema with migrations.
// Cookies handle SSR-critical state (theme, locale). Everything else goes here.

const DB_NAME = 'thenews-db'
const DB_VERSION = 1

export type ReadingProgressRecord = {
  editionId: string   // stable API id (e.g. "id_z0da1awuumqyy6gan")
  slug: string        // URL slug — stored for reverse lookup
  progress: number    // 0–100, max progress ever reached (never decreases)
  completed: boolean
  firstReadAt: string // ISO datetime
  updatedAt: string   // ISO datetime
}

type Migration = (db: IDBDatabase, tx: IDBTransaction) => void

const MIGRATIONS: Record<number, Migration> = {
  1: (db) => {
    const store = db.createObjectStore('readingProgress', { keyPath: 'editionId' })
    store.createIndex('slug', 'slug', { unique: true })
    store.createIndex('updatedAt', 'updatedAt')
    store.createIndex('completed', 'completed')
  },
}

let _db: IDBDatabase | null = null
let _opening: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  if (_opening) return _opening

  _opening = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      _opening = null
      reject(new Error('IndexedDB not available'))
      return
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      const tx = (e.target as IDBOpenDBRequest).transaction!
      const oldVersion = e.oldVersion

      for (let v = oldVersion + 1; v <= DB_VERSION; v++) {
        MIGRATIONS[v]?.(db, tx)
      }
    }

    req.onsuccess = () => {
      _db = req.result
      _db.onversionchange = () => {
        _db?.close()
        _db = null
        _opening = null
      }
      resolve(_db)
    }

    req.onerror = () => {
      _opening = null
      reject(req.error)
    }

    req.onblocked = () => {
      _opening = null
      reject(new Error('IndexedDB blocked — close other tabs with an older version'))
    }
  })

  return _opening
}

// ── Generic CRUD ──────────────────────────────────────────────────────────────

export function dbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const req = db.transaction(store, 'readonly').objectStore(store).get(key)
        req.onsuccess = () => resolve(req.result as T | undefined)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function dbPut<T>(store: string, value: T): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        tx.objectStore(store).put(value)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

export function dbDelete(store: string, key: IDBValidKey): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        tx.objectStore(store).delete(key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

export function dbGetAll<T>(store: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const req = db.transaction(store, 'readonly').objectStore(store).getAll()
        req.onsuccess = () => resolve(req.result as T[])
        req.onerror = () => reject(req.error)
      }),
  )
}

// ── Reading progress helpers ──────────────────────────────────────────────────

export function getReadingProgress(editionId: string): Promise<ReadingProgressRecord | undefined> {
  return dbGet<ReadingProgressRecord>('readingProgress', editionId)
}

export function saveReadingProgress(
  record: Omit<ReadingProgressRecord, 'firstReadAt'> & { firstReadAt?: string },
): Promise<void> {
  return getReadingProgress(record.editionId).then((existing) =>
    dbPut('readingProgress', {
      ...record,
      firstReadAt: existing?.firstReadAt ?? record.firstReadAt ?? new Date().toISOString(),
    }),
  )
}

export function getAllReadingProgress(): Promise<ReadingProgressRecord[]> {
  return dbGetAll<ReadingProgressRecord>('readingProgress')
}

export function deleteReadingProgress(editionId: string): Promise<void> {
  return dbDelete('readingProgress', editionId)
}
