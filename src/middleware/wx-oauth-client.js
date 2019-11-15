import ok from "okay";
import OAuth from "wechat-oauth";
import signature from "wx_jsapi_sign";
import config from "../config/wx.conf";
import pool from "../database-pool";
import logger from "../shared/logger";

/*
 * Authorization and Authentication
 */
const wxOAuthClient = new OAuth(
    config.appId,
    config.appSecret,
    (openid, callback) => {
        pool.getConnection(
            ok(connection => {
                const sql = "SELECT * FROM token WHERE openid = ?";
                connection.query(
                    sql,
                    [openid],
                    ok(result => {
                        connection.release();
                        logger.info(`select from repo: ${result[0]}`);
                        return callback(null, result[0]);
                    })
                );
            })
        );
    },
    (openid, token, callback) => {
        const fields = [
            token.access_token,
            token.expires_in,
            token.refresh_token,
            token.openid,
            token.scope,
            token.create_at
        ];
        pool.getConnection(
            ok(connection => {
                const sql =
                    "REPLACE INTO token(access_token, expires_in, refresh_token, openid, scope, create_at) VALUES(?, ?, ?, ?, ?, ?)";
                connection.query(sql, fields, (err, result) => {
                    connection.release();
                    logger.info(result);
                    return callback(err);
                });
            })
        );
    }
);

export default wxOAuthClient;
export const checkSignature = signature.checkSignature(config);
export const getSignature = signature.getSignature(config);
