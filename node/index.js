/* jshint node:true */

var tinylr = require('tiny-lr'),
    server = null;

function startServer(port, callback) {

    if (server) {
        return callback(new Error('LiveReload server is already running.'));
    }

    server = tinylr();
    server.server.on('error', function (err) {
        stopServer();
        callback(err);
    });
    server.listen(port, function (err) {
        if (err) {
            stopServer();
            return callback(err);
        }
        callback();
    });
}

function stopServer(callback) {
    server.server.removeAllListeners('error');
    server.close();
    server = null;

    if (callback) {
        callback();
    }
}

function isServerRunning() {
    return server !== null;
}

function trigger(files) {
    if (server) {
        server.changed({
            body: {
                files: files
            }
        });
    }
}

exports.init = function (DomainManager) {
    if (!DomainManager.hasDomain('livereload')) {
        DomainManager.registerDomain('livereload', {
            major: 0,
            minor: 1
        });
    }
    DomainManager.registerCommand(
        'livereload',
        'startServer',
        startServer,
        true);
    DomainManager.registerCommand(
        'livereload',
        'stopServer',
        stopServer,
        true);
    DomainManager.registerCommand(
        'livereload',
        'isServerRunning',
        isServerRunning,
        false);
    DomainManager.registerCommand(
        'livereload',
        'trigger',
        trigger,
        false);
};
