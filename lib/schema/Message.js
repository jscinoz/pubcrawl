"use strict";

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Attachment = require("./Attachment"),
    ObjectId = Schema.ObjectId,
    Message;

Message = new Schema({
    headers: [{
        name: {type: String, index: true},
        value: String
    }],
    body: String,
    attachments: [Attachment],
    list: {type: ObjectId, ref: "List"}
});

module.exports = Message;
