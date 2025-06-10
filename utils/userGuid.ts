export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function getOrCreateUserGuid(storage: StorageLike = window.localStorage): string {
  let guid = storage.getItem('userGuid');
  if (!guid) {
    guid = crypto.randomUUID();
    storage.setItem('userGuid', guid);
  }
  return guid;
}
