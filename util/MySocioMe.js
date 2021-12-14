var request = require('request');

// Configure the request
var options = function (data) {
    return {
        url: 'http://mysociome.com/ajax/api.ashx',
        method: 'POST',
        headers: {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: data
    };
};

exports.SuggestFollowRequests = function (userIds, callback) {
    request(options({ command: "suggestfollowrequests", user_ids: userIds.join(',') }), function (error, response, body) {
        try {
            if (!error && response.statusCode == 200) callback(JSON.parse(body));
            else if (error) { callback({ error: "an error occured" }); }
        } catch (e) {
            callback({ error: "an error occured" });
        }
    });
};

exports.SaveFollowRequests = function (requests, callback) {
    request(options({ command: "savefollowrequests", requests: requests }), function (error, response, body) {
        if (!error && response.statusCode == 200) callback(body);
        else if (error) { callback({ error: "an error occured" }); }
    });
};

