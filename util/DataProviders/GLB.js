
var globalUtilities = require('../../util/GlobalUtilities.js');
var dbUtil = require('../../util/DBUtil.js');
var variablesCollectionName = "Variables";

var dataModels = {
    Variables: { _id: null, Name: null, Value: null }
}

exports.DataModels = dataModels;

exports.SetVariable = function (data, done) {
    var findOptions = globalUtilities.reduce({ _id: null, Name: null }, data || {});
    dbUtil.upsert(variablesCollectionName, findOptions, globalUtilities.reduce(dataModels.Variables, data), done);
}

exports.GetVariable = function (options, done) {
    dbUtil.get(variablesCollectionName, globalUtilities.reduce(dataModels.Variables, options || {}), null, done);
}