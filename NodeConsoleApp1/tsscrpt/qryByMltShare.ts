/**
 *
 *
 * npm install mssql
 * 
 * 
 */

import sql from 'mssql';

interface QueryOptions {
    fromTables: string;        // 'orders_202601,orders_202602'
    whereExpression?: string;  // 'WHERE status=1'
    orderbyExprs?: string;     // 'ORDER BY id DESC'
    size: number;              // 15
}




export async function getSqlQryWithMltShare(opts: QueryOptions): Promise<string> {
    const {
        fromTables,
        whereExpression = '',
        orderbyExprs = '',
        size
    } = opts;

    // 1. 拆分表名
    const tables = fromTables
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    if (tables.length === 0) {
        throw new Error('fromTables 不能为空');
    }


    // 2. 拼接内部 UNION ALL SQL
    const innerSql = tables
        .map(tbl => {

            const baseTable = getTableName(tbl)
            const baseSql = `SELECT TOP ${size} * FROM ${baseTable} ${whereExpression} ${orderbyExprs}`;

            if (localNode(tbl)) {
                // 本地表
                return baseSql;
            } else {
                // 远程表 → 需要转义内部单引号
                const escaped = baseSql.replace(/'/g, "''");
                var MyMachineName = getMachnName(tbl)
                return `SELECT * FROM OPENQUERY(${MyMachineName}, '${escaped}')`;
            }
        })
        .join(' UNION ALL ');


    // 3. 外层再包一层 TOP + ORDER BY
    const finalSql = `
    SELECT TOP ${size} * 
    FROM (${innerSql}) AS t2 
    ${orderbyExprs}
  `;

    console.log('Generated SQL:\n', finalSql);

    // 4. 执行 SQL

    return finalSql;
}



/**
 * 判断是否本地节点
 * 外部节点格式示例：
 *   Node2026.hxpay.dbo.pay_in_order_202601
 * 规则：
 *   - 本地表：没有 4 个句号
 *   - 外部表：有 4 个句号
 */
function localNode(tbl: string): boolean {
    if (!tbl) return true; // 空字符串当成本地

    const dotCount = tbl.split('.').length - 1;

    // 外部节点有 4 个句号 → 5 段
    // if dot <> 3 ...is localnode
    //of dot ==3 not localnode
    return dotCount !== 3;
}
function getMachnName(tbl: string) {
    return tbl.split('.')[0]
}

/**
 * 去除最前面的节点名
 * 例如：
 *   Node2026.hxpay.dbo.pay_in_order_202601
 * 返回：
 *   hxpay.dbo.pay_in_order_202601
 */
function getTableName(tbl: string): string {
    if (!tbl) return tbl;

    const parts = tbl.split('.');

    // 如果不是外部节点,少于四个区块，直接返回原值
    if (parts.length < 4) return tbl;

    // 去掉第一个段（节点名）
    return parts.slice(1).join('.');
}
