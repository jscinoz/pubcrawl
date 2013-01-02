"use strict";

module.exports = function(next, conn, params) {
    var logger = require("Haraka/logger"),
        mongoose = require("mongoose"),
        message = conn.transaction;


//    logger.logdebug("XXX: Archive");

    // TODO: Archive a message to mongodb

    next();
};
