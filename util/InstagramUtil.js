var Client = require("instagram-private-api").V1;
var _ = require('lodash');
var Promise = require('bluebird');
var fs = require("fs");
var dbUsers = require("./DataProviders/Users.js");
var dbPTags = require("./DataProviders/PreferredTags.js");
var globalUtilities = require('../util/GlobalUtilities.js');

/* -- invalid session error
var x = {
    "error": {
        "name": "AuthenticationError",
        "message": "Login required to process this request"
    }
};
*/


var InstagramUtil = {
    _on_request_error: function (e, sessionOrUserId, callback) {
        e = e || {};

        if (e.name == "AuthenticationError"); //set user as logged out === remove client_token from db

        if (callback) callback({ error: e });
    },

    session: function (clientToken, callback, userId) {
        var op = {};

        if (clientToken) op.client_token = clientToken;
        if (userId) op.user_id = userId;

        if (!clientToken && !userId) return callback(null, { error: "invalid parameters" });

        dbUsers.FindUser(op, function (d) {
            var user = ((d || {}).items || []).length ? d.items[0] : null;
            
            var userId = user ? user.user_id : null;
            var username = user ? user.username : "";
            var password = user ? user.password : "";
            
            if (!username || !password) callback(null);
            
            InstagramUtil._login(userId, username, password, callback);
        });
    },

    _login: function (user_id, username, password, callback) {
        //create path if not exists
        var dir = './cookies';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        
        var filePath = dir + '/' + username + '.json';
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "");
        //end of create path if not exists
        
        var device = new Client.Device(username);
        var storage = new Client.CookieFileStorage(filePath);
        
        Client.Session.create(device, storage, username, password).then(function (session) {
            if (user_id) return callback(session);

            InstagramUtil.current_user(session, function (user) {
                var token = globalUtilities.random_str(40);

                dbUsers.AddOrUpdateUser({
                    user_id: user.id,
                    username: user.username,
                    password: password,
                    fullname: user.fullname,
                    client_token: token
                }, function () { callback(session, token); });
            });
        }).catch(function (e) { InstagramUtil._on_request_error(e, userId, callback); });
    },

    login: function (username, password, callback) {
        InstagramUtil._login(null, username, password, callback);
    },

    get_user_id: function (session, callback) {
        if (!(session || {}).getAccountId) callback(null);
        else session.getAccountId().then(function (id) { callback(id); });
    },

    current_user: function (session, callback) {
        if (!callback) return;

        Client.Account.showProfile(session).then(function (d) {
            callback(d);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    get_user_by_id: function (session, userId, callback) {
        if (!callback) return;

        Client.Account.getById(session, userId).then(function (d) {
            callback(d.params);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    followers: function (session, userId, count, callback) {
        if (!callback) return;

        var feed = new Client.Feed.AccountFollowers(session, userId, count);

        Promise.mapSeries(_.range(0, 20), function () {
            return feed.get();
        }).then(function (results) {
            var users = _.flatten(results);

            var dic = {};

            var arr = [];
            for (var i = 0, lnt = (users || []).length; i < lnt; ++i) {
                var m = users[i].params;

                if (dic[m.id]) continue;
                dic[m.id] = true;

                arr.push(m);
            }

            callback({ users: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },
    
    follow: function (session, userId, callback) {
        if (!callback) return;

        Client.Relationship.create(session, userId).then(function (d) {
            callback(d.params);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    unfollow: function (session, userId, callback) {
        if (!callback) return;

        Client.Relationship.destroy(session, userId).then(function (d) {
            callback(d.params);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    relationship: function (session, userIds, callback) {
        if (!callback) return;

        Client.Relationship.getMany(session, userIds).then(function (results) {
            var relations = _.flatten(results);

            var dic = {};

            var arr = [];
            for (var i = 0, lnt = (relations || []).length; i < lnt; ++i) {
                var m = relations[i].params;

                if (dic[m.accountId]) continue;
                dic[m.accountId] = true;

                arr.push(m);
            }

            callback({ relations: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    like: function (session, mediaId, callback) {
        if (!callback) return;

        Client.Like.create(session, mediaId).then(function (d) {
            callback({ result: "ok" });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },
    
    comment: function (session, mediaId, text, callback) {
        if (!callback) return;

        Client.Comment.create(session, mediaId, text).then(function (d) {
            callback(d.params);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    media_likes: function (session, mediaId, callback) {
        if (!callback) return;

        Client.Media.likers(session, mediaId).then(function (d) {
            var arr = [];
            for (var i = 0, lnt = (d || []).length; i < lnt; ++i)
                arr.push(d[i].params);
            callback({ users: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    media_comments: function (session, mediaId, count, callback) {
        if (!callback) return;

        //must add the code block below to the main library 'media.js' file
        /*
        Media.comments = function (session, mediaId, maxId) {
            return new Request(session)
                .setMethod('GET')
                .setResource('mediaComments', { mediaId: mediaId, maxId: maxId })
                .send()
                .then(function (data) {
                    return _.map(data.comments, function (comment) {
                        return new Comment(session, comment);
                    });
                });
        };
        */

        Client.Media.comments(session, mediaId, "").then(function (d) {
            var arr = [];
            for (var i = 0, lnt = (d || []).length; i < lnt; ++i)
                arr.push(d[i].params);
            callback({ comments: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    user_media: function (session, userId, count, callback) {
        if (!callback) return;

        var feed = new Client.Feed.UserMedia(session, userId, count);

        Promise.mapSeries(_.range(0, 20), function () {
            return feed.get();
        }).then(function (results) {
            var media = _.flatten(results);

            var dic = {};

            var arr = [];
            for (var i = 0, lnt = (media || []).length; i < lnt; ++i) {
                var m = media[i].params;

                if (dic[m.id]) continue;
                dic[m.id] = true;

                arr.push({
                    id: m.id, mediaType: m.mediaType, code: m.code, filterType: m.filterType,
                    takenAt: m.takenAt, user: m.user, caption: m.caption, likeCount: m.likeCount,
                    commentCount: m.commentCount, webLink: m.webLink, images: m.images
                });
            }

            callback({ media: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    tag_media: function (session, tag, count, callback) {
        if (!callback) return;

        var feed = new Client.Feed.TaggedMedia(session, tag, count);

        Promise.mapSeries(_.range(0, 20), function () {
            return feed.get();
        }).then(function (results) {
            var media = _.flatten(results);

            var dic = {};

            var arr = [];
            for (var i = 0, lnt = (media || []).length; i < lnt; ++i) {
                var m = media[i].params;

                if (dic[m.id]) continue;
                dic[m.id] = true;

                arr.push({
                    id: m.id, mediaType: m.mediaType, code: m.code, filterType: m.filterType,
                    takenAt: m.takenAt, user: m.user, caption: m.caption, likeCount: m.likeCount,
                    commentCount: m.commentCount, webLink: m.webLink, images: m.images
                });
            }

            callback({ media: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    location_media: function (session, locationId, count, callback) {
        if (!callback) return;

        var feed = new Client.Feed.LocationMedia(session, locationId, count);

        Promise.mapSeries(_.range(0, 20), function () {
            return feed.get();
        }).then(function (results) {
            var media = _.flatten(results);

            var dic = {};

            var arr = [];
            for (var i = 0, lnt = (media || []).length; i < lnt; ++i) {
                var m = media[i].params;

                if (dic[m.id]) continue;
                dic[m.id] = true;

                arr.push({
                    id: m.id, mediaType: m.mediaType, code: m.code, filterType: m.filterType,
                    takenAt: m.takenAt, user: m.user, caption: m.caption, likeCount: m.likeCount,
                    commentCount: m.commentCount, webLink: m.webLink, images: m.images
                });
            }

            callback({ media: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    top_search: function (session, query, callback) {
        if (!callback) return;

        Client.search(session, query).then(function (d) {
            for (var i = 0, lnt = ((d || {}).users || []).length; i < lnt; ++i)
                d.users[i] = d.users[i].user.params;
            for (var i = 0, lnt = ((d || {}).places || []).length; i < lnt; ++i)
                d.places[i] = d.places[i].place.params;
            for (var i = 0, lnt = ((d || {}).hashtags || []).length; i < lnt; ++i)
                d.hashtags[i] = d.hashtags[i].hashtag.params;

            callback({ users: d.users, places: d.places, tags: d.hashtags });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    search_users: function (session, query, callback) {
        if (!callback) return;

        Client.Account.search(session, query).then(function (d) {
            var arr = [];
            for (var i = 0, lnt = (d || []).length; i < lnt; ++i)
                arr.push(d[i].params);
            callback({ users: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    search_tags: function (session, query, callback) {
        if (!callback) return;

        Client.Hashtag.search(session, query).then(function (d) {
            var arr = [];
            for (var i = 0, lnt = (d || []).length; i < lnt; ++i)
                arr.push(d[i].params);
            callback({ tags: arr });
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },
    
    tag_info: function (session, tag, callback) {
        if (!callback) return;

        Client.Hashtag.info(session, tag).then(function (d) {
            callback(d.params);
        }).catch(function (e) {
            InstagramUtil._on_request_error(e, session, callback);
        });
    },

    get_preferred_tags: function (session, userId, callback) {
        var dt = new Date();
        dt.setDate(dt.getDate() - 10);

        dbPTags.Get(userId, function (d) {
            if ((d || {}).last_update_time && ((new Date(d.last_update_time)).getTime() > dt.getTime()))
                return callback(d.tags);

            InstagramUtil.user_media(session, userId, 20, function (media) {
                media = (media || {}).media || [];

                var dic = {};

                for (var i = 0, lnt = media.length; i < lnt; ++i) {
                    var tags = String((media[i] || {}).caption || "_").match(/#[^\s]+/g);
                    for (var j = 0; j < (tags || []).length; ++j) {
                        var tg = tags[j].substr(1);
                        dic[tg] = (dic[tg] || "0") + 1;
                    }
                }

                var arr = [];
                for (var t in dic) arr.push({ tag: t, count: dic[t] });

                arr = arr.sort(function (a, b) { return a.count < b.count; });

                var ret = [];
                for (var i = 0; (i < 20) && (i < arr.length); ++i) ret.push(arr[i].tag);

                dbPTags.Save({ user_id: userId, tags: ret, last_update_time: (new Date()).toUTCString() }, function () { });

                callback(ret);
            });
        });
    },

    extract_users_from_tags: function (session, callback) {
        var tags = [
            "تهران", "ایران", "سینما", "عشق", "طبیعت", "ورزش", "موسیقی", "خوشمزه", "قلب",
            "iran", "tehran"
        ];

        var selected = tags[Math.floor(Math.random() * 10000) % tags.length];
    }
};

exports.InstagramUtil = InstagramUtil;