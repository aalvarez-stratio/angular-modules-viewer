import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ProjectDataApiService } from '../api/project-data-api.service';
import { map, takeUntil } from 'rxjs/operators';
import { ProjectAnalysisRequest } from '../model/project-data';
import { AnalysisResultsDTO, ApplicationGraph } from '../../../../app/typescript-parser/typescript-parser.model';


@Injectable({ providedIn: 'root' })
export class ProjectDataService implements OnDestroy {

  public projectData$: Observable<AnalysisResultsDTO>;
  public projectName$: Observable<string>;
  public projectGraph$: Observable<ApplicationGraph>;
  public loadingData$: Observable<boolean>;

  private _serviceIsReady: boolean = false;
  private _projectDataSubject$: BehaviorSubject<AnalysisResultsDTO>;
  private _loadingDataSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private _projectDataApi: ProjectDataApiService) {
    this._projectDataSubject$ = new BehaviorSubject<AnalysisResultsDTO>({
      projectName: '',
      modules: [],
      components: [],
      injectables: [],
      directives: [],
      pipes: [],
      routes: [],
      applicationGraph: {
        nodes: [],
        edges: []
      }
    });
    this._setSelectors();
  }

  private _setSelectors(): void {
    this.projectData$ = this._projectDataSubject$.asObservable().pipe(takeUntil(this._componentDestroyed$));
    this.loadingData$ = this._loadingDataSubject$.asObservable().pipe(takeUntil(this._componentDestroyed$));

    this.projectName$ = this.projectData$.pipe(map((projectData: AnalysisResultsDTO) => projectData.projectName ?? 'Unnamed Project'));
    this.projectGraph$ = this.projectData$.pipe(map((projectData: AnalysisResultsDTO) => ({
      nodes: projectData.applicationGraph.nodes,
      edges: projectData.applicationGraph.edges
    })));
  }

  public analyzeProject(analysisRequest: ProjectAnalysisRequest): void {
    console.log('STARTING');
    this._loadingDataSubject$.next(true);
    this._projectDataApi
      .analyzeProject(analysisRequest)
      .pipe(takeUntil(this._componentDestroyed$))
      .subscribe((analysisResults: AnalysisResultsDTO) => {
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
