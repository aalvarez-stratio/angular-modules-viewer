import { Decorator, Node } from 'ts-morph';

export class NgModuleMetadata {

  public readonly name: string;

  private readonly _declarations: string[];
  private readonly _imports: string[];
  private readonly _providers: string[];
  private readonly _exports: string[];

  constructor(name: string, decorator: Decorator) {
    this.name = name ?? 'UnknownModule';

    const _decorator: any = decorator.getArguments().shift();
    if (Node.isObjectLiteralExpression(_decorator)) {
      this._declarations = this._processPropertyAssignment(_decorator.getProperty('declarations'));
      this._imports = this._processPropertyAssignment(_decorator.getProperty('imports'));
      this._providers = this._processPropertyAssignment(_decorator.getProperty('providers'));
      this._exports = this._processPropertyAssignment(_decorator.getProperty('exports'));
    }
  }

  public getDeclarations(): string[] {
    return this._declarations;
  }

  public getImports(): string[] {
    return this._imports;
  }

  public getProviders(): string[] {
    return this._providers;
  }

  public getExports(): string[] {
    return this._exports;
  }

  private _processPropertyAssignment(propertyAssignment: any): string[] {
    const _results: string[] = []
    if (Node.isPropertyAssignment(propertyAssignment)) {
      propertyAssignment.getInitializer().forEachChild((c => {
        if (Node.isIdentifier(c)) {
          _results.push(c.getText());
        }
      }));
    }

    return _results;
  }
}
