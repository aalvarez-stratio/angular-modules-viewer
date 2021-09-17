import * as ts from 'typescript';
import {
  ArrayLiteralExpression,
  CallExpression,
  ClassDeclaration,
  Decorator,
  Expression,
  Identifier,
  NodeArray,
  ObjectLiteralExpression,
  PropertyAssignment
} from 'typescript';
import * as fs from 'fs';
import TypescriptParserResults from './typescript-parser-results';

export default class TypescriptParser {

  private readonly _results: TypescriptParserResults;

  constructor() {
    this._results = new TypescriptParserResults();
  }

  private _readFiles(path: string): Promise<string[]> {
    const glob = require('glob');
    return new Promise<string[]>((resolve) => {
      glob(path, (err, res) => {
        resolve(res);
      });
    });
  }

  parseFiles(path: string): Promise<TypescriptParserResults> {
    return new Promise<TypescriptParserResults>((resolve) => {
      this._readFiles(path).then((fileNames: string[]) => {
        for (const _fileName of fileNames) {
          this.parseFile(_fileName);
        }

        resolve(this._results);
      });
    });
  }

  parseFile(filePath: string): void {
    const node = ts.createSourceFile(
      'x.ts',   // fileName
      fs.readFileSync(filePath, 'utf8'), // sourceText
      ts.ScriptTarget.Latest // langugeVersion
    );

    node.forEachChild(child => {
      if (ts.isClassDeclaration(child)) {
        const _classDeclaration: ClassDeclaration = child;


        if (_classDeclaration.decorators?.length) {
          const _decoratorDeclaration: Decorator = _classDeclaration.decorators[0];
          const _decoratorCallExpression: CallExpression = _decoratorDeclaration.expression as CallExpression;
          const _decoratorIdentifier: Identifier = _decoratorCallExpression.expression as Identifier;

          if (_decoratorIdentifier.escapedText === 'NgModule') {
            const _decoratorObject: ObjectLiteralExpression = _decoratorCallExpression.arguments[0] as ObjectLiteralExpression;
            const _className: string = String(_classDeclaration.name.escapedText);
            const _imports: PropertyAssignment = _decoratorObject.properties.find((d: PropertyAssignment) =>
              (d.name as Identifier).escapedText === 'imports'
            ) as PropertyAssignment;

            if (_imports) {
              const _importElements: NodeArray<Expression> = (_imports.initializer as ArrayLiteralExpression).elements as NodeArray<Expression>;
              const _moduleNames: string[] = _importElements
                .filter((e: Identifier) => ts.isIdentifier(e))
                .map((e: Identifier) => String(e.escapedText));

              this._results.addNode(_className);
              this._results.addEdges(_className, _moduleNames);
            }
          }
        }
      }
    });
  }

}
