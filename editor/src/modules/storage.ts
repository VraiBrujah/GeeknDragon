import Dexie, { Table } from 'dexie';

interface ProjectRecord {
  id: string;
  data: any;
}

interface HistoryRecord {
  id: string;
  data: any;
}

interface UIRecord {
  id: string;
  data: any;
}

class EditorDB extends Dexie {
  project!: Table<ProjectRecord, string>;
  history!: Table<HistoryRecord, string>;
  ui!: Table<UIRecord, string>;

  constructor() {
    super('EditorDB');
    this.version(1).stores({
      project: 'id',
      history: 'id',
      ui: 'id',
    });
  }
}

const db = new EditorDB();

export async function saveProject(data: any) {
  await db.project.put({ id: 'project', data });
}

export async function loadProject(): Promise<any | null> {
  const record = await db.project.get('project');
  return record?.data ?? null;
}

export async function saveHistory(data: any) {
  await db.history.put({ id: 'history', data });
}

export async function loadHistory(): Promise<any | null> {
  const record = await db.history.get('history');
  return record?.data ?? null;
}

export async function saveUIState(data: any) {
  await db.ui.put({ id: 'ui', data });
}

export async function loadUIState(): Promise<any | null> {
  const record = await db.ui.get('ui');
  return record?.data ?? null;
}
