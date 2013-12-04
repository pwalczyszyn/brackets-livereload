/* global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        NodeConnection = brackets.getModule('utils/NodeConnection'),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        COMMAND_ID = 'outofme.bracketsLivereload.enable',
        AppInit = brackets.getModule('utils/AppInit'),
        isRunning = false,
        nodeConnection,
        port = 35729,
        lrDomain,
        $lrIcon;

    function toggleServer() {
        if (!isRunning) {
            lrDomain.startServer(port).done(function () {

                isRunning = true;
                activateListeners();

            }).fail(function (err) {

                isRunning = false;
                deactivateListeners(err);

            });
        } else {
            lrDomain.stopServer().done(function () {

                isRunning = false;
                deactivateListeners();

            }).fail(function (err) {

                isRunning = false;
                deactivateListeners(err);

            });
        }
    }

    function changeHandler(err, changedThing) {
        if (changedThing && isRunning) {
            lrDomain.trigger([changedThing.name]);
        }
    }

    function activateListeners() {
        $lrIcon
            .removeClass('error')
            .addClass('active')
            .attr('title', 'LiveReload: active');

        // Listening to file system changes
        FileSystem.on('change', changeHandler);
    }

    function deactivateListeners(err) {

        if (!err) {
            $lrIcon
                .removeClass('active error')
                .attr('title', 'LiveReload');
        } else {
            $lrIcon
                .removeClass('active')
                .addClass('error')
                .attr('title', 'LiveReload: ' + (err.code === 'EADDRINUSE' ? 'Port ' + port + ' is already in use.' : err.message));
        }

        // Listening to file system changes
        FileSystem.off('change', changeHandler);
    }

    function initLrDomain(callback) {

        // Creating new node connection
        nodeConnection = new NodeConnection();

        var connectionPromise = nodeConnection.connect(true),
            errorHandler = function (err) {
                nodeConnection = null;

                $lrIcon.addClass('error');
                $lrIcon.attr('title', 'LiveReload is having a problem to connect to node process: ' + err);

                console.log('[brackets-livereload] failed to load domain:', err);

                callback(err);
            };

        connectionPromise.done(function () {
            var path = ExtensionUtils.getModulePath(module, 'node/index'),
                loadPromise = nodeConnection.loadDomains([path], true);

            loadPromise.done(function () {
                lrDomain = nodeConnection.domains.livereload;
                callback();
            }).fail(errorHandler);

        }).fail(errorHandler);
    }

    // Register extension
    CommandManager.register('Livereload', COMMAND_ID, toggleServer);

    AppInit.appReady(function () {
        // Load stylesheet.
        ExtensionUtils.loadStyleSheet(module, 'livereload.css');

        // Add icon to toolbar.
        $lrIcon = $('<a href="#" title="LiveReload" id="brackets-livereload-icon"></a>');
        $lrIcon.click(function () {
            CommandManager.execute(COMMAND_ID);
        }).appendTo('#main-toolbar .buttons');

        // Initializing lrDomain
        initLrDomain(function (err) {
            if (!err) {
                // lr server can be running when brackets was refreshed
                lrDomain.isServerRunning().done(function (running) {

                    isRunning = running;
                    if (isRunning) {
                        activateListeners();
                    }

                }).fail(function (err) {
                    deactivateListeners(err);
                });
            }
        });
    });
});
