#!/bin/sh
exec $EDITOR $(find app lib test -type f -name \*.js -or -name \*.jade -or \
                            -name \*.less -not -name \*.min.js) "$@"
