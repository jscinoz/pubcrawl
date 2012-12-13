"use strict";

module.exports = function(next, conn, params) {
    var app = this,
        server = this.server,
        db = server.notes.db,
        Q = require("q"),
        List = db.model("List", require("./../schema/List")), 
        Subscriber = db.model("Subscriber", require("./../schema/Subscriber")), 
        config = server.notes.config,
        message = conn.transaction,
        rcptAddr = params[0];

    // IP Blacklisting? potentially TODO, or we can rely on haraka for this

    // Deny if we recieve mail not destined for the configured serverName
    if (rcptAddr.host !== config.serverName)
        return next(app.DENY, "I don't handle mail for " + toAddr.host); 

    // Find subscriber and list, based off complete sender address and the user
    // component of the recipient address.
    return Q.all([
        Subscriber.findByAddress(message.mail_from),
        List.findByName(rcptAddr.user)
    ]).spread(function(subscriber, list) {
        if (!subscriber) {
            // No subscriber found
            return next(app.DENYSOFT, "No subscriber found for " +
                        message.mail_from.toString());
        } else if (!list) {
            // No list found
            return next(app.DENYSOFT, "No such list '" + rcptAddr.user +
                        "', go away.");
        } else if (!subscriber.isSubscribedTo(list)) {
            // Subscriber and list found, but subscriber is not a member
            // of the recipient list
            return next(app.DENYSOFT, "Subscriber " + subscriber.email +
                        " is not a subscribed to " +
                        (list.displayName || list.name));
        }

        // Store subscriber and list on the notes object for this connection
        conn.notes.subscriber = subscriber;
        conn.notes.list = list;

        return next(app.OK);
    }).fail(function(err) {
        // TODO - proper error handling

        app.logdebug(err.stack);

        return next(app.DENY, "Internal Server Error:\n" + err.stack);
    });
}
