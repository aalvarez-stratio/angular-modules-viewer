import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import * as vis from 'vis-network';
import { IdType, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModalConfig } from '@stratiods/modal';
import { NpaOption } from '@stratiods/core';
import { distinctUntilChanged, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { NpaDropdownConfig } from '@stratiods/dropdown';
import { ITypescriptParserResults } from '../../../app/typescript-parser/typescript-parser-results';
import fs from 'fs';

export interface IAngularMetadataAggregations {
  module: number;
  component: number;
  directive: number;
  pipe: number;
  service: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnDestroy {

  public searchControl: FormControl;
  public urlControl: FormControl;
  public loadProjectModalConfig: ModalConfig;
  public dropdownConfig: NpaDropdownConfig;
  public loadingGraph$: Subject<boolean> = new Subject<boolean>();
  public showLoadProjectModal$: Subject<boolean> = new Subject<boolean>();
  public showSearchOptions$: Subject<boolean> = new Subject<boolean>();
  public showGraphControls$: Subject<boolean> = new Subject<boolean>();
  public dropdownKeyboardEvents$: Subject<KeyboardEvent> = new Subject();
  public searchOptions$: BehaviorSubject<NpaOption[]> = new BehaviorSubject<NpaOption[]>([]);
  public graphAggregations$: BehaviorSubject<IAngularMetadataAggregations> = new BehaviorSubject<IAngularMetadataAggregations>(null);

  private _network: vis.Network;
  private _nodesDataset: DataSet<vis.Node>;
  private _edgesDataset: DataSet<vis.Edge>;
  private _highlightActive: boolean = false;
  private _canFilterByEnter: boolean = false;
  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private _cd: ChangeDetectorRef, private _electron: ElectronService) {
    this.searchControl = new FormControl('');
    this.urlControl = new FormControl('/home/aalvarez/Proyectos/governance-ui');
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
    this._electron.ipcRenderer.once('results', (event, _results) => {
      const container = document.getElementById('graph');
      this._nodesDataset = new DataSet(_results.nodes.filter(n => n.group !== 'component'));
      this._edgesDataset = new DataSet(_results.edges);
      const data = { nodes: this._nodesDataset, edges: this._edgesDataset };
      const options: Options = {
        groups: {
          module: {
            color: {
              background: '#b9d8f9',
              border: '#0776df'
            },
            shape: 'box',
            margin: { bottom: 15, top: 15, left: 15, right: 15 }
          },
          component: {
            color: {
              background: '#bae8be',
              border: '#1db540'
            },
            shape: 'box',
            margin: { bottom: 15, top: 15, left: 15, right: 15 }
          },
          directive: {
            color: {
              background: '#f9e0ff',
              border: '#bc3cf9'
            },
            shape: 'box',
            margin: { bottom: 15, top: 15, left: 15, right: 15 }
          },
          pipe: {
            color: {
              background: '#ffe2db',
              border: '#ef4034'
            },
            shape: 'box',
            margin: { bottom: 15, top: 15, left: 15, right: 15 }
          },
          injectable: {
            color: {
              background: '#ffe3c7',
              border: '#d16e34'
            },
            shape: 'box',
            margin: { bottom: 15, top: 15, left: 15, right: 15 }
          },
          hidden: {
            color: {
              background: '#eaeff5',
              border: '#eaeff5'
            }
          }
        },
        physics: {
          enabled: false
        },
        layout: {
          hierarchical: {
            direction: 'UD',
            sortMethod: 'directed',
            shakeTowards: 'leaves',
            nodeSpacing: 300,
            levelSeparation: 450
          }
        }
      };
      this._network = new vis.Network(container, data, options);
      // this._network.setOptions({ layout: { hierarchical: { enabled: false } } });

      this._network.on('click', this.neighbourhoodHighlight.bind(this));
      this.loadingGraph$.next(false);
      this.showGraphControls$.next(true);
      this.graphAggregations$.next({
        module: this._nodesDataset.get({ filter: (item) => item.group === 'module' }).length,
        component: this._nodesDataset.get({ filter: (item) => item.group === 'component' }).length,
        service: this._nodesDataset.get({ filter: (item) => item.group === 'service' }).length,
        directive: this._nodesDataset.get({ filter: (item) => item.group === 'directive' }).length,
        pipe: this._nodesDataset.get({ filter: (item) => item.group === 'pipe' }).length,
      });
      this._cd.detectChanges();
      setTimeout(() => {
        this._network.stabilize(10);
        this._network.focus('AppModule', { scale: 0.7, animation: true });
      });
    });
    this.searchControl.setValue('');
    this.showLoadProjectModal$.next(false);
    this.showGraphControls$.next(false);
    this.loadingGraph$.next(true);
    this._electron.ipcRenderer.send('requestResults', this.urlControl.value);
  }

  public onKeyboardEmit(event: KeyboardEvent): void {
    this.dropdownKeyboardEvents$.next(event);

    if (this._canFilterByEnter && event.key === 'Enter') {
      this.processSearchValue(this.searchControl.value);
      this.showSearchOptions$.next(false);
    }
  }

  public processSearchValue(search: string): void {
    const _results: vis.Node[] = this._nodesDataset.get({
      filter: (node: vis.Node) => String(node.id).toLowerCase().includes(search.toLowerCase())
    });
    if (_results.length) {
      if (_results.length === 1) {
        this._network.focus(_results.pop().id, { scale: 0.7, animation: true });
      } else {
        this._nodesDataset.update(this._nodesDataset.get().map((node: vis.Node) => ({
          ...node,
          hidden: _results.every((r: vis.Node) => r.id !== node.id)
        })));
      }
    }

  }

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();
  }

  private neighbourhoodHighlight(params) {
    const allNodes = this._nodesDataset.get({ returnType: 'Object' }) as any;
    const allEdges = this._edgesDataset.get({ returnType: 'Object' }) as any;
    // if something is selected:
    if (params.nodes.length > 0) {
      this._highlightActive = true;
      const selectedNode = params.nodes[0];

      // mark all nodes as hard to read.
      // eslint-disable-next-line guard-for-in
      for (const nodeId in allNodes) {
        if (!allNodes[nodeId].hiddenLabel && !allNodes[nodeId].hiddenGroup) {
          allNodes[nodeId] = {
            ...allNodes[nodeId],
            group: 'hidden',
            hiddenGroup: allNodes[nodeId].group,
            hiddenLabel: allNodes[nodeId].label,
            opacity: 0.2,
            label: undefined
          };
        }
      }
      const connectedNodes = this._network.getConnectedNodes(selectedNode, 'to') as IdType[];

      // all first degree nodes get their own color and their label back
      for (const connectedNode of connectedNodes) {
        if (allNodes[connectedNode].hiddenLabel && allNodes[connectedNode].hiddenGroup) {
          allNodes[connectedNode] = {
            ...allNodes[connectedNode],
            group: allNodes[connectedNode].hiddenGroup,
            label: allNodes[connectedNode].hiddenLabel,
            opacity: 1,
            hiddenLabel: undefined,
            hiddenGroup: undefined
          };

          for (const connectedEdge of this._network.getConnectedEdges(connectedNode)) {
            if (allEdges[connectedEdge].from === selectedNode) {
              allEdges[connectedEdge].color = { inherit: true };
              allEdges[connectedEdge].opacity = 1;
            } else {
              allEdges[connectedEdge].color = '#eaeff5';
              allEdges[connectedEdge].opacity = 0.2;
            }
          }
        }
      }

      // the main node gets its own color and its label back.
      if (allNodes[selectedNode].hiddenLabel && allNodes[selectedNode].hiddenGroup) {
        allNodes[selectedNode] = {
          ...allNodes[selectedNode],
          group: allNodes[selectedNode].hiddenGroup,
          label: allNodes[selectedNode].hiddenLabel,
          opacity: 1,
          hiddenLabel: undefined,
          hiddenGroup: undefined
        };
      }
    } else if (this._highlightActive === true) {
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes[nodeId].hiddenLabel && allNodes[nodeId].hiddenGroup) {
          allNodes[nodeId] = {
            ...allNodes[nodeId],
            group: allNodes[nodeId].hiddenGroup,
            label: allNodes[nodeId].hiddenLabel,
            opacity: 1,
            hiddenLabel: undefined,
            hiddenGroup: undefined
          };
        }
      }
      // eslint-disable-next-line guard-for-in
      for (const edgeId in allEdges) {
        allEdges[edgeId] = {
          ...allEdges[edgeId],
          opacity: 1,
          color: { inherit: 'to' }
        };
      }
      this._highlightActive = false;
    }
    this._edgesDataset.update(Object.values(allEdges));
    this._nodesDataset.update(Object.values(allNodes));
  }

  private _getAutocomplete(filter: string): void {
    const _filter: string = String(filter).trim();
    const _results: string[] = this._nodesDataset.get({
      filter: (node: vis.Node) => String(node.id).toLowerCase().includes(_filter.toLowerCase())
    }).map((node: vis.Node) => String(node.id));

    if (_filter?.length > 2) {
      if (_results.length) {
        this.searchOptions$.next(_results.slice(0, 10).map((r: string) => ({ label: r, value: r })));
        this._canFilterByEnter = true;
      } else {
        this.searchOptions$.next([{
          label: 'No results match.',
          value: '',
          unselectable: true,
          color: 'npa-color--space-6'
        }]);
        this._canFilterByEnter = false;
      }
    } else {
      this.searchOptions$.next([{
        label: 'Please, write at least 3 character.',
        value: '',
        unselectable: true,
        color: 'npa-color--space-6'
      }]);
      this._canFilterByEnter = false;
    }
    this.showSearchOptions$.next(true);
  }
}
