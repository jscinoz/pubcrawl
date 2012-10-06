var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Subscriber = require("./Subscriber"),
    Message = require("./Message");

var List = new Schema({
    name: String,
    description: String,
    moderated: Boolean,
    subscribers: [Subscriber],
    messages: [Message]
});

module.exports = List;
