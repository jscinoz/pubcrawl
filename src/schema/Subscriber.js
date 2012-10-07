var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    List = require("./List");

var Subscriber = new Schema({
    address: String,
    moderated: Boolean,
    lists: [List]
});

module.exports = Subscriber;
