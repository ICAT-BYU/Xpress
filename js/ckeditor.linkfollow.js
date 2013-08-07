CKEDITOR.plugins.add('linkfollow', {
    init: function (editor) {
        var href, $ = jQuery;

        //create the link follow command
        editor.addCommand('linkfollow', {
            canUndo: false,
            contextSensitive: true,
            startDisabled: true,
            exec: function (editor) {
                if (href) window.open(href);
            },
            refresh: function (editor, path) {
                var i, o, command, found = false;

                href = '';
                command = editor.getCommand('linkfollow');
                for (i = 0; i < path.elements.length; i++) {
                    o = $(path.elements[i].$);
                    if (o.is('a') && o.attr('href').length > 0) {
                        href = o.attr('href');
                        command.setState(CKEDITOR.TRISTATE_OFF);
                        found = true;
                    }
                }
                if (!found) command.setState(CKEDITOR.TRISTATE_DISABLED);
            }
        });

    }
});