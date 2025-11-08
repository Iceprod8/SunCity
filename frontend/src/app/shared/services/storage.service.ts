import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly KEY = 'suncity.currentUser';

  save<T>(value: T) {
    localStorage.setItem(this.KEY, JSON.stringify(value));
  }

  load<T>(): T | null {
    const raw = localStorage.getItem(this.KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  clear() {
    localStorage.removeItem(this.KEY);
  }
}

