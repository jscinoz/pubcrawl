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
        webui.use(express.methodOverride());
        webui.use(webui.router);
    });

    webui.get("/", function(req, res) {
        List.find(function(err, lists) {
            if (err) return renderError(err, req); 

            res.render("index", {
                title: "Pubcrawl",
                lists: lists
            });

        });
    });

    webui.get("/createList", function(req, res) {
        res.render("createList", {
            title: "Pubcrawl"
        });
    });

    webui.post("/createList", function(req, res) {
        // TODO: request validation

        var params = req.body,
            list = new List({
                name: params.listName,
                displayName: params.displayName,
                description: params.description,
                moderated: params.moderated === "true"
            });

        list.save(function(err, list) {
            if (err) return renderError(err, req); 

            res.render("listCreated", {
                title: "Pubcrawl",
                list: list
            });
        });
    });

    webui.listen("3000");

    app.logdebug("WebUI started");
}
