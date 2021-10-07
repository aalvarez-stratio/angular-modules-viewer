import { Edge, Node } from 'vis-network/peer';
import { RoutePath } from './typescript-parser.model';

export class TypescriptParserResults {
  private _projectName: string;
  private readonly _nodes: Node[];
  private readonly _edges: Edge[];
  private readonly _routePaths: RoutePath[];

  constructor() {
    this._projectName = '';
    this._nodes = [];
    this._edges = [];
    this._routePaths = [];
  }

  getNodes(): Node[] {
    return this._nodes;
  }

  getEdges(): Edge[] {
    return this._edges;
  }

  getRoutePaths(): RoutePath[] {
    return this._routePaths;
  }

  getProjectName(): string {
    return this._projectName;
  }

  addNodes(nodeIds: string[], group: string = 'module'): void {
    for (const _nodeId of nodeIds) {
      this.addNode(_nodeId, group);
    }
  }

  addNode(nodeId: string, group: string = 'module', label: string = ''): void {
    if (this._nodes.every(n => n.id !== nodeId)) {
      this._nodes.push({
        id: nodeId,
        label: label || nodeId,
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

  addRoutePath(newRoutePath: RoutePath): void {
    if (!this._routePaths.find(routePath => routePath.path === newRoutePath.path)) {
      this._routePaths.push(newRoutePath);
    }
  }

  setProjectName(projectName: string): void {
    this._projectName = projectName;
  }
}
