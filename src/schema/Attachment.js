var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var Attachment = new Schema({
    fileName: String,
    mimeType: String,
    data: Buffer
});

module.exports = Attachment;
