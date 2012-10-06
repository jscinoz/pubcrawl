module.exports.register = function(exports) {
    exports.hook_init_master = require("./init_master").bind(exports);
    exports.hook_rcpt = require("./rcpt").bind(exports);
    exports.hook_rcpt_ok = require("./rcpt_ok").bind(exports);
    exports.hook_queue = require("./queue").bind(exports);
    exports.hook_queue_ok = require("./queue_ok").bind(exports);
}
