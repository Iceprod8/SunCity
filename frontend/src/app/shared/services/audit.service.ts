import { Injectable, computed, signal } from '@angular/core';

export interface AuditEntry {
  id: string;
  at: string;
  action: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly STORAGE_KEY = 'suncity-audit';
  private readonly MAX_ENTRIES = 50;
  private readonly entriesSignal = signal<AuditEntry[]>(this.load());

  readonly entries = computed(() => this.entriesSignal());

  log(action: string, detail?: string) {
    const entry: AuditEntry = {
      id: this.buildId(),
      at: new Date().toISOString(),
      action,
      detail
    };
    const next = [entry, ...this.entriesSignal()].slice(0, this.MAX_ENTRIES);
    this.entriesSignal.set(next);
    this.persist(next);
  }

  private load(): AuditEntry[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
    } catch {
      return [];
    }
  }

  private persist(entries: AuditEntry[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  private buildId() {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
