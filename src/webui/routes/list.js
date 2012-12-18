"use strict";

var Q = require("q"),
    mongoose = require("mongoose"),
    List = mongoose.model("List", require("../../schema/List")), 
    Subscriber = mongoose.model("Subscriber", require("../../schema/Subscriber")), 
    renderError = require("../util").renderError;

exports.create = function(req, res) {
    if (req.method === "GET") {
        // Render list creation form
        return res.render("create-list");
    } else if (req.method === "POST") {
        // TODO: request validation

        var params = req.body,
            list = new List({
                name: params.listName,
                displayName: params.displayName,
                description: params.description,
                moderated: params.moderated === "true"
            });

        list.save(function(err, list) {
            if (err) return renderError(err, res); 
        
            req.flash("successMsgHead", "List created");
            req.flash("successMsgBody", 
                "List '" + (list.displayName ? list.displayName : list.name) +
                "' created");
            res.redirect("/");
        });
    }
};

exports.subscribe = function(req, res) {
    var params = req.body;
    
    // TODO: request validation
    Q.ninvoke(Subscriber, "findOne", {"email": params.email})
        .then(function(subscriber) {
            if (!subscriber) {
                app.logdebug("Creating new subscriber with address " +
                             params.email);

                subscriber = new Subscriber({
                    email: params.email
                });


                // TODO: Send confirmation message

                return Q.ninvoke(subscriber, "save")
                    .then(function() {
                        return subscriber;
                    });
            }

            app.logdebug("Found existing subscriber with address " +
                         params.email);

            return subscriber;
        })
        .then(function(subscriber) {
            return Q.ninvoke(List, "findById", params.listId)
                .then(function(list) {
                    return list.subscribe(subscriber);
                }).then(function() {
                    return subscriber;
                });
        })
        .then(function(subscriber) {
            req.flash("successMsgHead", "Confirmation required");
            req.flash("successMsgBody",
                "A confirmation email has been sent to " + 
                subscriber.email + ". Please click the link in " +
                "this email to confirm your subscription");

            res.redirect("/");
        })
        .fail(function(err) {
            if (err.name === "AlreadySubscribed") {
                app.logdebug("Duplicate subscription attempt for address " +
                            err.subscriber.email + " to list " +
                            err.list.name);

                req.flash("errorMsgHead", "Already subscribed");
                req.flash("errorMsgBody",
                    "The email address " + err.subscriber.email +
                    " is already subscribed to the list " +
                    (err.list.displayName || err.list.name));
                res.redirect("/");
            } else {
                renderError(res, err);
            }
        });
};

exports.unsubscribe = function(req, res) {
    var params = req.body;

    Q.ninvoke(Subscriber, "findOne", {"email": params.email})
        .then(function(subscriber) {
            if (!subscriber) {
                throw new Error("Subscriber " + params.email +
                                " not found");
            }

            app.logdebug("Removing subscriber " + subscriber.email);

            return Q.ninvoke(List, "findById", params.listId)
                .then(function(list) {
                    return list.unsubscribe(subscriber)
                        .then(function() {
                            return [subscriber, list];
                        });
                });
        })
        .spread(function(subscriber, list) {
            req.flash("successMsgHead", "Unsubscribe successful");
            req.flash("successMsgBody",
                subscriber.email + " has been successfully unsubscribed " +
                "from list " + (list.displayName || list.name));

            res.redirect("/");
        })
        .fail(function(err) {
            if (err.name === "NoSuchSubscriber") {
                app.logdebug("Attempted to remove non-existant " +
                    "subscriber " + err.subscriber.email + " from list " +
                    (err.list.displayName || err.list.name));

                req.flash("errorMsgHead", "No such subscriber");
                req.flash("errorMsgBody",
                    "The email address " + err.subscriber.email +
                    " is not subscribed to the list " +
                    (err.list.displayName || err.list.name));
                res.redirect("/");
            } else {
                renderError(app, res);
            }
        });
};
