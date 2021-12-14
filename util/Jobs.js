
var globalSettings = require('../settings.js').Settings;
var globalUtilities = require('./GlobalUtilities.js');

var usersProvider = require('./DataProviders/Users.js');

var agenda = new require('agenda')({
    name: "ScheduledJobs",
    defaultConcurrency: 10,
    maxConcurrency: 20,
    db: {
        address: globalSettings.DBURL, collection: "ScheduledJobs", options: { server: { auto_reconnect: true } }
    }
});

var create_users = function (users, done) {
    var _do = function (usersArr) {
        var usr = (usersArr || []).length == 0 ? null : usersArr[0];

        if (!usr) return done ? done() : null;
        
        usersProvider.AddUser(usr, function (result) {
            var arr = [];
            for (var i = 1, lnt = usersArr.length; i < lnt; ++i) arr.push(usersArr[i]);

            _do(usersArr = arr);
        });
    }

    _do(users);
}

agenda.define("InitializeUsers", { priority: 'high', concurrency: 10 }, function (job, done) {
    done();
    
    usersProvider.FindUser({}, function (result) {
        if (((result || {}).items || []).length > 0) return;
        
        var users = [
            { UserName: "ramin", Password: globalUtilities.sha1("ramin"), FirstName: "رامین", LastName: "یاوری" },
            { UserName: "khashayar", Password: globalUtilities.sha1("khashayar"), FirstName: "خشایار", LastName: "جهانیان" },
            { UserName: "vahid", Password: globalUtilities.sha1("vahid"), FirstName: "وحید", LastName: "اسلامی" },
            { UserName: "mohamadreza", Password: globalUtilities.sha1("mohamadreza"), FirstName: "محمدرضا", LastName: "بلوری" },
            { UserName: "jafar", Password: globalUtilities.sha1("jafar"), FirstName: "سید محمد جعفر", LastName: "مرتضوی" },
            { UserName: "fateme", Password: globalUtilities.sha1("fateme"), FirstName: "فاطمه", LastName: "رضایی" },
            { UserName: "farzane", Password: globalUtilities.sha1("farzane"), FirstName: "فرزانه", LastName: "مختاری" },
            { UserName: "majid", Password: globalUtilities.sha1("majid"), FirstName: "مجید", LastName: "زیدآبادی" }
        ];
        
        create_users(users);
    });
});

exports.initialize = function () {
    agenda.on('ready', function () {
        agenda.now('InitializeUsers');
        
        agenda.start();
    });
}