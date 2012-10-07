#!/bin/sh
exec $EDITOR $(find src -type f -name \*.js -or -name \*.jade -or -iname \*.less \
                            -not -name \*.min.js) "$@"
