var Schema = require("mongoose").Schema;

var Subscriber = new Schema({
    email: String
});

var Header = new Schema({
    name: String,
    value: String
});

var Attachment = new Schema({
    fileName: String,
    mimeType: String,
    data: Buffer
});

var Message = new Schema({
    replies: [Message],
    headers: [Header],
    timestamp: Number,
    subject: String,
    body: String,
    attachments: [Attachment]
});

var List = new Schema({
    name: String,
    description: String,
    subscribers: [Subscriber],
    messages: [Message]
});

exports.compile = function(db) {
    return {
        List: db.model("List", List),
        Subscriber: db.model("Subscriber", Subscriber),
        Header: db.model("Header", Header),
        Message: db.model("Message", Message),
        Attachment: db.model("Attachment", Attachment)
    }
}
