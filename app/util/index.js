"use strict";

var logger = require("Haraka/logger");

exports.renderError = function renderError(res, err) {
    /* TODO: Proper error logging and display */
    logger.logdebug(err.stack);

    res.send(err.stack);
};
