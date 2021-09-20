import { Edge, Node } from 'vis-network/peer';

export interface ITypescriptParserResults {
  nodes: Node[];
  edges: Edge[];
}

export default class TypescriptParserResults {
  private readonly _nodes: Node[];
  private readonly _edges: Edge[];

  constructor() {
    this._nodes = [];
    this._edges = [];
  }

  getNodes(): Node[] {
    return this._nodes;
  }

  getEdges(): Edge[] {
    return this._edges;
  }

  getResult(): ITypescriptParserResults {
    return {
      nodes: this.getNodes(),
      edges: this.getEdges()
    }
  }

  addNodes(nodeIds: string[], group: string = 'module'): void {
    for (const _nodeId of nodeIds) {
      this.addNode(_nodeId, group);
    }
  }

  addNode(nodeId: string, group: string = 'module'): void {
    if (this._nodes.every(n => n.id !== nodeId)) {
      this._nodes.push({
        id: nodeId,
        label: nodeId,
        group
      });
    }
  }

  addEdge(from: string, to: string, type: string = 'default'): void {
    if (this._edges.every(e => e.from !== from || e.to !== to)) {
      this._edges.push({
        from,
        to,
        dashes: type === 'lazyLoad',
        arrows: 'to',
        color: { inherit: 'to' }
      });
    }
  }

  addEdgesToNode(fromNodeName: string, toNodeNames: string[], edgeType: string = 'default'): void {
    for (const toNodeName of toNodeNames) {
      this.addEdge(fromNodeName, toNodeName, edgeType);
    }
  }
}
