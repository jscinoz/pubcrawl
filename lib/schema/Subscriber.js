"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
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
    // Subscriber creation datetime
    createdOn: {type: Date, required: true, default: Date.now},
    // Date/time of last message
    lastMessageOn: {type: Date},
    // Date/time confirmed
    confirmedOn: {type: Date},
    // Subscriber confirmation status (i.e. has responded to conf. email)
    confirmed: {type: Boolean, required: true, default: false},
    // Subscriber moderation status (true = their messages must be reviewed)
    moderated: {type: Boolean, required: true, default: false}
});

// Virtual field for email as Haraka Address
Subscriber.virtual("address").get(function() {
    var parts = this.email.split("@"),
        user = parts[0],
        host = parts[1];

    return new Address(user, host);
});

// Returns a promise for an array of Lists that the user is subscribed to
// TODO: Test this, currently entirely untested, and could well be redundant
Subscriber.method("getSubscribedLists", function() {
    return Q.ninvoke(mongoose.model("List"), "find", {
        "subscribers.email": this.email
    });
});

module.exports = Subscriber;
