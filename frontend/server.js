exports.start = function(pubcrawl) {
    var path = require('path'),
        http = require('http'),
        express = require('express'),
        routes = require("./routes"),
        frontendDir = __dirname,
        publicDir = path.join(frontendDir, "./public"),
        app = express();

    app.configure(function(){
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(frontendDir, './views'));
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(require('less-middleware')({ src: publicDir }));
        app.use(express.static(publicDir));
    });

    app.configure('development', function(){
        app.use(express.errorHandler());
    });

    routes.register(pubcrawl, app);

    http.createServer(app).listen(app.get('port'), function() {
        pubcrawl.lognotice(
            "Pubcrawl frontend started on port " + app.get("port"));
    });
}
