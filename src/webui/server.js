"use strict";

function renderError(app, res, err) {
    /* TODO: Proper error logging and display */
    app.logdebug(err.stack);

    res.send(err.stack);
}

exports.start = function(app) {
    var express = require("express"),
        webui = express(),
        db = app.server.notes.db,
        List = db.model("List", require("./../schema/List")),
        Subscriber = db.model("Subscriber", require("./../schema/Subscriber")),
        Q = require("q"),
        STATIC_DIR = __dirname + "/static";

    webui.configure(function() {
        webui.locals.title = "Pubcrawl";

        webui.set("views", __dirname + "/views");
        webui.set("view engine", "jade");
        webui.use(require("less-middleware")({src: STATIC_DIR, compress: true}));
        webui.use(express.static(STATIC_DIR));
        webui.use(express.bodyParser());
        webui.use(express.cookieParser());
        webui.use(express.methodOverride());
        webui.use(express.session({secret: "" + Math.random()}));
        webui.use(require("connect-flash")());
        webui.use(webui.router);
    });

    webui.get("/", function(req, res) {
        Q.ninvoke(List, "find").then(function(lists) {
            res.render("index", {
                lists: lists,
                successMsgHead: req.flash("successMsgHead")[0],
                successMsgBody: req.flash("successMsgBody")[0],
                errorMsgHead: req.flash("errorMsgHead")[0],
                errorMsgBody: req.flash("errorMsgBody")[0]
            });
        }).fail(renderError.bind(this, app, res));
    });

    webui.get("/create-list", function(req, res) {
        res.render("create-list");
    });

    webui.post("/subscribe", function(req, res) {
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
                        return list.subscribe(subscriber)
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
                        " is already subscribed to the list " + err.list.name);
                    res.redirect("/");
                } else {
                    renderError(app, res, err);
                }
            });
    });

    webui.post("/create-list", function(req, res) {
        // TODO: request validation

        var params = req.body,
            list = new List({
                name: params.listName,
                displayName: params.displayName,
                description: params.description,
                moderated: params.moderated === "true"
            });

        app.logdebug(list);

        list.save(function(err, list) {
            if (err) return renderError(err, res); 
        
            req.flash("successMsgHead", "List created");
            req.flash("successMsgBody", 
                "List '" + (list.displayName ? list.displayName : list.name) +
                "' created");
            res.redirect("/");
        });
    });

    webui.listen("3000");

    app.loginfo("Pubcrawl webui started");
}
