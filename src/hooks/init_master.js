"use strict";

// Configure and start the plugin + webui server
module.exports = function (next) {
    var logger = require("Haraka/logger"), 
        config = require("Haraka/config").get("pubcrawl", "json"),
        mongoose = require("mongoose"),
        modelSchemas = require("../util").modelSchemas,
        db = mongoose.connection;

    if (!config) {
        logger.logerror("Error loading pubcrawl configuration, cannot continue.");
        return next();
    }
    
    // TODO: Config validation

    mongoose.connect(config.dbHost, config.dbName);

    // TODO: Model all schemas

    // TODO: Properly log otherwise uncaught db errors
    db.on("error", logger.logerror.bind(this, "[MongoDB] "));

    db.once("open", function() {
        var WebUIServer = require("../webui/server");

        modelSchemas();

        WebUIServer.start();

        logger.loginfo("Pubcrawl mailing list plugin initialised"); 

        next();
    });
};
