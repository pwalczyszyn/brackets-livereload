/* jshint node:true */

var tinylr = require('tiny-lr'),
    server;

function toggleTinyLR(start, port) {
    console.log('toggling tiny-lr, start', start, 'port', port);

    if (start) {
        if (server) {
            server.close();
            server = null;
        }

        server = tinylr();
        server.listen(port, function (err) {
            if (err) {
                return err;
            }

            console.log('Live reload server started on port: ' + port);

            return;
        });

    } else {
        server.close();
        server = null;

        console.log('Stopped livereload server at port: ' + port);

        return;
    }

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
        'toggleTinyLR',
        toggleTinyLR,
        false);
    DomainManager.registerCommand(
        'livereload',
        'trigger',
        trigger,
        false);
};