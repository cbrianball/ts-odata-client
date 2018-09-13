"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FieldReference = /** @class */ (function () {
    function FieldReference(field) {
        this.field = field;
    }
    FieldReference.prototype.toString = function () { return this.field; };
    return FieldReference;
}());
exports.FieldReference = FieldReference;
