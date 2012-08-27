var fs = require("fs"),
    path = require("path"),
    mongoose = require("mongoose"),
    pubcrawl = exports,
    self = this,
    config = require(path.join(__dirname, "../../config")),
    db = mongoose.createConnection(config.mongoUrl),
    hooks = require(path.join(__dirname, "../../plugin/hooks")),
    frontendServer = require(path.join(__dirname, "../../frontend/server"));

["CONT", "DENY", "DENYSOFT", "DENYDISCONNECT", "DISCONNECT","OK",
 "HOOK_NEXT"].forEach(function(constant) {
    pubcrawl[constant] = self[constant];
});

db.on("error", pubcrawl.logerror.bind(pubcrawl, "mongodb error: "));

hooks.register(pubcrawl);

if (config.frontendEnabled) {
    frontendServer.start(pubcrawl);
}

pubcrawl.lognotice("Pubcrawl plugin initialised.");