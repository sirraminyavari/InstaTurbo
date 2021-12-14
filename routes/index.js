var globalUtilities = require('../util/GlobalUtilities.js');
var instagramUtil = require('../util/InstagramUtil.js').InstagramUtil;
var mysociome = require('../util/MySocioMe.js');
var dbUsers = require("../util/DataProviders/Users.js");

exports.initialize = function (app) {
    app.get("/", function (req, res) {
        res.render('index', { title: 'Express', year: new Date().getFullYear() });
    });

    app.get("/login", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var username = decodeURIComponent(reqParams.get_value("username"));
        var password = decodeURIComponent(reqParams.get_value("password"));
        
        if (!username || !password) return res.send({ error: "ParametersAreNotValid" });

        instagramUtil.login(username, password, function (d, token) {
            res.send({ token: token });
        });
    });

    app.get("/currentuser", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");

        token = "Vyv8a7Lg0KDdP37EsvC3bTEATMfoAyE5zHt7WFLu";

        if (!token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            instagramUtil.current_user(session, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/userid", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userId = reqParams.get_value("user_id");
        
        if (!userId || !token) return res.send({ error: "bad request" });
        
        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.get_user_by_id(session, userId, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/followers", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userId = reqParams.get_value("user_id");
        var count = reqParams.get_value("count");
        
        if (!userId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.followers(session, userId, count, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/follow", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userId = reqParams.get_value("user_id");
        
        if (!userId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.follow(session, userId, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/unfollow", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userId = reqParams.get_value("user_id");
        
        if (!userId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.unfollow(session, userId, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/relationship", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userIds = reqParams.get_value("user_ids");

        userIds = !userIds ? [] : userIds.split(",");
        
        if (!(userIds || []).length || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.relationship(session, userIds, function (d) {
                res.send(d);
            });
        });
    });
    
    app.get("/like", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var mediaId = reqParams.get_value("media_id");
        
        if (!mediaId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.like(session, mediaId, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/comment", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var mediaId = reqParams.get_value("media_id");
        var text = decodeURIComponent(reqParams.get_value("text"));
        
        if (!mediaId || !text || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.comment(session, mediaId, text, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/medialikes", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var mediaId = reqParams.get_value("media_id");
        
        if (!mediaId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.media_likes(session, mediaId, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/mediacomments", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var mediaId = reqParams.get_value("media_id");
        var count = reqParams.get_value("count");
        
        if (!mediaId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.media_comments(session, mediaId, count, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/usermedia", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var userId = reqParams.get_value("user_id");
        var count = reqParams.get_value("count");
        
        if (!userId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.user_media(session, userId, count, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/tagmedia", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var tag = decodeURIComponent(reqParams.get_value("tag"));
        var count = reqParams.get_value("count");
        
        if (!tag || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.tag_media(session, tag, count, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/locationmedia", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var locationId = reqParams.get_value("location_id");
        var count = reqParams.get_value("count");

        if (!locationId || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.location_media(session, locationId, count, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/search", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var query = decodeURIComponent(reqParams.get_value("query"));
        
        if (!query || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.top_search(session, query, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/searchusers", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var query = decodeURIComponent(reqParams.get_value("query"));
        
        if (!query || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.search_users(session, query, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/searchtags", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var query = decodeURIComponent(reqParams.get_value("query"));
        
        if (!query || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.search_tags(session, query, function (d) {
                res.send(d);
            });
        });
    });
    
    app.get("/taginfo", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var tag = decodeURIComponent(reqParams.get_value("tag"));
        
        if (!tag || !token) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.tag_info(session, tag, function (d) {
                res.send(d);
            });
        });
    });

    app.get("/preferredtags", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        
        if (!token) return res.send({ error: "bad request" });
        
        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.get_user_id(session, function (userId) {
                instagramUtil.get_preferred_tags(session, userId, function (d) {
                    res.send({ tags: d });
                });
            });
        });
    });

    app.get("/purchase", function (req, res) {
        var reqParams = globalUtilities.request_params(req);

        var token = reqParams.get_value("token");
        var purchaseCode = reqParams.get_value("purchase_code");

        var days = 0;

        //purchase_code pattern: [purchase_id] + [_gesi_] + [5 random numbers] + [purchase_days days] + [5 random numbers]

        if (purchaseCode) {
            purchaseCode = decodeURIComponent(purchaseCode);
            var gesi = "_gesi_";

            if (purchaseCode.indexOf(gesi)) {
                purchaseCode = String(purchaseCode).substr(purchaseCode.indexOf(gesi) + gesi.length);

                if (purchaseCode && (purchaseCode.length > 10) && /^\d+$/g.test(purchaseCode)) {
                    var _pre = purchaseCode.substr(0, 5);
                    var _post = purchaseCode.substr(purchaseCode.length - 5);

                    days = +purchaseCode.substr(5, purchaseCode.length - 10);
                }
            }
        }

        if (!token || !days) return res.send({ error: "bad request" });

        instagramUtil.session(token, function (session) {
            if (!session) res.send({ error: "session expired" });

            instagramUtil.get_user_id(session, function (userId) {
                dbUsers.FindUser({ user_id: userId }, function (d) {
                    var user = ((d || {}).items || []).length ? d.items[0] : null;

                    var expirationTime = user.expiration_time;

                    dbUsers.EditUser(userId, { expiration_time: "" }, function (r) {
                    });
                });
            });
        });
    });

    app.get("/suggest", function (req, res) {
        mysociome.SuggestFollowRequests([6528825680, 5896027001], function (d) {
            res.send(d);
        });
    });

    app.get("/modejob", function (req, res) {
        change_mode_job();
        res.send({ result: "ok" });
    });

    var job = function () {
        var sessionsDic = {};

        var get_session = function (userId, callback) {
            if (sessionsDic[userId] || (sessionsDic[userId] === false)) return callback(sessionsDic[userId]);

            instagramUtil.session(null, function (session, error) {
                if (session) sessionsDic[userId] = session;
                callback(session);
            }, userId);
        };
        
        var _10minEgo = new Date();
        _10minEgo.setTime(_10minEgo.getTime() - (10 * 60 * 1000));
        
        dbUsers.FindUser({
            $and: [
                { mode: "follow", expiration_time: { $lt: (new Date()) } },
                { $or: [{ action_count: { $lt: 901 } }, { action_count: null }] },
                { $or: [{ last_action_time: { $lt: dt } }, { last_action_time: null }] }
            ]
        }, function (users) {
        });

        dbUsers.FindUser({
            $and: [
                { mode: "unfollow", expiration_time: { $lt: (new Date()) } },
                { $or: [{ action_count: { $lt: 701 } }, { action_count: null }] },
                { $or: [{ last_action_time: { $lt: dt } }, { last_action_time: null }] }
            ]
        }, function (users) {
        });
        
        mysociome.SuggestFollowRequests([6528825680, 5896027001], function (d) {
            var items = (d || {}).Items || [];

            for (var i = 0, lnt = items.length; i < lnt; ++i) {
                get_session(items[i].UserID, function (session) {
                    if (session) instagramUtil.follow(session, items[i].TargetUserID, function () { });
                });
            }

            res.send(d);
        });
    };

    var change_mode_job = function () {
        var _12hoursEgo = new Date();
        _12hoursEgo.setTime(_12hoursEgo.getTime() - (12 * 60 * 60 * 1000));

        dbUsers.Edit({
            expiration_time: { $lt: (new Date()) },
            $or: [
                { mode: null },
                { mode: "unfollow", last_action_time: { $lt: _12hoursEgo } }
            ]
        }, { mode: "follow", action_count: 0 }, function (r) {
            console.log(r);
        });

        dbUsers.Edit({
            expiration_time: { $lt: (new Date()) },
            mode: "follow",
            action_count: { $gte: 900 },
            last_action_time: { $lt: _12hoursEgo }
        }, { mode: "unfollow", action_count: 0 }, function (r) {
            console.log(r);
        });
    }
};