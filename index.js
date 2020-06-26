const express = require('express')
const _ = require('lodash')

const app = express()

const host = "0.0.0.0";
const port = 9999
const debug = false;

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

app.get('/vnstat', (req, res) => {
    runCmd("vnstat", false, function(results) {
        printResults(res, results);
    });
});

app.get('/vmstat', (req, res) => {
    runCmd("vmstat", ["-wt"], function(results) {
        printResults(res, results);
    });
});

app.get('/date', (req, res) => {
    runCmd("date", false, function(results) {
        printResults(res, results);
    });
});

app.get('/ram', (req, res) => {
    runCmd("free", "-h", function(results) {
        printResults(res, results);
    });
});

app.get('/ps', (req, res) => {
    runCmd("ps", ["-aux"], function(results) {
        printResults(res, results);
    });
});

app.get('/pm2', (req, res) => {
    runCmd("pm2", ["ps"], function(results) {
        printResults(res, results);
    });
});

app.get('/netstat', (req, res) => {
    runCmd("netstat", ["-altp"], function(results) {
        printResults(res, results);
    });
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