"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    List = require("./List");

var Subscriber = new Schema({
      // TODO: Create proper email address type, with conveneince methods
      // similar to Haraka's Address object
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true
    },
    moderated: {type: Boolean, required: true, default: false}
    // TODO: Need to define a field here to store confirmation status per list
    // maybe bring back the SubscribedList type...
});

Subscriber.method("lists", function(cb) {
    this.model("List").find({"subscribers._id": this.id}, cb);
});

module.exports = Subscriber;
