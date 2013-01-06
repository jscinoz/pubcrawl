"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
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
    moderated: {type: Boolean, required: true, default: false},
    subscribers: [Subscriber],
    messages: [Message]
});

List.method("unsubscribe", function(subscriber) {
    var list = this,
        subscribers = list.subscribers,
        err;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].get("id") === subscriber.get("id")) {
            subscribers.splice(i, 1);

            return Q.ninvoke(list, "save")
                .then(subscriber.unsubscribe.bind(subscriber, list));
        }
    }

    err = new Error("Subscriber not found");
    err.name = "NoSuchSubscriber";
    err.list = list;
    err.subscriber = subscriber;

    throw err;
});

List.method("subscribe", function(subscriber, requestIp) {
    var list = this,
        subscribers = list.subscribers,
        alreadySubscribed = false;

    for (var i = 0, ii = subscribers.length; i < ii; ++i) {
        if (subscribers[i].get("id") === subscriber.get("id")) {
            alreadySubscribed = true;

            break;
        }
    }
    
    if (!alreadySubscribed) {
        return subscriber.subscribe(list, requestIp)
            .then(function() {
                subscribers.push(subscriber);

                return Q.ninvoke(list, "save");
            });
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

List.static("findByName", function(name) {
    return Q.ninvoke(this, "findOne", {name: name});
});

module.exports = List;