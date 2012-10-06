var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Attachment = require("./Attachment");

var Message = new Schema({
    headers: [{
        name: String, value: String
    }],
    body: String,
    attachments: [Attachment]
});

module.exports = Message;
