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
    subscriptions: [Subscription]
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

Subscriber.method("getSubscribedLists", function() {
    return Q.ninvoke(this.model("List"), "find", {"subscribers._id": this.id});
});

module.exports = Subscriber;
