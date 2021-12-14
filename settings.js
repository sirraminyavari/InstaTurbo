
var systemUrl = "http://localhost:1337";

var settings = {
    SystemURL: systemUrl,
    DBURL: "mongodb://localhost:27017",
    DBName: "InstaTurbo",
    OAuth: {
        Google: {
            AppID: "156249079440-82jmin424kn568r35lr12j1iar4m0kab.apps.googleusercontent.com",
            Secret: "OjP9kqIMoDOgEVS_UE7ynEh2",
            CallbackURL: systemUrl + "/googlelogin/callback",
            LoginScope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
        }
    }
}

exports.Settings = settings;