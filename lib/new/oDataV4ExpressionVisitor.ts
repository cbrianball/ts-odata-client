import {TypedExpressionVisitor} from "./typedExpressionVisitor";
import { FieldReference } from "./FieldReference";

type Sort = {field: string, sort?: 'desc'};

interface ODataQuery {
    select: string[];
    orderBy: Sort[]
}

export class ODataV4ExpressionVisitor extends TypedExpressionVisitor {

    public readonly oDataQuery : ODataQuery = {
        select: [],
        orderBy: [],
    }

    selectVisitor(...fields: FieldReference<any>[]) {
        this.oDataQuery.select = fields.map(f => f.toString());
    }

    orderByVisitor(...fields: FieldReference<any>[]) {
        this.oDataQuery.orderBy.push(...fields.map(f => ({field:f.toString()})));
    }

    orderByDescendingVisitor(...fields: FieldReference<any>[]) {
        this.oDataQuery.orderBy.push(...fields.map<Sort>(f => ({field:f.toString(), sort: 'desc'})));
    }
}