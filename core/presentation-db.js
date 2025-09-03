import Dexie from 'dexie';

// Dexie database for presentation data.
class PresentationDB extends Dexie {
  constructor() {
    super('PresentationDB');
    // Define database schema with indexes.
    this.version(1).stores({
      widgets: 'id',
      snapshots: '++id, widgetId, createdAt',
      histories: '++id, widgetId, createdAt',
    });
  }
}

const db = new PresentationDB();
export default db;
