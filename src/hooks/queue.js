"use strict";

module.exports = function(next, conn, params) {
    var app = this,
        message = conn.transaction,
        list = conn.notes.list,
        user = conn.notes.user;

    // TODO moderation logic:
    //  * If list unmoderated & user unmoderated, post
    //  * If either list or user is moderated, add to appropriate queue (could
    //    be both)
    message.header.lines().forEach(function(x) {
        app.logdebug("XXX: " + x);
    }, this);

    next(app.OK);
}
