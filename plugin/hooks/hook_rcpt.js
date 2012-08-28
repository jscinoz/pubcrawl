var mongoose = require("mongoose"),
    config = require("pubcrawl/config");
    db = mongoose.createConnection(config.mongoUrl),
    model = require("pubcrawl/model/Schemata").compile(db);

exports.hook_rcpt = function(next, connection, params) {
    var destHost = params[0].host,
        listName = params[0].user,
        pubcrawl = this;

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
