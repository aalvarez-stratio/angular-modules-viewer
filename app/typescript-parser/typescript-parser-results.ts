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

  addNode(nodeId: string): void {
    if (this._nodes.every(n => n.id !== nodeId)) {
      this._nodes.push({
        id: nodeId,
        label: nodeId,
        shape: 'box',
        margin: { bottom: 15, top: 15, left: 15, right: 15 }
      });
    }
  }

  addEdge(from: string, to: string): void {
    if (this._edges.every(e => e.from !== from || e.to !== to)) {
      this._edges.push({
        from,
        to,
        arrows: 'to'
      });
    }
  }

  addEdges(fromNodeName: string, toNodeNames: string[]): void {
    for (const toNodeName of toNodeNames) {
      this.addEdge(fromNodeName, toNodeName);
    }
  }
}
