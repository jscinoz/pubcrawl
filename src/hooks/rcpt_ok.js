"use strict";

module.exports = function(next, conn, rcpt) {
    var transaction = conn.transaction,
        // Initially empty recipient list
        rcpt_to = [],
        Address = require("Haraka/address").Address,
        constants = require("Haraka/constants"),
        list = transaction.notes.list,
        subscribers = list.subscribers;
        subscriber;

    // TODO: update  rcpt_to with all subscribers of list

    if (subscribers.length) {
        for (var i = 0, ii = subscribers.length; i < ii; ++i) {
            subscriber = subscribers[i];

            // Only send to users who've responded to confirmation message
            if (subscriber.isConfirmedFor(list)) {
                rcpt_to.push(subscriber.address);
            }
        }
    } else {
        logger.logdebug("List " + (list.displayName || list.name) + " has no subscribers");

        return next(constants.DENY, "List " + (list.displayName || list.name) + " has no subscribers");
    }

    // Update transaction rcpt_to
    transaction.rcpt_to = rcpt_to;

    next();
}
