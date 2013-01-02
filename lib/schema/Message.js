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

Message.method("getOwnerList", function() {
    return Q.ninvoke(this.model("List"), "findOne", {"messages._id": this.id});
});

module.exports = Message;
