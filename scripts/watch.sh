#!/bin/sh

start_pubcrawl() {
    node --debug node_modules/.bin/haraka -c haraka &

    pubcrawlPid=$!
}

stop_pubcrawl() {
    kill $pubcrawlPid
}

restart_pubcrawl() {
    stop_pubcrawl
    start_pubcrawl
}

start_pubcrawl

inotifywait --format="%e %f" -mr app lib | while read event filename; do
    if [[ "$event" = "CLOSE_WRITE,CLOSE" && \
          $(echo "$filename" | grep -Eo ".+\.(jade|js)$") != "" ]]; then
        echo "Sources modified, restarting..."

        restart_pubcrawl
    fi
done
