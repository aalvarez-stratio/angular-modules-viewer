import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import * as vis from 'vis-network';
import { DataSet } from 'vis-data';
import { IdType, Options } from 'vis-network';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

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
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public urlControl: FormControl;
  public loadingGraph$: Subject<boolean> = new Subject<boolean>();
  public graphAggregations$: BehaviorSubject<IAngularMetadataAggregations> = new BehaviorSubject<IAngularMetadataAggregations>(null);

  private network: vis.Network;
  private nodesDataset: DataSet<vis.Node>;
  private edgesDataset: DataSet<vis.Edge>;
  private highlightActive = false;

  constructor(private cd: ChangeDetectorRef, private electron: ElectronService) {
    this.urlControl = new FormControl('/home/aalvarez/Proyectos/governance-ui');
  }

  public requestResults(): void {
    this.electron.ipcRenderer.on('results', (event, _results) => {
      const container = document.getElementById('graph');
      this.nodesDataset = new DataSet(_results.nodes);
      this.edgesDataset = new DataSet(_results.edges);
      const data = { nodes: this.nodesDataset, edges: this.edgesDataset };
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
        layout: {
          hierarchical: {
            direction: 'UD',
            sortMethod: 'directed',
            shakeTowards: 'roots',
            blockShifting: false,
            nodeSpacing: 300,
            levelSeparation: 450
          },
        },
        physics: {
          hierarchicalRepulsion: {
            avoidOverlap: 50,
          },
        }
      };
      this.network = new vis.Network(container, data, options);
      this.network.setOptions({ physics: false });

      this.network.on('click', this.neighbourhoodHighlight.bind(this));
      this.loadingGraph$.next(false);
      this.graphAggregations$.next({
        module: this.nodesDataset.get({ filter: (item) => item.group === 'module' }).length,
        component: this.nodesDataset.get({ filter: (item) => item.group === 'component' }).length,
        service: this.nodesDataset.get({ filter: (item) => item.group === 'service' }).length,
        directive: this.nodesDataset.get({ filter: (item) => item.group === 'directive' }).length,
        pipe: this.nodesDataset.get({ filter: (item) => item.group === 'pipe' }).length,
      });
      this.cd.detectChanges();
    });
    this.loadingGraph$.next(true);
    this.electron.ipcRenderer.send('requestResults', this.urlControl.value);
  }

  private neighbourhoodHighlight(params) {
    const allNodes = this.nodesDataset.get({ returnType: 'Object' }) as any;
    const allEdges = this.edgesDataset.get({ returnType: 'Object' }) as any;
    // if something is selected:
    if (params.nodes.length > 0) {
      this.highlightActive = true;
      const selectedNode = params.nodes[0];
      const degrees = 1;

      // mark all nodes as hard to read.
      // eslint-disable-next-line guard-for-in
      for (const nodeId in allNodes) {
        if (!allNodes[nodeId].hiddenLabel && !allNodes[nodeId].hiddenGroup) {
          allNodes[nodeId] = {
            ...allNodes[nodeId],
            group: 'hidden',
            hiddenGroup: allNodes[nodeId].group,
            hiddenLabel: allNodes[nodeId].label,
            label: undefined
          };
        }
      }
      const connectedNodes = this.network.getConnectedNodes(selectedNode, 'to') as IdType[];

      // all first degree nodes get their own color and their label back
      for (const connectedNode of connectedNodes) {
        if (allNodes[connectedNode].hiddenLabel && allNodes[connectedNode].hiddenGroup) {
          allNodes[connectedNode] = {
            ...allNodes[connectedNode],
            group: allNodes[connectedNode].hiddenGroup,
            label: allNodes[connectedNode].hiddenLabel,
            hiddenLabel: undefined,
            hiddenGroup: undefined
          };

          for (const connectedEdge of this.network.getConnectedEdges(connectedNode)) {
            if (allEdges[connectedEdge].from === connectedNode) {
              this.edgesDataset.updateOnly({ id: connectedEdge, color: '#eaeff5' });
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
          hiddenLabel: undefined,
          hiddenGroup: undefined
        };
      }
    } else if (this.highlightActive === true) {
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes[nodeId].hiddenLabel && allNodes[nodeId].hiddenGroup) {
          allNodes[nodeId] = {
            ...allNodes[nodeId],
            group: allNodes[nodeId].hiddenGroup,
            label: allNodes[nodeId].hiddenLabel,
            hiddenLabel: undefined,
            hiddenGroup: undefined
          };
        }
      }
      // eslint-disable-next-line guard-for-in
      for (const edgeId in allEdges) {
        allEdges[edgeId] = {
          ...allEdges[edgeId],
          color: { inherit: 'to' }
        };
      }
      this.highlightActive = false;
      this.edgesDataset.update(Object.values(allEdges));
    }

    this.nodesDataset.update(Object.values(allNodes));
  }
}
