import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AnalysisResults, ProjectGraph } from '../../../../app/typescript-parser/typescript-parser-results';
import { ProjectDataApiService } from '../api/project-data-api.service';
import { map, takeUntil } from 'rxjs/operators';
import { ProjectAnalysisRequest } from '../model/project-data';


@Injectable({ providedIn: 'root' })
export class ProjectDataService implements OnDestroy {

  public projectData$: Observable<AnalysisResults>;
  public projectName$: Observable<string>;
  public projectGraph$: Observable<ProjectGraph>;
  public loadingData$: Observable<boolean>;

  private _serviceIsReady: boolean = false;
  private _projectDataSubject$: BehaviorSubject<AnalysisResults>;
  private _loadingDataSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private _projectDataApi: ProjectDataApiService) {
    this._projectDataSubject$ = new BehaviorSubject<AnalysisResults>({
      projectName: '',
      nodes: [],
      edges: []
    });
    this._setSelectors();
  }

  private _setSelectors(): void {
    this.projectData$ = this._projectDataSubject$.asObservable().pipe(takeUntil(this._componentDestroyed$));
    this.loadingData$ = this._loadingDataSubject$.asObservable().pipe(takeUntil(this._componentDestroyed$));

    this.projectName$ = this.projectData$.pipe(map((projectData: AnalysisResults) => projectData.projectName ?? 'Unnamed Project'));
    this.projectGraph$ = this.projectData$.pipe(map((projectData: AnalysisResults) => ({
      nodes: projectData.nodes,
      edges: projectData.edges
    })));
  }

  public analyzeProject(analysisRequest: ProjectAnalysisRequest): void {
    console.log('STARTING');
    this._loadingDataSubject$.next(true);
    this._projectDataApi
      .analyzeProject(analysisRequest)
      .pipe(takeUntil(this._componentDestroyed$))
      .subscribe((analysisResults: AnalysisResults) => {
        this._projectDataSubject$.next(analysisResults);
        console.log('FINISHED');
        this._loadingDataSubject$.next(false);
      });
  }

  public setIsReady(): boolean {
    return this._serviceIsReady = true;
  }

  public checkIsReady(): boolean {
    return this._serviceIsReady;
  }

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();

    this._projectDataSubject$.complete();
    this._projectDataSubject$.unsubscribe();
  }
}
