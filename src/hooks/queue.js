"use strict";

module.exports = function(next, conn, params) {
    var app = this,
        message = conn.transaction,
        list = conn.notes.list,
        user = conn.notes.user;

    // TODO implement moderation flow as follows:
    // 1. Email received and passes rcpt and rcpt_ok, ending up here
    // 2. Sender is globally moderated?
    //    true: Add message to user moderation queue
    //      upon approval: pass message
    //      upon rejection: send rejection message with reason(s) why
    //    false: pass message
    // 3. Recipient list is moderated (and user is moderated for this list)?
    //    true: Add message to list moderation queue
    //      upon approval: pass message
    //      upon rejection: send rejection message with reason(s) why
    //    false: pass message
    message.header.lines().forEach(function(x) {
        app.logdebug("XXX: " + x);
    }, this);

    next(app.OK);
}
