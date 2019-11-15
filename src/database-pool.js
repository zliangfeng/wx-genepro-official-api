import mysql from "mysql2/promise";
import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
iconv.encodings = encodings;

export const fillUpdate = entity => {
    const fields = [];
    const values = [];
    for (const key in entity) {
        fields.push("?? = ?"); // SQL
        values.push([key, entity[key]]);
    }
    return { fields: fields.join(","), values };
};

export const pool_wechat = mysql.createPool({
    connectionLimit: 3,
    host: "127.0.0.1",
    user: "postman001",
    password: "postmanool",
    port: 3306,
    database: "wechat4sport"
});

export const pool_report = mysql.createPool({
    connectionLimit: 3,
    host: "127.0.0.1",
    user: "postman001",
    password: "postmanool",
    port: 3306,
    database: "wechat4sport"
});

export const pool_prod = mysql.createPool({
    connectionLimit: 3,
    host: "127.0.0.1",
    user: "postman001",
    password: "postmanool",
    port: 3306,
    database: "medical4vip"
});

export default pool_wechat;
