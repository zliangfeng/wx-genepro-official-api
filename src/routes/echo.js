import express from "express";

const router = express.Router();
router.route("/").get(echo);

function echo(req, res) {
    const timestamp = Date.now().toString();
    res.jsonp(timestamp);
}

export default router;
