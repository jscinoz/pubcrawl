"use strict";

module.exports = function(next, conn, params) {
    var constants = require("Haraka/constants"),
        logger = require("Haraka/logger"),
        config = require("Haraka/config").get("pubcrawl", "json"),
        mongoose = require("mongoose"),
        Q = require("q"),
        List = mongoose.model("List", require("pubcrawl/schema/List")), 
        Subscriber = mongoose.model("Subscriber",
                                    require("pubcrawl/schema/Subscriber")), 
        message = conn.transaction,
        rcpt = params[0];

    // IP Blacklisting? potentially TODO, or we can rely on haraka for this

    // Deny if we recieve mail not destined for the configured serverName
    if (rcpt.host !== config.serverName)
        return next(constants.deny, "I don't handle mail for " + rcpt.host); 

    // Find subscriber and list, based off complete sender address and the user
    // component of the recipient address.
    return Q.all([
        Subscriber.findByAddress(message.mail_from),
        List.findByName(rcpt.user)
    ]).spread(function(subscriber, list) {
        if (!subscriber) {
            // No subscriber found
            return next(constants.denysoft, "No subscriber found for " +
                        message.mail_from.toString());
        } else if (!list) {
            // No list found
            return next(constants.denysoft, "No such list '" + rcpt.user +
                        "', go away.");
        } else if (!subscriber.isSubscribedTo(list)) {
            // Subscriber and list found, but subscriber is not a member
            // of the recipient list
            return next(constants.denysoft, "Subscriber " + subscriber.email +
                        " is not a subscribed to " +
                        (list.displayName || list.name));
        } else if (!subscriber.isConfirmedFor(list)) {
            // Subscriber hasn't yet responded to confirmation message
            return next(constants.denysoft, "Subscriber " + subscriber.email +
                " has not yet responded to the confirmation message for list "
                + (list.displayName || list.name));
        }

        // Store subscriber and list on the notes object for this message
        message.notes.subscriber = subscriber;
        message.notes.list = list;

        return next(constants.ok);
    }).fail(function(err) {
        // TODO - proper error handling

        logger.logdebug(err.stack);

        return next(constants.deny, "Internal Server Error:\n" + err.stack);
    });
}
