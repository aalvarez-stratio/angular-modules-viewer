import { TypescriptParserResults } from './typescript-parser-results';
import {
  ArrayLiteralExpression,
  CallExpression,
  ClassDeclaration,
  Decorator,
  Identifier,
  Node,
  ObjectLiteralElementLike,
  Project,
  PropertyAssignment,
  SourceFile
} from 'ts-morph';
import * as fs from 'fs';
import {
  AnalysisResultsDTO,
  BackendAnalysisRequest,
  NgModuleMetadataDTO,
  NgModuleTree,
  NgRouteTree
} from './typescript-parser.model';

export class TypescriptParser {

  private _rootModuleClassName: string = '';
  private readonly _results: TypescriptParserResults;

  constructor() {
    this._results = new TypescriptParserResults();
  }

  analyzeProject(analysisRequest: BackendAnalysisRequest): Promise<[string, AnalysisResultsDTO]> {
    return Promise.all([
      this._getPackageJsonData(analysisRequest),
      this._getProjectModulesData(analysisRequest)
    ]);
  }

  private _getPackageJsonData(analysisRequest: BackendAnalysisRequest): Promise<string> {
    return new Promise<string>((resolve) => {
      fs.readFile(analysisRequest.packageJsonPath, (err, data) => {
        resolve(JSON.parse(String(data)).name ?? '');
      });
    });
  }

  private _getProjectModulesData(analysisRequest: BackendAnalysisRequest): Promise<AnalysisResultsDTO> {
    return new Promise<AnalysisResultsDTO>((resolve) => {
      const project = new Project({
        tsConfigFilePath: analysisRequest.tsConfigPath
      });

      const regex = /bootstrapModule\((.*)\)/;
      const _sourceFileText = project.getSourceFiles().find(p => p.getBaseName() === 'main.ts').getText();
      const _regexExec = regex.exec(_sourceFileText);
      if (_regexExec[1]) {
        console.log('ROOT MODULE ID --> ' + _regexExec[1]);
        this._rootModuleClassName = _regexExec[1];

        const _projectTree = this._buildTree(this._rootModuleClassName, project);
        fs.writeFile('treeResult.json', JSON.stringify(_projectTree), () => {
          console.log('WRITED!!!');
        });


        const _analysisResultsDTO: AnalysisResultsDTO = {
          projectName: '',
          modules: [],
          components: [],
          injectables: [],
          directives: [],
          pipes: [],
          routes: [],
          applicationGraph: {
            nodes: [],
            edges: []
          }
        };
        this._traverseNgModuleTree(_projectTree, (tree: NgModuleTree | NgRouteTree) => {
          if (this._isNgModuleTree(tree)) {
            console.log('NgModuleTree: ' + tree.moduleName);
            const _ngModule: NgModuleMetadataDTO = {
              name: tree.moduleName,
              imports: tree.imports.map(i => i.moduleName),
              exports: tree.exports,
              providers: tree.providers,
              declarations: tree.declarations.map(d => d.name)
            };
            _analysisResultsDTO.modules.push(_ngModule);
            this._results.addNode(_ngModule.name, 'module');

            for (const _declaration of tree.declarations) {
              if (_declaration.type === 'pipe') {
                _analysisResultsDTO.pipes.push(_declaration.name);
              } else {
                _analysisResultsDTO.components.push(_declaration.name);
              }
              this._results.addNode(_declaration.name, _declaration.type);
              this._results.addEdge(_ngModule.name, _declaration.name)
            }

            for (const _import of tree.imports) {
              this._results.addNode(_import.moduleName, 'module');
              this._results.addEdge(_ngModule.name, _import.moduleName)
            }

            for (const _provider of tree.providers) {
              this._results.addNode(_provider, 'injectable');
              this._results.addEdge(_ngModule.name, _provider)
            }
          }

          if (this._isNgRouteTree(tree)) {
            console.log('NgRouteTree: ' + tree.path);
            const _associatedAsset: string = tree.component ?? tree.module?.moduleName;
            _analysisResultsDTO.routes.push({
              path: tree.path,
              associatedAsset: _associatedAsset,
              fromNodeName: tree.parentRouteModule
            });

            this._results.addEdge(tree.parentRouteModule, _associatedAsset, tree.module?.moduleName ? 'lazyLoad' : 'default')
          }
        });

        _analysisResultsDTO.applicationGraph.nodes = this._results.getNodes();
        _analysisResultsDTO.applicationGraph.edges = this._results.getEdges();
        console.log(_analysisResultsDTO);
        resolve(_analysisResultsDTO);
      }
    });
  }

  private _isNgModuleTree(tree: any): tree is NgModuleTree {
    return typeof tree === 'object' && tree.moduleName;
  }

  private _isNgRouteTree(tree: any): tree is NgRouteTree {
    // We check against undefined because of empty paths.
    return typeof tree === 'object' && tree.path !== undefined;
  }

  private _traverseNgModuleTree(projectTree: NgModuleTree, cb: (tree: NgModuleTree | NgRouteTree) => any): void {
    if (projectTree) {
      cb(projectTree);

      if (projectTree.imports?.length) {
        for (const _import of projectTree.imports) {
          this._traverseNgModuleTree(_import, cb);
        }
      }

      if (projectTree.routes?.length) {
        for (const _route of projectTree.routes) {
          this._traverseRouteTree(_route, cb);
        }
      }
    }
  }

  private _traverseRouteTree(projectTree: NgRouteTree, cb: (tree: NgModuleTree | NgRouteTree) => any): void {
    if (projectTree) {
      cb(projectTree);

      if (projectTree.module) {
        this._traverseNgModuleTree(projectTree.module, cb);
      }

      if (projectTree.children?.length) {
        for (const _route of projectTree.children) {
          this._traverseRouteTree(_route, cb);
        }
      }
    }
  }

  private _findSourceFileByClassName(sourceFileName: string, project): SourceFile {
    return project.getSourceFiles().find(s => s.getClasses().some(c => c.getName() === sourceFileName));
  }

  private _findClassByName(className: string, sourceFile: SourceFile): ClassDeclaration {
    if (sourceFile) {
      return sourceFile.getClasses()
        .find(c => c.getName() === className);
    }

    return null;
  }

  private _buildTree(rootModuleName: string, project: Project): NgModuleTree {
    const _tree: Partial<NgModuleTree> = {};
    const _rootSourceFile: SourceFile = this._findSourceFileByClassName(rootModuleName, project);

    if (_rootSourceFile) {
      const _rootModuleClass: ClassDeclaration = this._findClassByName(rootModuleName, _rootSourceFile);
      const _rootNgModuleDecorator: Decorator = this._findNgModuleDecorator(_rootModuleClass);

      if (_rootNgModuleDecorator) {
        const _decoratorResults = this._processDecorator(_rootNgModuleDecorator);
        const {
          declarations: declarationsIdentifiers,
          imports: importsIdentifiers,
          providers: providersIdentifiers,
          exports: exportsIdentifiers
        } = _decoratorResults;

        _tree.moduleName = rootModuleName;
        _tree.declarations = declarationsIdentifiers.map(d => {
          const _declarationName: string = d.getText();
          let _declarationType: 'component' | 'pipe';
          if (Node.isIdentifier(d)) {
            const _declarationDefinition: Node = d.getDefinitionNodes()[0];
            if (Node.isClassDeclaration(_declarationDefinition)) {
              _declarationType = _declarationDefinition.getDecorator('Pipe') ? 'pipe' : 'component';
            }
          }

          return {
            name: _declarationName,
            type: _declarationType
          };
        });
        _tree.imports = [];
        _tree.providers = providersIdentifiers.map(d => d.getText());
        _tree.exports = exportsIdentifiers.map(d => d.getText());

        for (const _importIdentifier of importsIdentifiers) {
          if (Node.isCallExpression(_importIdentifier)) {
            const isForRootRoutes: boolean = !!/RouterModule\.forRoot\((.*)\)/.exec(_importIdentifier.getText()) && !!/RouterModule\.forRoot\((.*)\)/.exec(_importIdentifier.getText())[1];
            const isForChildRoutes: boolean = !!/RouterModule\.forChild\((.*)\)/.exec(_importIdentifier.getText()) && !!/RouterModule\.forChild\((.*)\)/.exec(_importIdentifier.getText())[1];
            if (isForRootRoutes || isForChildRoutes) {
              const _routesVariable = _importIdentifier.getArguments()[0];
              if (Node.isIdentifier(_routesVariable)) {
                const _definitionVariable = _routesVariable.getDefinitionNodes()[0];
                if (Node.isVariableDeclaration(_definitionVariable)) {
                  const _routesArray: ArrayLiteralExpression = _definitionVariable.getChildren().find(c => Node.isArrayLiteralExpression(c)) as ArrayLiteralExpression;
                  if (_routesArray) {
                    _tree.routes = this._processRoutes(rootModuleName, _routesArray, project);
                  }
                }
              }
            }
          }

          const _treeResult = this._buildTree(_importIdentifier.getText(), project);
          if (Object.keys(_treeResult).length) {
            _tree.imports.push(_treeResult);
          }
        }
      }
    }

    return _tree as NgModuleTree;
  }

  private _findNgModuleDecorator(classDeclaration: ClassDeclaration): Decorator {
    return classDeclaration.getDecorators().find(d => d.getName() === 'NgModule');
  }

  private _processDecorator(decorator: Decorator): Record<'declarations' | 'imports' | 'providers' | 'exports', Array<Identifier | CallExpression>> {
    const _decorator: any = decorator.getArguments().shift();
    if (Node.isObjectLiteralExpression(_decorator)) {
      return {
        declarations: this._getIdentifiersFromPropertyAssignment(_decorator.getProperty('declarations')),
        imports: this._getIdentifiersFromPropertyAssignment(_decorator.getProperty('imports')),
        providers: this._getIdentifiersFromPropertyAssignment(_decorator.getProperty('providers')),
        exports: this._getIdentifiersFromPropertyAssignment(_decorator.getProperty('exports'))
      };
    }
    return null;
  }

  private _getIdentifiersFromPropertyAssignment(propertyAssignment: ObjectLiteralElementLike): Array<Identifier | CallExpression> {
    const _results: Array<Identifier | CallExpression> = [];
    if (Node.isPropertyAssignment(propertyAssignment)) {
      propertyAssignment.getInitializer().forEachChild((c => {
        if (Node.isIdentifier(c) || Node.isCallExpression(c)) {
          _results.push(c);
        }
      }));
    }

    return _results;
  }

  // TODO: This function needs refactor.
  private _processRoutes(fromNodeName: string, routes: ArrayLiteralExpression, project: Project): NgRouteTree[] {
    let _routeTrees: NgRouteTree[] = [];
    for (const _route of routes.getElements()) {
      const _routeTree: Partial<NgRouteTree> = {};
      if (Node.isObjectLiteralExpression(_route)) {
        const _loadChildren = _route.getProperty('loadChildren');
        const _children = _route.getProperty('children');
        const _component = _route.getProperty('component');
        const _path = _route.getProperty('path');
        _routeTree.path = _path.getText();
        _routeTree.parentRouteModule = fromNodeName;
        if (_loadChildren || _children || _component) {
          if (_loadChildren) {
            const propertyValue = (_loadChildren as PropertyAssignment).getInitializer();
            _routeTree.module = this._buildTree(propertyValue.getText().split('.').pop().split(')')[0], project);
          }

          if (Node.isPropertyAssignment(_children)) {
            _routeTree.children = this._processRoutes(fromNodeName, _children.getInitializer() as ArrayLiteralExpression, project);
          }

          if (Node.isPropertyAssignment(_component)) {
            _routeTree.component = _component.getText();
          }
        }
      } else if (Node.isSpreadElement(_route)) {
        for (const _spreadElementToken of _route.getChildren()) {
          if (Node.isIdentifier(_spreadElementToken) && _spreadElementToken.getDefinitionNodes().length) {
            const _variableDeclaration = _spreadElementToken.getDefinitionNodes()[0];
            if (Node.isVariableDeclaration(_variableDeclaration)) {
              _routeTrees = [
                ..._routeTrees,
                ...this._processRoutes(fromNodeName, _variableDeclaration.getInitializer() as ArrayLiteralExpression, project)
              ];
            }
          }
        }
      }
      _routeTrees.push(_routeTree as NgRouteTree);
    }
    return _routeTrees;
  }
}
