"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    List = require("./List"),
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
    moderated: {type: Boolean, required: true, default: false},
    lists: [{type: ObjectId, ref: "List"}]
    // TODO: Need to define a field here to store confirmation status per list
    // maybe bring back the SubscribedList type...
});

Subscriber.method("getSubscribedLists", function() {
    return Q.ninvoke(this.model("List"), "find", {"subscribers._id": this.id});
});

module.exports = Subscriber;
