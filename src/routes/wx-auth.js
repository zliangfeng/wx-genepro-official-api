import wxOAuthClient, { checkSignature } from "../middleware/wx-oauth-client";
import config from "../config/wx.conf";

import hashTable from "node-hashtable";
import express from "express";
import logger from "../shared/logger";

const router = express.Router();

// wx 开发者中心绑定认证
router.all("/wx", (req, res) => {
    checkSignature(req, res, function(error, result) {
        if (error) {
            res.json({
                error: error
            });
        } else {
            res.json(result);
        }
    });
});

/*
 * 2019-11-12
 * Online Nutrition Report Entry，负责 OAuth 认证
 */
router.get("/wx/nutrition/me", function(req, res) {
    const openid = req.cookies.WX_OPENID;
    if (openid === undefined) {
        const url = wxOAuthClient.getAuthorizeURL(
            "http://" + config.domain + "/wx/check_oid",
            "nutrition",
            "snsapi_base"
        );
        logger.info(url);
        res.redirect(url);
    } else {
        logger.info(`cookie[openid] hit: ${openid}`);
        redirectUrlByOpenid(res, "nutrition");
    }
});

// 获取openid, 并跳转
router.get("/wx/check_oid", function(req, res) {
    const code = req.query.code;
    const type = req.query.state || "sport";
    hashTable.get(code, data => {
        if (data) {
            logger.error(`repeat request, code: ${code}`);
            hashTable.delete(code);
            res.sendStatus(200);
        } else {
            logger.info(`check openid, code: ${code}, type: ${type}`);
            hashTable.set(code, 1);
            wxOAuthClient.getAccessToken(code, (err, result) => {
                if (err) return logger.error(err);

                const openid = result.data.openid;
                logger.info(`openid: ${openid}`);
                res.cookie("WX_OPENID", openid, {
                    maxAge: config.cache_max_age
                });
                redirectUrlByOpenid(res, type);
            });
        }
    });
});

function redirectUrlByOpenid(res, type) {
    if (type === "nutrition") res.redirect(`/gene/home?from=wechat`);
    else logger.error(`Unknow Type: ${type}`);
}

export default router;
