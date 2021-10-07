import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { NpaOption } from '@stratiods/core';
import { IAngularMetadataAggregations } from '../modules-viewer.component';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import * as vis from 'vis-network';
import GraphManagerService from '../../shared/graph-manager.service';
import { NpaDropdownConfig } from '@stratiods/dropdown';
import { ApplicationGraph } from '../../../../app/typescript-parser/typescript-parser.model';

@Component({
  selector: 'app-assets-graph',
  templateUrl: './assets-graph.component.html',
  styleUrls: ['./assets-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetsGraphComponent implements OnChanges, OnDestroy {

  @Input() applicationGraph: ApplicationGraph;

  public searchControl: FormControl;
  public dropdownConfig: NpaDropdownConfig;
  public dropdownKeyboardEvents$: Subject<KeyboardEvent> = new Subject();
  public showSearchOptions$: Subject<boolean> = new Subject<boolean>();
  public showGraphControls$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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
  private _canFilterByEnter: boolean = false;
  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private _graphManager: GraphManagerService) {
    console.log('constructor');
    this.searchControl = new FormControl('');
    this.dropdownConfig = {
      elementRelative: 'graph-manager',
      elementReference: { name: 'search', type: 'id' },
      clickOutsideApply: true,
      width: 'trigger'
    };

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

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.applicationGraph?.currentValue) {
      this.searchControl.setValue('');
      this.showGraphControls$.next(false);
      console.log('changes');
      this._processProjectGraph(changes.applicationGraph.currentValue);
    }
  }

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();
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

  private _processProjectGraph(results: ApplicationGraph): void {
    const container = document.getElementById('graph');
    this._graphManager.setGraph(results.nodes, results.edges, container);

    console.log('NODES --> ' + results.nodes.length);
    console.log('EDGES --> ' + results.edges.length);

    this.showGraphControls$.next(true);
    this.graphAggregations$.next({
      module: this._graphManager.getTotalNodesByGroup('module'),
      component: this._graphManager.getTotalNodesByGroup('component'),
      service: this._graphManager.getTotalNodesByGroup('injectable'),
      directive: this._graphManager.getTotalNodesByGroup('directive'),
      pipe: this._graphManager.getTotalNodesByGroup('pipe'),
    });
  }
}
