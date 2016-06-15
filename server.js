#!/bin/env node
//  OpenShift sample Node application
var restify = require('restify');
var mongojs = require('mongojs');

var ip_addr = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || '8080';

var db_name = process.env.OPENSHIFT_APP_NAME || 'localrnl';

var connection_string = '127.0.0.1:27017/' + db_name;
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(connection_string, [db_name]);
var rnls = db.collection('rnl');


var server = restify.createServer({
    name: 'localrnl'
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

function findAllRnls(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    rnls.find().limit(20).sort({ postedOn: -1 }, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(200, success);
            return next();
        } else {
            return next(err);
        }
    });
}

function findRnl(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    rnls.findOne({ _id: mongojs.ObjectId(req.params._id) }, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(200, success);
            return next();
        }
        return next(err);
    });
}

function postNewRnl(req, res, next) {
    // var rnl = {};
    // rnl.title = req.params.title;
    // rnl.description = req.params.description;
    // rnl.location = req.params.location;
    // rnl.postedOn = new Date();

    res.setHeader('Access-Control-Allow-Origin', '*');
    rnls.save(req.body, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(201, rnl);
            return next();
        } else {
            return next(err);
        }
    });
}

function deleteRnl(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    rnls.remove({ _id: mongojs.ObjectId(req.params._id) }, function (err, success) {
        console.log('Response success ' + success);
        console.log('Response error ' + err);
        if (success) {
            res.send(204);
            return next();
        } else {
            return next(err);
        }
    });
}

var PATH = '/jobs';
var PATH1 = '/poslovi';

server.get({ path: PATH, version: '0.0.1' }, findAllRnls);
server.get({ path: PATH + '/:jobId', version: '0.0.1' }, findRnl);
server.post({ path: PATH, version: '0.0.1' }, postNewRnl);
server.del({ path: PATH + '/:jobId', version: '0.0.1' }, deleteRnl);

server.get({ path: PATH1, version: '0.0.1' }, findAllRnls);
server.get({ path: PATH1 + '/:jobId', version: '0.0.1' }, findRnl);
server.post({ path: PATH1, version: '0.0.1' }, postNewRnl);
server.del({ path: PATH1 + '/:jobId', version: '0.0.1' }, deleteRnl);

server.listen(port, ip_addr, function () {
    console.log('%s listening at %s ', server.name, server.url);
});