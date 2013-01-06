"use strict";

var mongoose = require("mongoose"),
    logger = require("Haraka/logger"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Q = require("q");

var Subscription = new Schema({
    list: {type: ObjectId, ref: "List", required: true},
    // Subscriber confirmation status (i.e. has responded to conf. email)
    confirmed: {type: Boolean, required: true, default: false},
    // Subscriber moderated status for *THIS* subscription only
    moderated: {type: Boolean, required: true, default: false},
    requestIp: {type: String, required: true}
});

Subscription.method("sendConfirmation", function() {
    var deferred = Q.defer(),
        List = mongoose.model("List"),
        subscription = this,
        config = require("Haraka/config").get("pubcrawl", "json"),
        outbound = require("Haraka/outbound");

    Q.all([
        this.getList(),
        this.getSubscriber()
    ])
    .spread(function(list, subscriber) {
        var from = list.name + "@" + config.serverHost,
            to = subscriber.email,
            subject = "Please confirm your subscription to the " +
                      (list.displayName || list.name) + " mailing list",
            // TODO: Externalise confirmation message template
            body = "You, or someone at " + subscription.get("requestIp") +
                   " has requested a subscription for " + subscriber.email + 
                   " to the mailing list '" + (list.displayName || list.name) +
                   "'. If you requested this, and wish to confirm this " +
                   "subscription, please click the following link:\n\n" +
                   "http://" + config.serverHost + 
                   (config.frontendPort && config.frontendPort != 80 ?
                    ":" + config.frontendPort : "") + "/confirm/" +
                   subscription.get("id"),
            message = [
                "From: " + from,
                "To: " + to,
                "Subject: " + subject,
                "", // Empty line delimiting headers and message body
                body
            ].join("\n");
    
        // We can't just use Q.ninvoke because the callback passed to send_email
        // is invoked with (errcode, message), even when errcode indicates a
        // success code. However, Q interprets any truthy value for the first
        // argument to the callback as an error, causing the promise to be
        // always be rejected.
        outbound.send_email(from, to, message, function(code, msg) {
            logger.logdebug("XXX code: " + code);
            logger.logdebug("XXX msg: " + msg);
            // TODO: Check code, and if error, reject promise
    
            deferred.resolve();
        });
    })
    .fail(function(err) {
        // TODO: Handle errors properly
        logger.logerror(err);
        logger.logerror(err.stack);
    });

    return deferred.promise;
});

Subscription.method("getList", function() {
    var List = mongoose.model("List");

    return Q.ninvoke(List, "findById", this.list);
});

Subscription.method("getSubscriber", function() {
    var Subscriber = mongoose.model("Subscriber");

    return Q.ninvoke(Subscriber, "findOne", {"subscriptions._id": this.id});
});

Subscription.static("findForEmailAndListId", function(email, listId) {
    var Subscriber = mongoose.model("Subscriber");

    return Q.ninvoke(Subscriber, "findOne", {email: email})
    .then(function(subscriber) {
        var subscriptions = subscriber.subscriptions,
            err;

        for (var i = 0, ii = subscriptions.length; i < ii; ++i) {
            if (subscriptions[i].get("list").toString() === listId) {
                return subscriptions[i];
            }
        }

        err = new Error("Subscription not found");
        err.name = "NoSuchSubscription";
        err.email = email;
        err.listId = listId;

        throw err;
    });
});

module.exports = Subscription;
