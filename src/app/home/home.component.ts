import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import * as vis from 'vis-network';
import { DataSet } from 'vis-data';
import { IdType, Options } from 'vis-network';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public urlControl: FormControl;
  public loadingGraph$: Subject<boolean> = new Subject<boolean>();

  private network: vis.Network;
  private nodesDataset: DataSet<vis.Node>;
  private edgesDataset: DataSet<vis.Edge>;
  private highlightActive = false;
  private allNodes: any[] = [];

  constructor(private cd: ChangeDetectorRef, private electron: ElectronService) {
    this.urlControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/src');
  }

  ngOnInit(): void {
    console.log('HomeComponent INIT 2');
  }

  public requestResults(): void {
    this.electron.ipcRenderer.on('results', (event, _results) => {
      console.log(_results);
      const container = document.getElementById('graph');
      this.nodesDataset = new DataSet(_results.nodes);
      this.edgesDataset = new DataSet(_results.edges);
      const data = { nodes: this.nodesDataset, edges: this.edgesDataset };
      const options: Options = {
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
      this.allNodes = this.nodesDataset.get({ returnType: 'Object' }) as any;

      this.network.on('click', this.neighbourhoodHighlight.bind(this));
      this.loadingGraph$.next(false);
      this.cd.detectChanges();
    });
    this.loadingGraph$.next(true);
    this.electron.ipcRenderer.send('requestResults', this.urlControl.value);
  }

  private neighbourhoodHighlight(params) {
    // if something is selected:
    if (params.nodes.length > 0) {
      this.highlightActive = true;
      let i = 0;
      let j = 0;
      const selectedNode = params.nodes[0];
      const degrees = 1;

      // mark all nodes as hard to read.
      // eslint-disable-next-line guard-for-in
      for (const nodeId in this.allNodes) {
        this.allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
        if (this.allNodes[nodeId].hiddenLabel === undefined) {
          this.allNodes[nodeId].hiddenLabel = this.allNodes[nodeId].label;
          this.allNodes[nodeId].label = undefined;
        }
      }
      const connectedNodes = this.network.getConnectedNodes(selectedNode, 'to');
      let allConnectedNodes = [];

      // get the second degree nodes
      for (i = 1; i < degrees; i++) {
        for (j = 0; j < connectedNodes.length; j++) {
          if (isIdType(connectedNodes[j])) {
            allConnectedNodes = allConnectedNodes.concat(this.network.getConnectedNodes(connectedNodes[j] as IdType, 'to'));
          }
        }
      }

      // all second degree nodes get a different color and their label back
      for (i = 0; i < allConnectedNodes.length; i++) {
        this.allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
        if (this.allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
          this.allNodes[allConnectedNodes[i]].label =
            this.allNodes[allConnectedNodes[i]].hiddenLabel;
          this.allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
        }
      }

      // all first degree nodes get their own color and their label back
      for (i = 0; i < connectedNodes.length; i++) {
        if (isIdType(connectedNodes[i])) {
          this.allNodes[connectedNodes[i] as IdType].color = '#D2E5FF';
          if (this.allNodes[connectedNodes[i] as IdType].hiddenLabel !== undefined) {
            this.allNodes[connectedNodes[i] as IdType].label =
              this.allNodes[connectedNodes[i] as IdType].hiddenLabel;
            this.allNodes[connectedNodes[i] as IdType].hiddenLabel = undefined;
          }
        }
      }

      // the main node gets its own color and its label back.
      this.allNodes[selectedNode].color = '#D2E5FF';
      if (this.allNodes[selectedNode].hiddenLabel !== undefined) {
        this.allNodes[selectedNode].label = this.allNodes[selectedNode].hiddenLabel;
        this.allNodes[selectedNode].hiddenLabel = undefined;
      }
    } else if (this.highlightActive === true) {
      // reset all nodes
      // eslint-disable-next-line guard-for-in
      for (const nodeId in this.allNodes) {
        this.allNodes[nodeId].color = '#D2E5FF';
        if (this.allNodes[nodeId].hiddenLabel !== undefined) {
          this.allNodes[nodeId].label = this.allNodes[nodeId].hiddenLabel;
          this.allNodes[nodeId].hiddenLabel = undefined;
        }
      }
      this.highlightActive = false;
    }

    // transform the object into an array
    const updateArray = [];
    for (const nodeId in this.allNodes) {
      if (this.allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(this.allNodes[nodeId]);
      }
    }
    this.nodesDataset.update(updateArray);

    function isIdType(value: IdType | { fromId: IdType; toId: IdType }): value is IdType {
      return typeof value === 'string' || typeof value === 'number';

    }
  }
}
