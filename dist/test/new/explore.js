"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PredicateBuilder_1 = require("../../lib/expressions/PredicateBuilder");
;
var f = new PredicateBuilder_1.PredicateBuilder();
f.equals("firstName", "abc").or(f.lessThanOrEqualTo("age", f.fieldReference("weight")));
