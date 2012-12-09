"use strict";

module.exports = function(next, conn, params) {
    var app = this,
        server = this.server,
        config = server.notes.config,
        message = conn.transaction,
        toAddr = params[0];

    // Disconnect immediately if a blacklisted IP connects
    if (ipBlacklisted(conn.remote_ip)) return next(DENYDISCONNECT, "IP Banned");

    // Deny if we recieve mail not destined for the configured serverName
    if (toAddr.host !== config.serverName)
        return next(DENY, "I don't handle mail for " + toAddr.host); 

    // Validate destination user matches a list id
    if (!(conn.notes.list = findList(toAddr.user)))
        return next(DENYSOFT, "No such list '" + toAddr.user + "', go away.");

    // Store user for this message, if one exists
    conn.notes.user = findUser(message.mail_from.user);

    next(app.OK);
}

function ipBlacklisted(ip) {
    // TODO: Check IP against blacklist, return true if blacklisted, else false
    // XXX: Potentially not needed - haraka itself can handle this
    return false;
}

function findList(listId) {
    // TODO: find the list from mongoose for the given ID, otherwise return null
    if (listId === "programming-wg") return {};

    return null;
}

function findUser(userId) {
    // TODO: Find the user from mongoose, otherwise return null
    return {id: userId};
}
