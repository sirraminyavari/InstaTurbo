
var globalUtilities = require('../../util/GlobalUtilities.js');
var dbUtil = require('../../util/DBUtil.js');
var usersCollectionName = "Users";

var dataModels = {
    Users: {
        _id: null,
        user_id: null,
        username: null,
        password: null,
        fullname: null, 
        client_token: null,
        mode: null,
        action_count: null,
        last_action_time: null,
        expiration_time: null
    }
}

exports.DataModels = dataModels;

exports.AddUser = function (data, done) {
    dbUtil.insert(usersCollectionName, globalUtilities.reduce(dataModels.Users, data), done);
}

exports.AddOrUpdateUser = function (data, done) {
    var findOptions = globalUtilities.reduce({ _id: null, user_id: null }, data || {});
    dbUtil.upsert(usersCollectionName, findOptions, globalUtilities.reduce(dataModels.Users, data), done);
}

exports.FindUser = function (options, done) {
    dbUtil.get(usersCollectionName, globalUtilities.reduce(dataModels.Users, options || {}), null, done);
}

exports.EditUser = function (userId, data, done) {
    dbUtil.update(usersCollectionName, { user_id: userId }, globalUtilities.reduce(dataModels.Users, data), done);
}

exports.Edit = function (findOptions, data, done) {
    dbUtil.update(usersCollectionName, findOptions || {}, globalUtilities.reduce(dataModels.Users, data), done);
}