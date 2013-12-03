/* global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        NodeConnection = brackets.getModule('utils/NodeConnection'),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        ProjectManager  = brackets.getModule('project/ProjectManager'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        AppInit = brackets.getModule('utils/AppInit'),
        COMMAND_ID = 'outofme.bracketsLivereload.enable',
        nodeConnection,
        lrDomain,
        isRunning = false,
        preferences,
        $lrIcon;

    function toggleTinyLR() {

        if (!nodeConnection) {
            connectNode();
        } else {
            toggle();
        }

        function toggle() {
            console.log('Hello World');

            lrDomain.toggleTinyLR(!isRunning, 35729).done(function () {
                isRunning = !isRunning;

                $lrIcon.removeClass('error active');
                $lrIcon.addClass(isRunning ? 'active' : '');
                $lrIcon.attr('title', 'Livereload: ' + (isRunning ? 'running' : 'disabled'));

            }).fail(function (err) {

                $lrIcon.addClass('error');
                $lrIcon.removeClass('active');
                $lrIcon.attr('title', 'Livereload has a problem toggling state: ' + err);

                console.error('[brackets-livereload] failed to run livereload.toggleTinyLR', err);
            });

        }

        function connectNode() {
            nodeConnection = new NodeConnection();

            var connectionPromise = nodeConnection.connect(true),
                errorHandler = function (err) {
                    nodeConnection = null;

                    $lrIcon.addClass('error');
                    $lrIcon.attr('title', 'Livereload is having a problem to connect node process: ' + err);

                    console.log('[brackets-livereload] failed to load domain:', err);
                };

            connectionPromise.done(function () {
                var path = ExtensionUtils.getModulePath(module, 'node/index'),
                    loadPromise = nodeConnection.loadDomains([path], true);

                loadPromise.done(function () {
                    lrDomain = nodeConnection.domains.livereload;
                    toggle();
                }).fail(errorHandler);

            }).fail(errorHandler);
        }
    }

    // Register extension
    CommandManager.register('Livereload', COMMAND_ID, toggleTinyLR);

    // Initialize PreferenceStorage.
    preferences = PreferencesManager.getPreferenceStorage(module, {
        enabled: false
    });

    AppInit.appReady(function () {
        // Load stylesheet.
        ExtensionUtils.loadStyleSheet(module, 'livereload.css');

        // Listening to file system changes
        FileSystem.on('change', function (e, changedThing) {
            if (changedThing && isRunning) {
                lrDomain.trigger([changedThing.name]);
                
            }
        });

        // Add icon to toolbar.
        $lrIcon = $('<a href="#" title="Livereload" id="brackets-livereload-icon"></a>');
        $lrIcon.click(function () {
            CommandManager.execute(COMMAND_ID);
        }).appendTo('#main-toolbar .buttons');
    });
});