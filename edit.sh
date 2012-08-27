#!/bin/sh
exec $EDITOR config.js package.json \
    $(find frontend model plugin -type f -name "*.js" -not -name "*.min.js" \
           -not -name "require*.js" -or -name "*.jade" -or -name "*.less")
