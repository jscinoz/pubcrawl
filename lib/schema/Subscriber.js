"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Subscription = require("./Subscription"),
    Address = require("Haraka/address").Address,
    outbound = require("Haraka/outbound"),
    config = require("Haraka/config").get("pubcrawl", "json"),
    Q = require("q");


var Subscriber = new Schema({
    // TODO: Create proper email address type, with conveneince methods
    // similar to Haraka's Address object
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true,
        index: true
    },
    subscriptions: [Subscription],
    // Subscriber's global moderation status
    moderated: {type: Boolean, required: true, default: false}
});


// Virtual field for email as Haraka Address
Subscriber.virtual("address").get(function() {
    var parts = this.email.split("@"),
        user = parts[0],
        host = parts[1];

    return new Address(user, host);
});

Subscriber.method("sendConfirmationMessage", function(list) {
    // TODO: Externalise confirmation message template
    var from = list.name + "@" + config.serverName,
        to = this.email,
        subject = "Please confirm your subscription to the " +
                  (list.displayName || list.name) + " mailing list",
        body = "You, or someone at INSERT_SUBSCRIPTION_IP_HERE has requested " +
               "a subscription for " + this.email + " to the mailing list '" +
               (list.displayName || list.name) + "'. If you requested this, " +
               "and wish to confirm this subscription, please click the " +
               "following link:\n\n" + "INSERT_CONFIRMATION_LINK_HERE",
        message = [
            "From: " + from,
            "To: " + to,
            "Subject: " + subject,
            "", // Empty line delimiting headers and message body
            body
        ].join("\n"),
        deferred = Q.defer();

    // TODO: I was pretty drunk when i wrote this, re-do this, properly.


    // We can't just use Q.ninvoke because the callback passed to send_email
    // is invoked with (errcode, message), even when errcode indicates a success
    // code. However, Q interprets any truthy value for the first argument to
    // the callback as an error, causing the promise to be always be rejected.
    outbound.send_email(from, to, message, function(code, msg) {
        console.log("XXX code: " + code);
        console.log("XXX msg: " + msg);
        // TODO: Check code, and if error, reject promise

        deferred.resolve();

    });

    return deferred.promise;
});

Subscriber.method("unsubscribe", function(list) {
    var subscriber = this,
        subscriptions = subscriber.subscriptions;

    for (var i = 0, ii = subscriptions.length; i < ii; ++i) {
        if (subscriptions[i].list.toString() === list.get("id")) {
            subscriptions.splice(i, 1);

            return Q.ninvoke(subscriber, "save");
        }
    }
});

Subscriber.method("subscribe", function(list) {
    var subscriber = this,
        subscriptions = subscriber.subscriptions,
        Subscription = this.model("Subscription");

    subscriptions.push(new Subscription({list: list}));

    return Q.ninvoke(subscriber, "save")
        .then(this.sendConfirmationMessage.bind(this, list));
});

// Returns a boolean for whether or not the subscriber is subscribed to the
// given list
Subscriber.method("isSubscribedTo", function(list) {
    var subscribers = list.subscribers;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].get("id") === this.get("id")) {
            return true;
        }
    }

    return false;
});

// Returns a boolean for whether or not the subscriber has responded to the
// confirmation message for the given list
Subscriber.method("isConfirmedFor", function(list) {
    var subscriptions = this.subscriptions,
        subscription;

    for (var i = 0, ii = subscriptions.length; i < ii; ++i) {
        subscription = subscriptions[i];

        if (subscription.get("list").toString() === list.get("id")) {
            return subscription.confirmed;
        }
    }

    // XXX: Should we throw an exception if we reach here (i.e. didn't
    // find a subscription for the list)
});

// Returns a promise for an array of Lists that the user is subscribed to
Subscriber.method("getSubscribedLists", function() {
    return Q.ninvoke(this.model("List"), "find", {"subscribers._id": this.id});
});

// Finds a subscriber by an instance of Haraka's Address object
Subscriber.static("findByAddress", function(address) {
    var email = address.toString().replace(/^<|>$/g, "");

    return Q.ninvoke(this, "findOne", {email: email});
});

module.exports = Subscriber;
