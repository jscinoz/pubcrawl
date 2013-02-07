* Merge subscriber into subscription - having both types is redundant
* See if unique: true actually on subscriber.name actually prevents duplicates
  from being saved to the list object
* Stop using objectids in URLs and postdata and just use subscriber email/list
  name
* Option for allowing emails to list without being on the list: Y/N/Moderated
* Use List-Id header (rfc2919)
* Three list types:
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
* Moderation filters
  * a list of methods that if return false result in email being added to moderation queue
* Web UI
    * List administration
    * User adminstration
    * Moderation queue
    * Server configuration
        * IP bans
        * Haraka config in general?
