var url = require('url');
var buffer = require('buffer/').Buffer;
var sha1 = require('sha1');
var jalali = require('jalaali-js');

var GlobalUtilities = {
    random_str: function (length) {
        var str = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var ret = "";
        for (var i = 0; i < length; ++i)
            ret += str.charAt(GlobalUtilities.random(0, str.length - 1));
        return ret;
    },

    random: function (min, max) {
        if (!min || isNaN(min)) min = 0;
        if (!max || isNaN(max)) max = 9999999999;
        if (max < min) { var t = min; min = max; max = t; }
        if (min == max) return min;
        var lnt = String(max).length;
        return (Math.random() * Math.pow(10, lnt + 1)).toFixed(0) % (max - min + 1) + min;
    },

    get_current_user_id: function (req) {
        return (((req || {}).session || {}).passport || {}).user;
    },

    request_params: function (req) {
        try {
            var ret = {};
            var params = url.parse(req.url, true).query || {};
            for (var k in params) ret[k.toLowerCase()] = params[k];
            ret.get_value = function (key) { return ret[String(key || "abcdefg__nimar").toLowerCase()]; }
            return ret;
        }
        catch (e) { return { get_value: function (key) { } }; }
    },

    get_type: (function () {
        var f = (function () { }).constructor;
        var j = ({}).constructor;
        var a = ([]).constructor;
        var s = ("gesi").constructor;
        var n = (2).constructor;
        var b = (true).constructor;

        return function (value) {
            if (value === null) return "null";
            else if (value === undefined) return "undefined";

            switch (value.constructor) {
                case f:
                    return "function";
                case j:
                    return "json";
                case a:
                    return "array";
                case s:
                    return "string";
                case n:
                    return "number";
                case b:
                    return "boolean";
                default:
                    return String(typeof (value));
            }
        }
    })(),

    extend: function (jsonValue) {
        var hasLevel = arguments.length > 0 && GlobalUtilities.get_type(arguments[arguments.length - 1]) == "number";
        var level = hasLevel ? arguments[arguments.length - 1] : 3;

        var args = arguments.length == (hasLevel ? 2 : 1) && GlobalUtilities.get_type(jsonValue) == "array" ? jsonValue : arguments;

        var first = args.length > 0 ? args[0] : null;
        var second = args.length > 1 ? args[1] : null;

        if (GlobalUtilities.get_type(first) != "json" || GlobalUtilities.get_type(second) != "json") return first;

        for (var o in second) {
            var type = GlobalUtilities.get_type(second[o]);
            if (type == "undefined") continue;

            if (GlobalUtilities.get_type(first[o]) == "json" && GlobalUtilities.get_type(second[o]) == "json" && level > 0)
                first[o] = GlobalUtilities.extend((first[o] || {}), second[o], level - 1);
            else
                first[o] = second[o];
        }

        var newArgs = [first];
        for (var i = 2, lnt = args.length; i < lnt; ++i)
            newArgs.push(args[i]);

        return GlobalUtilities.extend(newArgs, level);
    },

    reduce: function (template, data) {
        var ret = {};
        if (data) {
            for (var k in (template || {}))
                if (data[k] || (data[k] === false) || (data[k] === 0)) ret[k] = data[k];
        }
        return ret;
    },

    to_base64: function (str) {
        if (!str) return "";
        return new Buffer(str).toString('base64');
    },

    from_base64: function (str) {
        if (!str) return "";
        return new Buffer(str, 'base64').toString("utf8");
    },

    to_utf64: function (str) {
        if (!str) return "";
        return new Buffer(str).toString('utf8');
    },

    from_utf64: function (str) {
        if (!str) return "";
        return new Buffer(str, 'utf8').toString("ascii");
    },

    sha1: function (str) {
        return sha1(str);
    },

    _set_number_lenght: function (num, len) {
        var retNum = String(num);
        var numlen = retNum.length;
        for (var i = 0; i < (len - numlen); ++i)
            retNum = "0" + retNum;
        return retNum;
    },

    get_date: function (year, month, day) {
        var dt = isNaN(year) || isNaN(month) || isNaN(day) ? new Date() : new Date(year, month, day);
        return GlobalUtilities._set_number_lenght(dt.getFullYear(), 4) + "-" +
            GlobalUtilities._set_number_lenght(dt.getMonth() + 1, 2) + "-" +
            GlobalUtilities._set_number_lenght(dt.getDate(), 2);
    },

    get_jalali_date: function (year, month, day) {
        return isNaN(year) || isNaN(month) || isNaN(day) ? GlobalUtilities.gregorian2jalali(GlobalUtilities.get_date()) :
            GlobalUtilities._set_number_lenght(year, 4) + "/" + GlobalUtilities._set_number_lenght(month, 2) + "/" +
            GlobalUtilities._set_number_lenght(day, 2);
    },

    jalali2gregorian: function (dt, params) {
        params = params || {};

        var parts = String(dt).split("/");
        var gre = jalali.toGregorian(Number(parts[0]), Number(parts[1]), Number(parts[2]));

        var date = GlobalUtilities._set_number_lenght(gre.gy, 4) + "-" +
            GlobalUtilities._set_number_lenght(gre.gm, 2) + "-" + GlobalUtilities._set_number_lenght(gre.gd, 2);

        return params.json ? { date: date, year: gre.gy, month: gre.gm, day: gre.gd } : date;
    },

    gregorian2jalali: function (dt, params) {
        params = params || {};

        var parts = String(dt).split("-");
        var jal = jalali.toJalaali(Number(parts[0]), Number(parts[1]), Number(parts[2]));

        var date = GlobalUtilities._set_number_lenght(jal.jy, 4) + "/" +
            GlobalUtilities._set_number_lenght(jal.jm, 2) + "/" + GlobalUtilities._set_number_lenght(jal.jd, 2);

        return params.json ? { date: date, year: jal.jy, month: jal.jm, day: jal.jd } : date;
    }
}


for (var k in GlobalUtilities) exports[k] = GlobalUtilities[k];
