var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    List = require("./List");

var Subscriber = new Schema({
    email: String,
    moderated: Boolean
});

Subscriber.method("lists", function(cb) {
    this.model("List").find({"subscribers._id": this.id}, cb);
});

module.exports = Subscriber;
