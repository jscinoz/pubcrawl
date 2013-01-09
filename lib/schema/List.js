"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    logger = require("Haraka/logger"),
    Subscriber = require("./Subscriber"),
    Message = require("./Message"),
    Q = require("q");

var List = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    displayName: String,
    description: String,
    listType: {
        type: String,
        required: true,
        enum: [
            "discuss",
            "announce",
            // Announce list with discussion list as Reply-To
            "hybrid"
        ],
        default: "discuss"
    },
    // Used for hybrid lists, or custom reply-to addresses
    replyTo: String,
    moderated: {type: Boolean, required: true, default: false},
    subscribers: [Subscriber],
    messages: [Message]
});

List.method("unsubscribe", function(email) {
    var list = this,
        subscribers = list.subscribers,
        err;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].email === email) {
            subscribers.splice(i, 1);

            return Q.ninvoke(list, "save");
            // TODO: .then(sendUnsubscribeNotification)
        }
    }

    logger.logdebug("XXX:err");

    err = new Error("Subscriber not found");
    err.name = "NoSuchSubscriber";
    err.list = list;
    err.email = email;

    throw err;
});

List.method("subscribe", function(email, requestIp) {
    var list = this,
        alreadySubscribed = false,
        subscribers = list.subscribers,
        Subscriber = mongoose.model("Subscriber"),
        subscriber;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].email === email) {
            alreadySubscribed = true;

            break;
        }
    }
    
    if (!alreadySubscribed) {
        subscriber = new Subscriber({email: email});

        subscribers.push(subscriber);

        return Q.ninvoke(list, "save")
        .then(list.sendConfirmation.bind(list, subscriber));
    } else {
        return Q.fcall(function() {
            var err = new Error("User already subscribed");

            err.name = "AlreadySubscribed";
            err.subscriber = subscriber;
            err.list = list;

            throw err;
        });
    }
});

List.method("resendConfirmation", function(email) {
    var list = this,
        subscribers = list.subscribers,
        err;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].email === email) {
            return list.sendConfirmation(subscribers[i]);
        }
    }

    err = new Error("Subscriber not found");
    err.name = "NoSuchSubscriber";
    err.list = list;
    err.email = email;

    throw err;
});

List.method("sendConfirmation", function(subscriber) {
    var deferred = Q.defer(),
        list = this,
        config = require("Haraka/config").get("pubcrawl", "json"),
        outbound = require("Haraka/outbound"),
        from = list.name + "@" + config.serverHost,
        to = subscriber.email,
        subject = "Please confirm your subscription to the " +
                  (list.displayName || list.name) + " mailing list",
        // TODO: Externalise confirmation message template
        body = "You, or someone pretending to be you  has requested a " +
               "subscription for " + subscriber.email + " to the mailing " +
               "list '" + (list.displayName || list.name) + "'. If you " +
               "requested this, and wish to confirm this subscription, " +
               "please click the following link:\n\n" +
               "http://" + config.serverHost +
               (config.frontendPort && config.frontendPort !== 80 ?
                ":" + config.frontendPort : "") + "/confirm/" +
               subscriber._id,
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

    return deferred.promise;
});

// Finds a subscriber by an instance of Haraka's Address object
List.method("findSubscriberByAddress", function(address) {
    var list = this,
        subscribers = list.subscribers,
        email = address.toString().replace(/^<|>$/g, "");

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].email === email) {
            return subscribers[i];
        }
    }

    // XXX: Should we throw an error if we don't find a subscriber, or just
    // return nothing and let the caller deal with it?
});


List.static("findByName", function(name) {
    return Q.ninvoke(this, "findOne", {name: name});
});

module.exports = List;
