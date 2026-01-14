import { getSqlQryWithMltShare } from "./qryByMltShare.js";
// const pool = await sql.connect({
//     user: 'sa',
//     password: '123456',
//     server: 'localhost',
//     database: 'HxPay'
// });
console.log('测试多表查询...');
console.log('测试多表查询...');
(async () => {
    const rows = await getSqlQryWithMltShare({
        fromTables: 'Node2026.hxpay.dbo.pay_in_order_202601,pay_in_order_202511',
        whereExpression: 'WHERE   is_deleted ',
        orderbyExprs: 'ORDER BY id DESC',
        size: 15
    });
    // console.log(rows);
})();
//# sourceMappingURL=qryTst.js.map