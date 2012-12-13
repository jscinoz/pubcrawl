"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Subscription = require("./Subscription"),
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

    return Q.ninvoke(subscriber, "save");
});

// Returns a boolean for whether or not the subscriber is subscribed to the
// given list
Subscriber.method("isSubscribedTo", function(list) {
    var subscribers = list.subscribers;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].get("id") === this.get("id")) return true;
    }

    return false;
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
