var mongoose = require("mongoose"),
    config = require("../../config");
    db = mongoose.createConnection(config.mongoUrl),
    model = require("../../model/Schemata").compile(db);

exports.hook_rcpt = function(pubcrawl, next, connection, params) {
    var destHost = params[0].host,
        listName = params[0].user;

    if (destHost === config.serverName) {
        model.List.find({name: listName}, function(err, list) {
            if (err) {
                pubcrawl.logerror(err);
                next(pubcrawl.DENYSOFT);
            } else if (list.length === 0) {
                next(pubcrawl.DENY);
            } else {
                next();
            }
        });
    } else {
        next(pubcrawl.DENY);
    }
}
