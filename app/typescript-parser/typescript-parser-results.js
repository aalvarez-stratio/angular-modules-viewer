"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypescriptParserResults = /** @class */ (function () {
    function TypescriptParserResults() {
        this._nodes = [];
        this._edges = [];
    }
    TypescriptParserResults.prototype.getNodes = function () {
        return this._nodes;
    };
    TypescriptParserResults.prototype.getEdges = function () {
        return this._edges;
    };
    TypescriptParserResults.prototype.getResult = function () {
        return {
            nodes: this.getNodes(),
            edges: this.getEdges()
        };
    };
    TypescriptParserResults.prototype.addNode = function (nodeId) {
        if (this._nodes.every(function (n) { return n.id !== nodeId; })) {
            this._nodes.push({
                id: nodeId,
                label: nodeId,
                shape: 'box',
                margin: { bottom: 15, top: 15, left: 15, right: 15 }
            });
        }
    };
    TypescriptParserResults.prototype.addEdge = function (from, to) {
        if (this._edges.every(function (e) { return e.from !== from || e.to !== to; })) {
            this._edges.push({
                from: from,
                to: to,
                arrows: 'to'
            });
        }
    };
    TypescriptParserResults.prototype.addEdges = function (fromNodeName, toNodeNames) {
        for (var _i = 0, toNodeNames_1 = toNodeNames; _i < toNodeNames_1.length; _i++) {
            var toNodeName = toNodeNames_1[_i];
            this.addEdge(fromNodeName, toNodeName);
        }
    };
    return TypescriptParserResults;
}());
exports.default = TypescriptParserResults;
//# sourceMappingURL=typescript-parser-results.js.map