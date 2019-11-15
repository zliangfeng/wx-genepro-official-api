const checkOpenid = async (req, res, next) => {
    const openid = req.cookies.WX_OPENID || req.body.openid || req.query.openid;

    if (!openid) {
        return res.status(402).end("openid not found in cookies.");
    }

    req.WX_OPENID = openid;

    return next();
};

export default checkOpenid;
