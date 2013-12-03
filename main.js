/* global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        AppInit = brackets.getModule('utils/AppInit'),
        COMMAND_ID = 'outofme.bracketsLivereload.enable',
        preferences,
        $lrIcon;

    function sayHello() {
        console.log("Hello World");
    }

    // Register extension
    CommandManager.register('Livereload', COMMAND_ID, sayHello);

    // Initialize PreferenceStorage.
    preferences = PreferencesManager.getPreferenceStorage(module, {
        enabled: false
    });

    AppInit.appReady(function () {
        // Load stylesheet.
        ExtensionUtils.loadStyleSheet(module, 'livereload.css');

        // Add icon to toolbar.
        $lrIcon = $('<a href="#" title="Livereload" id="brackets-livereload-icon"></a>');
        $lrIcon.click(function () {
            CommandManager.execute(COMMAND_ID);
        }).appendTo('#main-toolbar .buttons');
    });
});
