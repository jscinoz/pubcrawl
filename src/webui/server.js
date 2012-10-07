exports.start = function(haraka) {
    var express = require("express"),
        app = express(),
        STATIC_DIR = __dirname + "/static";

    app.configure(function() {
        app.use(require("less-middleware")({src: STATIC_DIR, compress: true}));
        app.use(express.static(STATIC_DIR));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
    });

    app.get("/", function(req, res) {
        res.send("DICKS");
    });

    app.listen("3000");

    haraka.logdebug("WebUI started");
}

    // TODO - Shiny web frontend
