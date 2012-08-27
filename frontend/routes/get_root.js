var mongoose = require("mongoose"),
    config = require("../../config"),
    db = mongoose.createConnection(config.mongoUrl),
    model = require("../../model/Schemata").compile(db);

exports.get_root = function(req, res) {
    model.List.find(function(err, lists) {
        if (err) {
            res.statusCode = 500;
            res.end(err);
        } else {
            res.render("index", { title: "Pubcrawl", lists: lists});
        }
    });
};
