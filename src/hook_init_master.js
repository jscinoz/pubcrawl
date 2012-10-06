module.exports = function (next) {
    // Configure the server
    var app = this,
        server = app.server,
        config = server.notes.config = app.config.get("pubcrawl", "json"),
        db;

    if (!config) {
        app.logerror("Error loading pubcrawl configuration, cannot continue.");
        return next();
    }
    
    // TODO: Config validation

    db = server.notes.db
       = require("mongoose").createConnection(config.dbHost, config.dbName);

    // Server config is immutable
    Object.freeze(server.notes.config);

    // Nothing else should be added to the global server state
    Object.freeze(server.notes);

    db.on("error", app.logerror.bind(app, "[MongoDB] "));

    db.once("open", function() {
        var WebUIServer = require("./webui/server");

        WebUIServer.start(app);

        app.loginfo("Pubcrawl mailing list plugin initialised"); 

        next();
    });
};
