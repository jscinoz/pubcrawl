// Export the constants needed for next()
exports.CONT = this.CONT;
exports.DENY = this.DENY;
exports.DENYSOFT = this.DENYSOFT;
exports.DENYDISCONNECT = this.DENYDISCONNECT;
exports.DISCONNECT = this.DISCONNECT;
exports.OK = this.OK;
exports.HOOK_NEXT = this.HOOK_NEXT;

// Export the 'server' object
exports.server = server;

exports.hook_init_master = require("./../../src/hook_init_master").bind(exports);
exports.hook_rcpt = require("./../../src/hook_rcpt").bind(exports);
exports.hook_rcpt_ok = require("./../../src/hook_rcpt_ok").bind(exports);
exports.hook_queue = require("./../../src/hook_queue").bind(exports);
exports.hook_queue_ok = require("./../../src/hook_queue_ok").bind(exports);
