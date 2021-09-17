"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var typescript_parser_results_1 = require("./typescript-parser-results");
var TypescriptParser = /** @class */ (function () {
    function TypescriptParser() {
        this._results = new typescript_parser_results_1.default();
    }
    TypescriptParser.prototype._readFiles = function (path) {
        var glob = require('glob');
        return new Promise(function (resolve) {
            glob(path, function (err, res) {
                resolve(res);
            });
        });
    };
    TypescriptParser.prototype.parseFiles = function (path) {
        var _this = this;
        return new Promise(function (resolve) {
            _this._readFiles(path).then(function (fileNames) {
                for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                    var _fileName = fileNames_1[_i];
                    _this.parseFile(_fileName);
                }
                resolve(_this._results);
            });
        });
    };
    TypescriptParser.prototype.parseFile = function (filePath) {
        var _this = this;
        var node = ts.createSourceFile('x.ts', // fileName
        fs.readFileSync(filePath, 'utf8'), // sourceText
        ts.ScriptTarget.Latest // langugeVersion
        );
        node.forEachChild(function (child) {
            var _a;
            if (ts.isClassDeclaration(child)) {
                var _classDeclaration = child;
                if ((_a = _classDeclaration.decorators) === null || _a === void 0 ? void 0 : _a.length) {
                    var _decoratorDeclaration = _classDeclaration.decorators[0];
                    var _decoratorCallExpression = _decoratorDeclaration.expression;
                    var _decoratorIdentifier = _decoratorCallExpression.expression;
                    if (_decoratorIdentifier.escapedText === 'NgModule') {
                        var _decoratorObject = _decoratorCallExpression.arguments[0];
                        var _className = String(_classDeclaration.name.escapedText);
                        var _imports = _decoratorObject.properties.find(function (d) {
                            return d.name.escapedText === 'imports';
                        });
                        if (_imports) {
                            var _importElements = _imports.initializer.elements;
                            var _moduleNames = _importElements
                                .filter(function (e) { return ts.isIdentifier(e); })
                                .map(function (e) { return String(e.escapedText); });
                            _this._results.addNode(_className);
                            _this._results.addEdges(_className, _moduleNames);
                        }
                    }
                }
            }
        });
    };
    return TypescriptParser;
}());
exports.default = TypescriptParser;
//# sourceMappingURL=typescript-parser.js.map