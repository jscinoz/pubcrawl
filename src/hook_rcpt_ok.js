module.exports = function(next, conn, params) {
    var app = this,
        message = conn.transaction,
        list = message.notes.list;

    // TODO: update  rcpt_to with all subscribers of list

    next();
}
