"use strict";

var mongoose = require("mongoose");

// Misc functions that should probably be somewhere else
// TODO: Put these in the right place

exports.modelSchemas = function() {
    mongoose.model("List", require("./schema/List"));
    mongoose.model("Subscriber", require("./schema/Subscriber"));
    mongoose.model("Subscription", require("./schema/Subscription"));
    mongoose.model("Message", require("./schema/Message"));
    mongoose.model("Attachment", require("./schema/Attachment"));
}
