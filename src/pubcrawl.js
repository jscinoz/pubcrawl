// Export the constants needed for next()
exports.CONT = this.CONT;
exports.DENY = this.DENY;
exports.DENYSOFT = this.DENYSOFT;
exports.DENYDISCONNECT = this.DENYDISCONNECT;
exports.DISCONNECT = this.DISCONNECT;
exports.OK = this.OK;
exports.HOOK_NEXT = this.HOOK_NEXT;

// Export the 'server' object
exports.server = this.server;

// Register hooks
require("./../../src/hooks").register(exports);
