let instance: Store;

// This is just a simple in memory key value pair store to keep in memory caches.
export class Store {
  records: Record<string, unknown> = {};

  constructor() {
    if (instance) {
      throw new Error("There can be only one stroe.");
    }
    instance = this;
  }

  set<T = unknown>(key: string, value: T) {
    this.records[key] = value;
  }

  get<T = unknown>(key: string, defaultValue?: T) {
    let value = this.records[key];
    if (value === undefined && defaultValue !== undefined) {
      this.records[key] = defaultValue;
      value = defaultValue;
    }
    return value as T;
  }

  clear() {
    this.records = {};
  }

  delete(key: string) {
    this.records[key] = undefined;
  }
}

export const store = Object.freeze(new Store());
