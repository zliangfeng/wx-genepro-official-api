import express from "express";
import {
    pool_prod,
    pool_wechat,
    pool_report,
    fillUpdate
} from "../database-pool";

const router = express.Router();

router.get("/check_barcode", checkBarcode);
router.get("/data", loadAllByOpenid);
router.get("/data_by_barcode", loadDataByBarcode);
router
    .route("/barcode2openid")
    .get(loadBarcode2openid)
    .post(addBarcode2openid)
    .patch(updateBarcode2openid);

const SQL_OF = {
    report: {
        // database: wechat4sport
        count: "SELECT count(*) AS count FROM `report` WHERE ?? = ? AND ?? = ?",
        findReportCode: "SELECT id, `code` FROM report WHERE ?? = ?",
        loadingSteps: "SELECT step_id, `datetime` FROM report_log WHERE ??  = ? order by id desc"
    },
    barcode2openid: {
        // database: wechat_entry
        count:
            "SELECT count(*) AS count FROM `barcode2openid` WHERE ?? = ? AND ?? = ?",
        loading: "select * from `barcode2openid` where ?? = ? order by id desc",
        add: "insert into `barcode2openid` set ?",
        update: slot =>
            `update barcode2openid set ${slot} where ?? = ? and ?? = ?`
    },
    data: {
        // database: medical4vip
        loadingSNPs:
            "SELECT snp_name as snp, genotype FROM order_ability_import_data WHERE ?? = ?"
    }
};

async function checkBarcode(req, res) {
    const { barcode } = req.query;
    const openid = req.WX_OPENID;

    try {
        const [[report]] = await pool_report.query(SQL_OF.report.count, [
            "barcode",
            barcode,
            "type",
            "nutrition"
        ]);
        if (report.count < 1)
            return res
                .status(404)
                .json({ error_code: 404, msg: "不存在该条形码." });

        const [[barcode2openid]] = await pool_wechat.query(
            SQL_OF.barcode2openid.count,
            ["openid", openid, "barcode", barcode]
        );
        if (barcode2openid.count > 0)
            return res
                .status(403)
                .json({ error_code: 403, msg: "该条形码已使用." });

        res.json({ data: { available: true } });
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}
async function loadBarcode2openid(req, res) {
    const openid = req.WX_OPENID;

    try {
        const [result] = await pool_wechat.query(
            SQL_OF.barcode2openid.loading,
            ["openid", openid]
        );

        res.json({
            data: result.map(({ barcode, info }) => ({
                barcode,
                info: JSON.parse(info)
            }))
        });
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}
async function addBarcode2openid(req, res) {
    const openid = req.WX_OPENID;
    const { barcode, info } = req.body;

    try {
        const [result] = await pool_wechat.query(SQL_OF.barcode2openid.add, {
            openid,
            barcode,
            info,
            type: "nutrition"
        });
        if (result.insertId) {
            return res.json({ data: { id: result.insertId, barcode } });
        }

        res.json(result);
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}

async function updateBarcode2openid(req, res) {
    const openid = req.WX_OPENID;
    const { barcode, info } = req.body;

    const { fields, values } = fillUpdate({ info });

    try {
        const [result] = await pool_wechat.query(
            SQL_OF.barcode2openid.update(fields),
            values.concat(["openid", openid, "barcode", barcode])
        );

        if (result.affectedRows === 1) {
            res.json({ data: { barcode, msg: "update success" } });
        } else {
            res.status(413).end("update failed");
        }
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}

async function loadDataByBarcode(req, res) {
    const { barcode } = req.query;

    try {
        const data = await __loadItem(barcode);

        res.json({ data });
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}
async function loadAllByOpenid(req, res) {
    const openid = req.WX_OPENID;
    try {
        const [barcode2openids] = await pool_wechat.query(
            SQL_OF.barcode2openid.loading,
            ["openid", openid]
        );

        const data = [];
        for (const { barcode, info, created } of barcode2openids) {
            const snps_or_steps = await __loadItem(barcode);
            data.push({
                ...snps_or_steps,
                barcode,
                info: JSON.parse(info),
                created
            });
        }

        res.json({ data });
    } catch (e) {
        res.json({ error_code: e.code || "ER_RUNTIME_ERROR", msg: e.message });
    }
}

async function __loadItem(barcode) {
    const [[report]] = await pool_report.query(SQL_OF.report.findReportCode, [
        "barcode",
        barcode
    ]);

    if (report.code !== "") {
        const [snps] = await pool_prod.query(SQL_OF.data.loadingSNPs, [
            "order_name",
            report.code
        ]);

        if (snps.length > 0) {
            return { barcode, snps };
        }
    }

    const [steps] = await pool_report.query(SQL_OF.report.loadingSteps, [
        "report_id",
        report.id
    ]);

    return { barcode, steps };
}

export default router;
