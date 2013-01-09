"use strict";

var Q = require("q"),
    mongoose = require("mongoose"),
    List = mongoose.model("List"),
    renderError = require("../util").renderError;

exports.root = function(req, res) {
    Q.ninvoke(List, "find").then(function(lists) {
        res.render("index", {
            lists: lists,
            successMsgHead: req.flash("successMsgHead")[0],
            successMsgBody: req.flash("successMsgBody")[0],
            errorMsgHead: req.flash("errorMsgHead")[0],
            errorMsgBody: req.flash("errorMsgBody")[0]
        });
    }).fail(renderError.bind(res));
};

exports.list = require("./list");
