
var globalUtilities = require('../../util/GlobalUtilities.js');
var dbUtil = require('../../util/DBUtil.js');
var collectionName = "PreferredTags";

var dataModels = {
    PreferredTags: {
        _id: null,
        user_id: null,
        tags: null,
        last_update_time: null
    }
}

exports.DataModels = dataModels;

exports.Save = function (data, done) {
    var findOptions = globalUtilities.reduce({ _id: null, user_id: null }, data || {});
    dbUtil.upsert(collectionName, findOptions, globalUtilities.reduce(dataModels.PreferredTags, data), done);
}

exports.Get = function (userId, done) {
    dbUtil.get(collectionName, globalUtilities.reduce(dataModels.PreferredTags, { user_id: userId }), null, function (d) {
        done(((d || {}).items || []).length ? d.items[0] : d);
    });
}