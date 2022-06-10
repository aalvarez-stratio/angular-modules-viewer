import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectAnalysisRequest } from '../model/project-data';


@Injectable({ providedIn: 'root' })
export class ProjectDataApiService {

  private readonly _baseUrl: string = 'http://localhost:3000';

  constructor(private _http: HttpClient) {}

  public analyzeProject(analysisRequest: ProjectAnalysisRequest): Observable<any> {
    return this._http.post(this._baseUrl + '/analyze-project', analysisRequest);
  }
}
