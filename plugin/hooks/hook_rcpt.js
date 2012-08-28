var mongoose = require("mongoose"),
    config = require("pubcrawl/config");
    db = mongoose.createConnection(config.mongoUrl),
    Address = require("Haraka/address").Address,
    model = require("pubcrawl/model/Schemata").compile(db);

exports.hook_rcpt = function(next, connection, params) {
    var destHost = params[0].host,
        listName = params[0].user,
        pubcrawl = this;

    if (destHost === config.serverName) {
        model.List.findOne({name: listName}, function(err, list) {
            if (err) {
                pubcrawl.logerror(err);
                next(pubcrawl.DENYSOFT);
            } else if (list === null) {
                next(pubcrawl.DENY);
            } else {
                connection.transaction.rcpt_to = [];

                list.subscribers.forEach(function(subscriber) {
                    connection.transaction.rcpt_to.push(
                        new Address(subscriber.email));
                });

                connection.relaying = true;

                next(pubcrawl.OK);
            }
        });
    } else {
        next(pubcrawl.DENY);
    }
}
