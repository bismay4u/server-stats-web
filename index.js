const express = require('express')
const _ = require('lodash')

const app = express()

const host = "0.0.0.0";
const port = 9999
const debug = false;

const BASE_FOLDER = "/stats";

const CMDARR = {
    "ls": function(res) {
        runCmd("ls", ["-1"], function(results) {
            printResults(res, results);
        });
    },
    "vnstat": function(res) {
        runCmd("vnstat", false, function(results) {
            printResults(res, results);
        });
    },
    "vmstat": function(res) {
        runCmd("vmstat", ["-wt"], function(results) {
            printResults(res, results);
        });
    },
    "date": function(res) {
        runCmd("date", false, function(results) {
            printResults(res, results);
        });
    },
    "ram": function(res) {
        runCmd("free", "-h", function(results) {
            printResults(res, results);
        });
    },
    "ps": function(res) {
        runCmd("ps", ["-aux"], function(results) {
            printResults(res, results);
        });
    },
    "pm2": function(res) {
        runCmd("pm2", ["ps"], function(results) {
            printResults(res, results);
        });
    },
    "netstat": function(res) {
        runCmd("netstat", ["-altp"], function(results) {
            printResults(res, results);
        });
    },
};

app.get('/', (req, res) => {
    routeList = app._router.stack.filter(a => {
        if (a.route != null) {
            if (a.route.path != null && a.route.path != "/") return true;
        }
        return false;
    }).map(a => a.route.path);

    if (!routeList) routeList = [];

    routeList.sort();

    htmlData = "<h4>Welcome to eTuTs Monitoring Service</h4>";
    htmlData += "<ul>";
    routeList.forEach(a => {
        t = a.substr(1);
        htmlData += `<li><a href='${a}'>${t}</a></li>`;
    });
    htmlData += "</ul>";
    htmlData += "<br>";
    htmlData += "<br>";
    htmlData += "Thank you";

    htmlData += "<style>";
    htmlData += "ul, li {list-style:decimal;}";
    htmlData += "a {color: #333;font-size: 16px;padding: 2px;display: inline-block;text-decoration: none;text-transform: lowercase;}";
    htmlData += "</style>";

    res.send(htmlData);
});

app.get(BASE_FOLDER+'/:cmdkey', (req, res) => {
    cmdKey = req.params['cmdkey'];

    if(CMDARR[cmdKey]!=null) CMDARR[cmdKey](res);
    else res.send("Command Not Found");
});

function printResults(res, results, reloadTime) {
    if (debug) console.log(results);

    if (reloadTime == null) reloadTime = 10000;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');


    htmlData = "<a href='/' style='float:right;color: darkred;font-weight:bold;'>Home</a><pre>" + results + "</pre>";

    htmlData += "<style>";
    htmlData += "html,body {font-family: monospace;}";
    //htmlData += "a {color: #333;font-size: 16px;padding: 2px;display: block;text-decoration: none;text-transform: capitalize;}";
    htmlData += "</style>";

    htmlData += "<script>";
    htmlData += "setInterval(function() {window.location.reload();}, " + reloadTime + "); ";
    htmlData += "</script>";

    res.send(htmlData);
}

function runCmd(cmd, args, callBack) {
    var spawn = require('child_process').spawn;
    if (args) {
        if (typeof args == "string") args = [args];
        var child = spawn(cmd, args);
    } else {
        var child = spawn(cmd);
    }

    var resp = "";

    child.stdout.on('data', function(buffer) {
        resp += buffer.toString()
    });
    child.stdout.on('end', function() {
        callBack(resp)
    });
}

app.listen(port, host, () => console.log(`Server started at http://${host}:${port}`));
