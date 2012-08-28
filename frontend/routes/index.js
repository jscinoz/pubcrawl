var path = require("path"),
    ROUTEFILE_REGEX = /^(get|post|put|delete)_([A-Za-z_-]+).js$/;

exports.register = function(pubcrawl, app) {
    require("fs").readdir(__dirname, function(err, files) {
        if (err) pubcrawl.logerror(err);

        files.forEach(function(file) {
            var routeMatch, routeMethod, routeName, routePath, routeHandler;

            if (routeMatch = file.match(ROUTEFILE_REGEX)) {
                routeMethod = routeMatch[1];
                routeName = routeMatch[2];
                routeHandler = routeMethod + "_" + routeName;
                routeHandler = require("pubcrawl/frontend/routes/" +
                                       routeHandler)[routeHandler];

                if (routeName === "root") {
                    routePath = "/";
                } else {
                    routePath = "/" + routeName.replace(/_/g, "/");
                }

                pubcrawl.loginfo("Registering " + routeMethod +
                                 " handler for path " + routePath);

                app[routeMethod](routePath, routeHandler);
            }
        });
    });
}
