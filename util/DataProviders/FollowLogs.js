
var globalUtilities = require('../../util/GlobalUtilities.js');
var dbUtil = require('../../util/DBUtil.js');
var collectionName = "FollowLogs";

var dataModels = {
    Follow: {
        _id: null,
        user_id: null,
        target_id: null,
        date: null
    }
}

exports.DataModels = dataModels;

exports.Add = function (data, done) {
    data.date = data.date || (new Date());
    var findOptions = globalUtilities.reduce({ _id: null, user_id: null, target_id: null }, data || {});
    dbUtil.upsert(collectionName, findOptions, globalUtilities.reduce(dataModels.Follow, data), done);
}

exports.Remove = function (userId, targetId, done) {
    dbUtil.remove(collectionName, { user_id: userId, target_id: targetId }, done);
}

exports.Get = function (userId, count, done) {
    dbUtil.get(collectionName, { user_id: userId }, {
        sort: { date: 1 }, limit: count
    }, done);
}