class Store {
  records: Record<string, unknown> = {};
  set(key: string, value: unknown) {
    this.records[key] = value;
  }
  get(key: string, defaultValue?: unknown) {
    let value = this.records[key];
    if (value === undefined && defaultValue !== undefined) {
      this.records[key] = defaultValue;
      value = defaultValue;
    }
    return value;
  }
  clear() {
    this.records = {};
  }
  delete(key: string) {
    this.records[key] = undefined;
  }
}

export const store = new Store();
