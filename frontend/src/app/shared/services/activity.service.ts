import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Activity } from "../models/activity.model";

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getActivities() {
    return this.http.get<Activity[]>(this.api.url('/activities'));
  }

}