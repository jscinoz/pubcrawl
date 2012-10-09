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

module.exports = List;
