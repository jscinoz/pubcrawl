"use strict";

exports.start = function() {
    var express = require("express"),
        webui = express(),
        logger = require("Haraka/logger"),
        STATIC_DIR = __dirname + "/static",
        routes = require("./routes");

    webui.configure(function() {
        webui.locals.title = "Pubcrawl";
        // The following must be initialised to avoid errors when there's
        // no actual flash message
        webui.locals.successMsgHead = "";
        webui.locals.successMsgBody = "";
        webui.locals.errorMsgHead = "";
        webui.locals.errorMsgBody = "";

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

    webui.get("/", routes.root);
    webui.get("/create-list", routes.list.create);

    webui.post("/subscribe", routes.list.subscribe);
    webui.post("/unsubscribe", routes.list.unsubscribe);
    webui.post("/create-list", routes.list.create);

    webui.listen("3000");

    logger.loginfo("Pubcrawl webui started");
}
