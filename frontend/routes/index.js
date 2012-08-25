var path = require("path"),
    ROUTEFILE_REGEX = /^(get|post|put|delete)_([A-Za-z_-]+).js$/;

exports.register = function(pubcrawl, app) {
    require("fs").readdir(__dirname, function(err, files) {
        if (err) pubcrawl.logerror(err);

        files.forEach(function(file) {
            var routeMatch, routeMethod, routePath, routeHandler;

            if (routeMatch = file.match(ROUTEFILE_REGEX)) {
                routeMethod = routeMatch[1];
                routePath = "/" + routeMatch[2].replace(/_/g, "/");
                routeHandler = require(path.join(__dirname, file));

                pubcrawl.loginfo("Registering " + routeMethod +
                                 " handler for path " + routePath);

                app[routeMethod](routePath, routeHandler);
            }
        });
    });

    app.get("/", function(req, res){
        res.render("index", { title: "Pubcrawl"});
    });
}
