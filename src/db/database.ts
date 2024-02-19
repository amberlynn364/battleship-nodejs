interface Data {
  id: number;
}

export class DataBase<T extends Data> {
  private readonly dataMap = new Map<number, T>();

  public createData(data: T): T {
    const item = { ...data };
    this.dataMap.set(item.id, item);
    return item;
  }

  public updateData(id: number, data: Partial<T>): T | null {
    const item = this.deleteData(id);
    return !item ? null : this.createData({ ...item, ...data });
  }

  public deleteData(id: number): T | null {
    const item = this.findDataByID(id);
    if (!item) return null;
    this.dataMap.delete(id);
    return item;
  }

  public findDataByID(id: number): T | null {
    return this.dataMap.get(id) ?? null;
  }

  public findItemInDataByField(field: keyof T, value: unknown): T | null {
    const foundItem = Array.from(this.findAllData()).find((item) => item[field] === value);
    return foundItem ?? null;
  }

  public findItemsInDataByField(field: keyof T, value: unknown): T[] {
    const items = Array.from(this.findAllData()).filter((item) => item[field] === value);
    return items;
  }

  public findAllData(): IterableIterator<T> {
    return this.dataMap.values();
  }
}
