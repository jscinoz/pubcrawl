"use strict";

var Q = require("q"),
    mongoose = require("mongoose"),
    logger = require("Haraka/logger"),
    List = mongoose.model("List", require("../../lib/schema/List")),
    Subscriber = mongoose.model("Subscriber",
                                require("../../lib/schema/Subscriber")),
    Subscription = mongoose.model("Subscription",
                                require("../../lib/schema/Subscription")),
    renderError = require("../util").renderError;

exports.create = function(req, res) {
    if (req.method === "GET") {
        // Render list creation form
        return res.render("create-list");
    } else if (req.method === "POST") {
        var params = req.body,
            list = new List({
                name: params.listName,
                displayName: params.displayName,
                description: params.description,
                moderated: params.moderated === "true"
            });

        // TODO: request validation

        // FIXME: This is allowing multiple lists with the same name for some
        // reason, possibly a mongoose bug.
        Q.ninvoke(list, "save")
        .then(function() {
            logger.logdebug(arguments);

            logger.logdebug("XXX: DERP");
            req.flash("successMsgHead", "List created");
            req.flash("successMsgBody",
                "List '" + (list.displayName ? list.displayName : list.name) +
                "' created");
            res.redirect("/");
        })
        .fail(function(err) {
            // TODO, proper error handling
            logger.logerror(err.stack);
        });
    }
};

exports.subscribe = function(req, res) {
    var params = req.body;
    
    // TODO: request validation
    Q.ninvoke(Subscriber, "findOne", {"email": params.email})
    .then(function(subscriber) {
        if (!subscriber) {
            logger.logdebug("Creating new subscriber with address " +
                         params.email);

            subscriber = new Subscriber({
                email: params.email
            });

            return Q.ninvoke(subscriber, "save")
            .then(function() {
                return subscriber;
            });
        }

        logger.logdebug("Found existing subscriber with address " +
                        params.email);

        return subscriber;
    })
    .then(function(subscriber) {
        return Q.ninvoke(List, "findById", params.listId)
        .then(function(list) {
            return list.subscribe(subscriber, req.ip);
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
            logger.logdebug("Duplicate subscription attempt for address " +
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

        logger.logdebug("Removing subscriber " + subscriber.email);

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
            logger.logdebug("Attempted to remove non-existant " +
                "subscriber " + err.subscriber.email + " from list " +
                (err.list.displayName || err.list.name));

            req.flash("errorMsgHead", "No such subscriber");
            req.flash("errorMsgBody",
                "The email address " + err.subscriber.email +
                " is not subscribed to the list " +
                (err.list.displayName || err.list.name));
            res.redirect("/");
        } else {
            renderError(res, err);
        }
    });
};

exports.resendConfirmation = function(req, res) {
    var params = req.body;

    Subscription.findForEmailAndListId(params.email, params.listId)
    .then(function(subscription) {
        return subscription.sendConfirmation()
        .then(subscription.getSubscriber.bind(subscription))
    })
    .then(function(subscriber) {
        req.flash("successMsgHead", "Confirmation resent");
        req.flash("successMsgBody",
            "A confirmation email has been sent to " +
            subscriber.email + ". Please click the link in " +
            "this email to confirm your subscription");

        res.redirect("/");
    })
    .fail(function(err) {
        logger.logdebug("a wild error appears");
        logger.logdebug(err);
        logger.logdebug(err.stack);
        // TODO: Handle error
    });
};
