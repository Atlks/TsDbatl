/**
 *
 *
 * npm install mssql
 *
 *
 */
interface QueryOptions {
    fromTables: string;
    whereExpression?: string;
    orderbyExprs?: string;
    size: number;
}
export declare function qryWithMltShare(opts: QueryOptions): Promise<string>;
export {};
//# sourceMappingURL=qryByMltShare.d.ts.map