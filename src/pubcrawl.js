"use strict";

var hooks = require("../../src/hooks");

exports.hook_init_master = hooks.init_master;
exports.hook_rcpt = hooks.rcpt;
exports.hook_rcpt_ok = hooks.rcpt_ok;
exports.hook_queue = hooks.queue;
exports.hook_queue_ok = hooks.queue_ok;
