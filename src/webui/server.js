function renderError(err, res) {
    res.send(err);
}

exports.start = function(app) {
    var express = require("express"),
        webui = express(),
        db = app.server.notes.db,
        List = db.model("List", require("./../schema/List")),
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
