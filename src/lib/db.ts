import Dexie, { type EntityTable } from 'dexie';

export interface Material {
  id?: number;
  name: string;
  category: string;
  price: number;
  link?: string;
  image?: string;
  unit: string; // e.g., "litro", "cubeta", "unidad"
  yield?: number; // m2 per unit
}

export interface Client {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface JobItem {
  materialId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Job {
  id?: number;
  clientId: number;
  title: string;
  date: Date;
  status: 'draft' | 'sent' | 'paid';
  items: JobItem[];
  subtotal: number;
  ivaEnabled: boolean;
  ivaPercent: number;
  discountEnabled: boolean;
  discountPercent: number;
  total: number;
  type: 'quotation' | 'invoice';
}

export interface Settings {
  id: number;
  companyName: string;
  taxId?: string;
  address?: string;
  logo?: string;
  email?: string;
  phone?: string;
}

const db = new Dexie('MaterialManagerDB') as Dexie & {
  materials: EntityTable<Material, 'id'>;
  clients: EntityTable<Client, 'id'>;
  jobs: EntityTable<Job, 'id'>;
  settings: EntityTable<Settings, 'id'>;
};

db.version(1).stores({
  materials: '++id, name, category',
  clients: '++id, name, email',
  jobs: '++id, clientId, title, date, status',
  settings: 'id'
});

export { db };
