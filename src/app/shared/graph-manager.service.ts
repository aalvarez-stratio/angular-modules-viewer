import * as vis from 'vis-network';
import { DataSet } from 'vis-data';
import { graphOptions } from './configurations/graph-options';
import { IdType } from 'vis-network';
import { Injectable } from '@angular/core';

@Injectable()
export default class GraphManagerService {

  private _network: vis.Network;
  private _nodes: DataSet<vis.Node>;
  private _edges: DataSet<vis.Edge>;

  private _isPathHighlighted: boolean = false;

  constructor() {}

  public setGraph(nodes: vis.Node[], edges: vis.Edge[], container: HTMLElement) {
    this._nodes = new DataSet(nodes);
    this._edges = new DataSet(edges);
    const data = { nodes: this._nodes, edges: this._edges };
    this._network = new vis.Network(container, data, graphOptions);
    this._network.on('click', this.neighbourhoodHighlight.bind(this));

    setTimeout(() => {
      // this._network.stabilize();
      // this._network.focus('AppModule');
    }, 100);
  }

  public getTotalNodesByGroup(group: string): number {
    return this._nodes.get({ filter: (item) => item.group === group }).length;
  }

  public searchNodesById(search: string): vis.Node[] {
    return this._nodes.get({
      filter: (node: vis.Node) => String(node.id).toLowerCase().includes(search.toLowerCase())
    });
  }

  public focusNode(nodeId: vis.IdType): void {
    this._network.focus(nodeId, { scale: 0.7, animation: true });
  }

  public showOnlyThisNodes(nodes: vis.Node[]): void {
    this._nodes.update(this._nodes.get().map((node: vis.Node) => ({
      ...node,
      hidden: nodes.every((r: vis.Node) => r.id !== node.id)
    })));
  }

  private neighbourhoodHighlight(params) {
    const allNodes = this._nodes.get({ returnType: 'Object' }) as any;
    const allEdges = this._edges.get({ returnType: 'Object' }) as any;
    // if something is selected:
    if (params.nodes.length > 0) {
      this._isPathHighlighted = true;
      const selectedNode = params.nodes[0];

      console.time('preprocess');
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
      const connectedEdges = this._network.getConnectedEdges(selectedNode) as IdType[];

      for (const connectedEdge of connectedEdges) {
        if (allEdges[connectedEdge].to === selectedNode) {
          allEdges[connectedEdge].color = { inherit: true };
          allEdges[connectedEdge].opacity = 1;
        } else {
          allEdges[connectedEdge].color = '#eaeff5';
          allEdges[connectedEdge].opacity = 0.2;
        }
      }

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
    } else if (this._isPathHighlighted) {
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
      this._isPathHighlighted = false;
    }
    console.timeEnd('preprocess');
    console.time('update');
    this._edges.update(Object.values(allEdges));
    this._nodes.update(Object.values(allNodes));
    console.timeEnd('update');
  }
}
