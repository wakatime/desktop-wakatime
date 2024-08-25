// This is just a simple in memory key value pair store to keep in memory caches.
export class Store {
  records: Record<string, unknown> = {};
  static _instacneCache?: Store;

  static instance(): Store {
    if (!this._instacneCache) {
      this._instacneCache = new this();
    }
    return this._instacneCache;
  }

  set<T = unknown>(key: string, value: T) {
    this.records[key] = value;
  }

  get<T = unknown>(key: string) {
    const value = this.records[key] as T | undefined;
    return value;
  }

  clear() {
    this.records = {};
  }

  delete(key: string) {
    this.records[key] = undefined;
  }
}
