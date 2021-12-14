
var globalSettings = require('../settings.js').Settings;
var globalUtilities = require('./GlobalUtilities.js');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

var connect = function (done) {
    mongoClient.connect(globalSettings.DBURL, function (err, client) {
        if (err) console.dir(err);
        else {
            console.dir("Connected!");
            done(client.db(globalSettings.DBName), function () { client.close(); });
        }
    });
}

exports.insert = function (collectionName, data, done) {
    connect(function (db, onFinish) {
        db.collection(collectionName).insert(data, { w: 1 }, function (err, result) {
            onFinish();
            var inserted = ((result || {}).ops || []).length > 0 ? result.ops : null;
            for (var i = 0, lnt = (inserted || []).length; i < lnt; ++i)
                if (inserted[i]._id) inserted[i]._id = inserted[i]._id.toString();
            done(err ? { error: err } : { result: result, inserted: (inserted || []).length == 1 ? inserted[0] : inserted });
        });
    });
}

exports.upsert = function (collectionName, findOptions, data, done) {
    if (findOptions._id) findOptions._id = new mongodb.ObjectID(findOptions._id);

    connect(function (db, onFinish) {
        db.collection(collectionName).update(findOptions, { $set: data || {} }, { upsert: true }, function (err, result) {
            onFinish();
            done(err ? { error: err } : { result: result });
        });
    });
}

exports.update = function (collectionName, findOptions, data, done) {
    if (findOptions._id) findOptions._id = new mongodb.ObjectID(findOptions._id);
    
    connect(function (db, onFinish) {
        db.collection(collectionName).update(findOptions, { $set: data || {} }, { multi: true }, function (err, result) {
            onFinish();
            done(err ? { error: err } : { result: result });
        });
    });
}

exports.get = function (collectionName, options, params, done) {
    params = params || {};

    if (options._id) {
        if (globalUtilities.get_type(options._id) == "array") {
            var dic = {};
            var x = { $in: [] };
            for (var i = 0, lnt = options._id.length; i < lnt; ++i) {
                var id = new mongodb.ObjectID(options._id[i]);
                if (!dic[id]) {
                    x.$in.push(id);
                    dic[id] = true;
                }
            }
            options._id = x;
            delete dic;
        }
        else options._id = new mongodb.ObjectID(options._id);
    }

    connect(function (db, onFinish) {
        var r = db.collection(collectionName).find(options || {});

        if (params.sort) r = r.sort(params.sort);
        if (params.limit) r = r.limit(params.limit);

        r.toArray(function (err, docs) {
            onFinish();
            for (var i = 0, lnt = (docs || []).length; i < lnt; ++i) docs[i]._id = docs[i]._id.toString();
            done(err ? { error: err } : { items: docs });
        });
    });
}

exports.remove = function (collectionName, options, done) {
    if (options._id) options._id = new mongodb.ObjectID(options._id);
    
    connect(function (db, onFinish) {
        db.collection(collectionName).remove(options || {}, function (err, result) {
            onFinish();
            done(err ? { error: err } : result);
        });
    });
}