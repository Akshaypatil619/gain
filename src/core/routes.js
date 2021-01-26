const express = require('express');
const router = express.Router();

exports.get = function () {
    const tenant_route = require("../tenant/routes/tenant_route.js");
    const oam_route = require("../oam/routes/oam_route.js");
    const owner_route = require("../owner/routes/owner_route.js");
    const cc_route = require("../cc/routes/cc_route.js");


    router.use("/tenant/", tenant_route);
    router.use("/cc/", cc_route);
    router.use("/oam/", oam_route);
    router.use("/owner/", owner_route);

    return router;
};

// module.exports = router;