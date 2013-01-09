"use strict";

module.exports = function(next, conn, params) {
    var constants = require("Haraka/constants"),
        logger = require("Haraka/logger"),
        config = require("Haraka/config").get("pubcrawl", "json"),
        mongoose = require("mongoose"),
        List = mongoose.model("List"),
        message = conn.transaction,
        rcpt = params[0];

    // Deny if we recieve mail not destined for the configured serverHost
    if (rcpt.host !== config.serverHost) {
        return next(constants.deny, "I don't handle mail for " + rcpt.host);
    }

    // Find list based off user component of recipient address
    List.findByName(rcpt.user)
    .then(function(list) {
        var subscriber;

        if (!list) {
            // No list found
            return next(constants.denysoft, "No such list '" + rcpt.user +
                        "', go away.");
        }

        subscriber = list.findSubscriberByAddress(message.mail_from);

        if (!subscriber) {
            // No subscriber found
            return next(constants.denysoft, "No subscriber found for " +
                        message.mail_from.toString());
        } else if (!subscriber.confirmed) {
            // Subscriber hasn't yet responded to confirmation message
            return next(constants.denysoft, "Subscriber " + subscriber.email +
                " has not yet responded to the confirmation message for list " +
                (list.displayName || list.name));
        }

        // Store subscriber and list on message.notes for use in other hooks.
        message.notes.list = list;
        message.notes.subscriber = subscriber;

        return next(constants.ok);
    })
    .fail(function(err) {
        logger.logerror(err.stack);

        return next(constants.deny, "Internal Server Error:\n" + err.stack);
    });
};
