import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(protected http: HttpClient) {}

  url(path: string) {
    return `${this.baseUrl}${path}`;
  }
}

