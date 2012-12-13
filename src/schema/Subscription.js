"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Subscription = new Schema({
    list: {type: ObjectId, ref: "List", required: true},
    // Subscriber confirmation status (i.e. has responded to conf. email)
    confirmed: {type: Boolean, required: true, default: false},
    // Subscriber moderated status for *THIS* subscription only
    moderated: {type: Boolean, required: true, default: false}
});

module.exports = Subscription;
