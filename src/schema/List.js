"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Subscriber = require("./Subscriber"),
    Message = require("./Message");

var List = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: String,
    description: String,
    moderated: {type: Boolean, required: true, default: false},
    subscribers: [Subscriber],
    messages: [Message]
});

List.method("subscribe", function(subscriber, cb) {
    // TODO: Double-sub prevention
    this.subscribers.push(subscriber);

    this.save(cb);
});

module.exports = List;
