"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Subscription = require("./Subscription"),
    Address = require("Haraka/address").Address,
    Q = require("q");

var Subscriber = new Schema({
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

Subscriber.method("subscribe", function(list, requestIp) {
    var subscriptions = this.subscriptions,
        Subscription = mongoose.model("Subscription"),
        subscription = new Subscription({list: list, requestIp: requestIp});

    subscriptions.push(subscription);

    return Q.ninvoke(this, "save")
    // We need to use .bind here, or 'this' is undefined in sendConfirmation
    .then(subscription.sendConfirmation.bind(subscription));
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
    return Q.ninvoke(mongoose.model("List"), "find", {"subscribers._id": this.id});
});

// Finds a subscriber by an instance of Haraka's Address object
Subscriber.static("findByAddress", function(address) {
    var email = address.toString().replace(/^<|>$/g, "");

    return Q.ninvoke(this, "findOne", {email: email});
});

module.exports = Subscriber;
