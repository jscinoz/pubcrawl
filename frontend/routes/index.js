var mongoose = require("mongoose"),
    config = require("../../config"),
    db = mongoose.createConnection(config.mongoUrl),
    model = require("../../model/Schemata").compile(db);

exports.index = function(req, res){
    model.List.find(function(err, lists) {
        if (err) {
            res.statusCode = 500;
            res.end();
        } else {
            res.render('index', { title: 'Pubcrawl', lists: lists});
        }
    });
};
