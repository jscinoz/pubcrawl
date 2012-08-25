exports.register = function(pubcrawl) {
    require("fs").readdirSync(__dirname).forEach(function(file) {    
        var hookMatch = file.match(),
            hookName, hookFunc;

        if (hookMatch = file.match(/^(hook_[a-zA-Z_]+).js$/)) {
            hookName = hookMatch[1];
            hookFunc = require(__dirname + "/" + file)[hookName];

            pubcrawl[hookName] = hookFunc.bind(this, pubcrawl);
        }
    });
}
