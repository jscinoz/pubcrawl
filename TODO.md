* Merge subscriber into subscription - having both types is redundant
* See if unique: true actually on subscriber.name actually prevents duplicates
  from being saved to the list object
* Stop using objectids in URLs and postdata and just use subscriber email/list
  name
* Should [Subscription] be a subdocument of Subscriber?
* Should List.subscribers be a virtual?
  * If so, add _subscribers, transient, to cache the list, do similar caching
    elsewhere where appropriate
* Refactor how subscribing/unsubscribing works, seems wrong that we have both
  List.subscribe and Subscriber.subscribe
* Use List-Id header (rfc2919)
* Use mongoose populate instead of manually resolving objectids
* THree list types:
    * Discussion
    * Announce
    * Announce+Discuss (reply-to pointing to discussion list)
* Define common error types externally and refactor to use instead of generic
  Error
* Implement message archiving, and archive browsing interface
* Needs moar tests
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
