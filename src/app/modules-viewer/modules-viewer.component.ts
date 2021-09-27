import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalConfig } from '@stratiods/modal';
import { NpaDropdownConfig } from '@stratiods/dropdown';
import { BehaviorSubject, Subject } from 'rxjs';
import { NpaOption } from '@stratiods/core';
import GraphManager from '../home/graph-manager/graph-manager';
import { ElectronService } from 'ngx-electron';
import { HttpClient, HttpParams } from '@angular/common/http';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { AnalysisResults, ProjectGraph } from '../../../app/typescript-parser/typescript-parser-results';
import * as vis from 'vis-network';
import { ProjectDataApiService } from '../shared/api/project-data-api.service';
import { ProjectDataService } from '../shared/state/project-data.service';
import { Router } from '@angular/router';

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

  public searchControl: FormControl;
  public tsConfigControl: FormControl;
  public packageJsonControl: FormControl;
  public loadProjectModalConfig: ModalConfig;
  public dropdownConfig: NpaDropdownConfig;
  public showLoadProjectModal$: Subject<boolean> = new Subject<boolean>();
  public showSearchOptions$: Subject<boolean> = new Subject<boolean>();
  public showGraphControls$: Subject<boolean> = new Subject<boolean>();
  public dropdownKeyboardEvents$: Subject<KeyboardEvent> = new Subject();
  public searchOptions$: BehaviorSubject<NpaOption[]> = new BehaviorSubject<NpaOption[]>([]);
  public graphAggregations$: BehaviorSubject<IAngularMetadataAggregations> = new BehaviorSubject<IAngularMetadataAggregations>(null);

  private _noResultsOption: NpaOption = {
    label: 'No results match.',
    value: '',
    unselectable: true,
    color: 'npa-color--space-6'
  };
  private _moreCharactersNeededOption: NpaOption = {
    label: 'Please, write at least 3 character.',
    value: '',
    unselectable: true,
    color: 'npa-color--space-6'
  };
  private _graphManager: GraphManager;
  private _canFilterByEnter: boolean = false;
  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(
    public projectData: ProjectDataService,
    private _cd: ChangeDetectorRef,
    private _electron: ElectronService,
    private _router: Router
  ) {
    this.searchControl = new FormControl('');
    this.tsConfigControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/tsconfig.json');
    this.packageJsonControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/package.json');
    this.loadProjectModalConfig = {
      type: 'custom',
      onlyActionButton: true
    };
    this.dropdownConfig = {
      elementRelative: 'graph-manager',
      elementReference: { name: 'search', type: 'id' },
      clickOutsideApply: true,
      width: 'trigger'
    };
    this.showGraphControls$.next(true);

    this.projectData.projectGraph$
      .pipe(
        takeUntil(this._componentDestroyed$),
        filter((projectGraph: ProjectGraph) => !!projectGraph.nodes.length && !!projectGraph.edges.length)
      )
      .subscribe((projectGraph: ProjectGraph) => {
        this._processPath(projectGraph);
      });

    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._componentDestroyed$)
      )
      .subscribe((search: string,) => {
        if (search) {
          this._getAutocomplete(search);
        } else {
          this.showSearchOptions$.next(false);
        }
      });
  }

  public requestResults(): void {
    this.searchControl.setValue('');
    this.showLoadProjectModal$.next(false);
    this.showGraphControls$.next(false);

    this.projectData.analyzeProject({
      tsConfigPath: this.tsConfigControl.value,
      packageJsonPath: this.packageJsonControl.value
    });
  }

  public onKeyboardEmit(event: KeyboardEvent): void {
    this.dropdownKeyboardEvents$.next(event);

    if (this._canFilterByEnter && event.key === 'Enter') {
      this.processSearchValue(this.searchControl.value);
      this.showSearchOptions$.next(false);
    }
  }

  public processSearchValue(search: string): void {
    const _results: vis.Node[] = this._graphManager.searchNodesById(search);
    if (_results.length === 1) {
      this._graphManager.focusNode(_results.pop().id);
    } else if (_results.length > 1) {
      this._graphManager.showOnlyThisNodes(_results);
    }
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

  private _getAutocomplete(moduleFilter: string): void {
    const _filter: string = String(moduleFilter).trim();
    const _results: string[] = this._graphManager.searchNodesById(_filter).map((node: vis.Node) => String(node.id));
    let _searchOptions: NpaOption[];

    if (_filter?.length > 2) {
      _searchOptions = _results.length ?
        _results.slice(0, 10).map((r: string) => ({ label: r, value: r })) : [{ ...this._noResultsOption }];
      this._canFilterByEnter = !!_results.length;
    } else {
      _searchOptions = [{ ...this._moreCharactersNeededOption }];
      this._canFilterByEnter = false;
    }

    this.searchOptions$.next(_searchOptions);
    this.showSearchOptions$.next(true);
  }

  private _processPath(results: ProjectGraph): void {
    const container = document.getElementById('graph');
    this._graphManager = new GraphManager(results.nodes, results.edges, container);

    console.log('NODES --> ' + results.nodes.length);
    console.log('EDGES --> ' + results.edges.length);

    this.showGraphControls$.next(true);
    this.graphAggregations$.next({
      module: this._graphManager.getTotalNodesByGroup('module'),
      component: this._graphManager.getTotalNodesByGroup('component'),
      service: this._graphManager.getTotalNodesByGroup('service'),
      directive: this._graphManager.getTotalNodesByGroup('directive'),
      pipe: this._graphManager.getTotalNodesByGroup('pipe'),
    });
    this._cd.detectChanges();
  }

}
