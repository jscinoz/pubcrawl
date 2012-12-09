"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Subscription = new Schema({
    list: {type: ObjectId, ref: "List", required: true},
    confirmed: {type: Boolean, required: true, default: false},
    moderated: {type: Boolean, required: true, default: false}
});

module.exports = Subscription;
