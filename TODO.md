* Use List-Id header (rfc2919)
* Implement message archiving, and archive browsing interface
* mother fucking unit tests, srsly guise
* Add mechanism to re-send confirmation message
* (un)Subscription needs to be atomic - currently if something goes wrong
  between List.subscribe and Subscriber.subscribe, DB can end up in inconsistent
  state
* Need to pre-model all schemas in init_master
* Support rfc2369 list management headers
* bounce/delivery hooks to handle (non)delivery confirmation
* add virtual to list for (list.displayName || list.name)
* add virtual to list for list.name@config.serverName
* Moderation by email too, or just webui?
* API - Same routes, but different Accept: header for json/xml
* Web UI
    * List administration
    * User adminstration
    * Moderation queue
    * Server configuration
        * IP bans
        * Haraka config in general?
