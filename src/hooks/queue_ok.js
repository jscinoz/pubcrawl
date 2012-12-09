"use strict";

module.exports = function(next, conn, params) {
    var app = this
        server = app.server,
        db = server.notes.db;
        message = conn.transaction

    app.logdebug("XXX: Archive");

    // Archive a message to mongodb
    next();
}
