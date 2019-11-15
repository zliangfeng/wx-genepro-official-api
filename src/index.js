"use strict";
import "regenerator-runtime/runtime";
import express from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import compression from "compression";

import checkOpenid from "./middleware/check-openid";

import echo from "./routes/echo";
// import wxAuth from "./routes/wx-auth";
import nutritionApi from "./routes/api-nutrition";

const app = express();
app.use(compression());
app.use(
    cookieParser(
        "encrypt_my_cookies"
            .split("")
            .sort()
            .join("")
    )
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
    logger(
        ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
    )
);

app.use("/echo", echo);
// app.use("/", wxAuth);

app.use(checkOpenid);
app.use("/api/v1/nutri", nutritionApi);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

const port = process.env.NODE_ENV === "production" ? 9380 : 3001;
app.listen(port, () => {
    console.log("API APP listening on port %o!", port);
});
