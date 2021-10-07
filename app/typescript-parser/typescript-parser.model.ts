import { Edge, Node } from 'vis-network/peer';

export type AnalysisResultsDTO = {
  projectName: string;
  routes: RoutePath[];
  modules: NgModuleMetadataDTO[];
  components: string[];
  injectables: string[];
  directives: string[];
  pipes: string[];
  applicationGraph: ApplicationGraph
};

export type ApplicationGraph = {
  nodes: Node[];
  edges: Edge[];
};

export type RoutePath = {
  path: string;
  associatedAsset: string;
  fromNodeName: string;
};

export type BackendAnalysisRequest = { tsConfigPath: string; packageJsonPath: string; };

export type NgModuleMetadataDTO = {
  name: string;
  declarations: string[];
  imports: string[];
  providers: string[];
  exports: string[];
}

export type NgModuleTree = {
  moduleName: string;
  isRoutingModule: boolean;
  declarations: NgModuleDeclaration[];
  imports: NgModuleTree[];
  routes: NgRouteTree[];
  providers: string[];
  exports: string[];
}

export type NgRouteTree = {
  path: string;
  parentRouteModule?: string;
  component?: string;
  module?: NgModuleTree;
  children?: NgRouteTree[];
}

export type NgModuleDeclaration = {
  name: string;
  type: 'component' | 'pipe'
}
