function renderError(err, res) {
    res.send(err);
}

exports.start = function(app) {
    var express = require("express"),
        webui = express(),
        db = app.server.notes.db,
        List = db.model("List", require("./../schema/List")),
        Subscriber = db.model("Subscriber", require("./../schema/Subscriber")),
        STATIC_DIR = __dirname + "/static";

    webui.configure(function() {
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
        List.find(function(err, lists) {
            if (err) return renderError(err, req); 

            res.render("index", {
                title: "Pubcrawl",
                lists: lists,
                successMsgHead: req.flash("successMsgHead")[0],
                successMsgBody: req.flash("successMsgBody")[0]
            });
        });
    });

    webui.get("/create-list", function(req, res) {
        res.render("create-list", {
            title: "Pubcrawl"
        });
    });

    webui.post("/subscribe", function(req, res) {
        var params = req.body;

        // TODO: request validation
        List.findById(params.listId, function(err, list) {
            if (err) return renderError(err, res); 

            Subscriber.findOne({"email": params.email}, function(err,
                                                                 subscriber) {
                if (!subscriber) {
                    subscriber = new Subscriber({
                        email: params.email
                    });

                    subscriber.save(c);
                } else c();

                // Continuation
                function c() {
                    list.subscribe(subscriber, function(err) {
                        if (err) return renderError(err, res);

                        req.flash("successMsgHead", "Confirmation required");
                        req.flash("successMsgBody",
                            "A confirmation email has been sent to " + 
                            subscriber.email + ". Please click the link in " +
                            "this email to confirm your subscription");

                        res.redirect("/");
                    });
                }
            });
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

    app.logdebug("WebUI started");
}
