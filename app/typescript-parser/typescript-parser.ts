import TypescriptParserResults from './typescript-parser-results';
import {
  Project,
  ArrayLiteralExpression,
  SourceFile,
  Decorator,
  Node,
  SpreadElement,
  PropertyAssignment
} from 'ts-morph';
import NgModuleMetadata from './ng-module-metadata';

export default class TypescriptParser {

  private readonly _ngModules: NgModuleMetadata[];
  private readonly _injectables: string[];
  private readonly _components: string[];
  private readonly _directives: string[];
  private readonly _pipes: string[];
  private readonly _results: TypescriptParserResults;

  constructor() {
    this._ngModules = [];
    this._injectables = [];
    this._components = [];
    this._directives = [];
    this._pipes = [];
    this._results = new TypescriptParserResults();
  }

  readFiles(path: string): Promise<TypescriptParserResults> {
    return new Promise<TypescriptParserResults>((resolve) => {
      // const project = new Project({
      //   tsConfigFilePath: path + '/tsconfig.json'
      // });
      const project = new Project();
      project.addSourceFilesFromTsConfig(path + '/tsconfig.json');
      for (const _sourceFile of project.getSourceFiles()) {

        this._searchClasses(_sourceFile);
        this._searchRoutes(_sourceFile);
      }
      this._addAngularMetadataToResults();
      resolve(this._results);
    });
  }

  private _searchClasses(sourceFile: SourceFile): void {
    for (const _class of sourceFile.getClasses()) {
      const _classDecorators: Decorator[] = _class.getDecorators();
      for (const _decorator of _classDecorators) {
        const _decoratorName: string = _decorator.getName();
        if (_decoratorName === 'NgModule') {
          this._ngModules.push(new NgModuleMetadata(_class.getName(), _decorator));
        } else if (_decoratorName === 'Injectable') {
          this._injectables.push(_class.getName());
        } else if (_decoratorName === 'Component') {
          this._components.push(_class.getName());
        } else if (_decoratorName === 'Directive') {
          this._directives.push(_class.getName());
        } else if (_decoratorName === 'Pipe') {
          this._pipes.push(_class.getName());
        }
      }
    }
  }

  private _addAngularMetadataToResults(): void {
    for (const _ngModule of this._ngModules) {
      this._results.addNode(_ngModule.name, 'module');
      this._results.addEdgesToNode(_ngModule.name, _ngModule.getDeclarations(), 'default');
      this._results.addEdgesToNode(_ngModule.name, _ngModule.getProviders(), 'default');
      this._results.addEdgesToNode(_ngModule.name, _ngModule.getImports(), 'default');
      this._results.addEdgesToNode(_ngModule.name, _ngModule.getExports(), 'default');
    }
    this._results.addNodes(this._injectables, 'injectable');
    this._results.addNodes(this._components, 'component');
    this._results.addNodes(this._directives, 'directive');
    this._results.addNodes(this._pipes, 'pipe');
  }

  private _searchRoutes(sourceFile: SourceFile): void {
    for (const _variableStatement of sourceFile.getVariableStatements()) {
      for (const _variableDeclaration of _variableStatement.getDeclarations()) {
        try {
          if (_variableDeclaration.getType()?.getAliasSymbol()?.getName() === 'Routes' || _variableDeclaration.getType().getText().endsWith('Routes')) {
            for (const _variableDeclarationChildren of _variableDeclaration.getChildren()) {
              this._processRoutes(sourceFile.getClasses()[0]?.getName() ?? '', _variableDeclarationChildren)
            }
          }
        } catch(e) {
          console.log('ERROR: Coudn\'t parse ' + _variableDeclaration.getName());
          console.log(e);
        }
      }
    }
  }

  private _processRoutes(fromNodeName: string, routes: Node): void {
    if (Node.isArrayLiteralExpression(routes)) {
      for (const _route of routes.getElements()) {
        if (Node.isObjectLiteralExpression(_route)) {
          const _loadChildren = _route.getProperty('loadChildren');
          const _children = _route.getProperty('children');
          if (_loadChildren && fromNodeName) {
            const propertyValue = (_loadChildren as PropertyAssignment).getInitializer()
            this._results.addEdgesToNode(
                fromNodeName,
                [propertyValue.getText().split('.').pop().split(')')[0]]
            )
          } else if (Node.isPropertyAssignment(_children)) {
            this._processRoutes(fromNodeName, _children.getInitializer())
          }
        } else if (Node.isSpreadElement(_route)) {
          for (const _spreadElementToken of _route.getChildren()) {
            if (Node.isIdentifier(_spreadElementToken) && _spreadElementToken.getDefinitionNodes().length) {
              const _variableDeclaration = _spreadElementToken.getDefinitionNodes()[0];
              if (Node.isVariableDeclaration(_variableDeclaration)) {
                this._processRoutes(fromNodeName, _variableDeclaration.getInitializer());
              }
            }
          }
        }
      }
    }
  }
}
