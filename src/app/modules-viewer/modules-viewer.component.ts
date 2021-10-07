import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalConfig } from '@stratiods/modal';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectDataService } from '../shared/state/project-data.service';
import { Router } from '@angular/router';
import { TabCellConfig } from '@stratiods/tab';
import { ApplicationGraph } from '../../../app/typescript-parser/typescript-parser.model';

export interface IAngularMetadataAggregations {
  module: number;
  component: number;
  directive: number;
  pipe: number;
  service: number;
}

@Component({
  selector: 'app-modules-viewer',
  templateUrl: './modules-viewer.component.html',
  styleUrls: ['./modules-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulesViewerComponent implements OnInit, OnDestroy {

  public sectionTabs: TabCellConfig[];
  public tsConfigControl: FormControl;
  public packageJsonControl: FormControl;
  public loadProjectModalConfig: ModalConfig;
  public selectedTab$: BehaviorSubject<string> = new BehaviorSubject<string>('overview');
  public showLoadProjectModal$: Subject<boolean> = new Subject<boolean>();
  public applicationGraph$: Observable<ApplicationGraph> = new Observable<ApplicationGraph>();
  public routesGraph$: Observable<ApplicationGraph> = new Observable<ApplicationGraph>();

  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(
    public projectData: ProjectDataService,
    private _cd: ChangeDetectorRef,
    private _electron: ElectronService,
    private _router: Router
  ) {
    this.sectionTabs = [
      { id: 'overview', text: 'Overview' },
      { id: 'graph', text: 'Graph' },
      { id: 'routes', text: 'Routes' }
    ];
    this.tsConfigControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/tsconfig.json');
    this.packageJsonControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/package.json');
    this.loadProjectModalConfig = {
      type: 'custom',
      onlyActionButton: true
    };

    this.applicationGraph$ = this.projectData.projectGraph$
      .pipe(
        takeUntil(this._componentDestroyed$),
        filter((applicationGraph: ApplicationGraph) => !!applicationGraph.nodes.length && !!applicationGraph.edges.length)
      );

    this.routesGraph$ = this.projectData.routesGraph$
      .pipe(
        takeUntil(this._componentDestroyed$),
        filter((routesGraph: ApplicationGraph) => !!routesGraph.nodes.length && !!routesGraph.edges.length)
      );
  }

  public requestResults(): void {
    this.showLoadProjectModal$.next(false);
    this.projectData.analyzeProject({
      tsConfigPath: this.tsConfigControl.value,
      packageJsonPath: this.packageJsonControl.value
    });
  }

  public ngOnInit(): void {
    if (!this.projectData.checkIsReady()) {
      this._router.navigate(['home']);
    }
  }

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();
  }
}
