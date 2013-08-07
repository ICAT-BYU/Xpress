CKEDITOR.plugins.add('listdentation', {
    init: function (editor) {
        var $ = jQuery;

        //create the listindent command
        editor.addCommand('listoutdent', {
            canUndo: true,
            contextSensitive: true,
            startDisabled: true,
            exec: function (editor) {
                editor.execCommand('outdent');
            },
            refresh: function (editor, path) {
                var o, state, command;

                //get the command
                command = editor.getCommand('listoutdent');
                state = CKEDITOR.TRISTATE_DISABLED;

                //determine command state
                if (path.elements.length > 0) {
                    o = $(path.elements[0].$);
                    if (!o.is('li')) o = o.parents('li').first();
                    o = o.parents('ol, ul');
                    if (o.length > 1) state = CKEDITOR.TRISTATE_OFF;
                }

                //update command state
                command.setState(state);
            }
        });

        //create the listoutdent command
        editor.addCommand('listindent', {
            canUndo: true,
            contextSensitive: true,
            startDisabled: true,
            exec: function (editor) {
                editor.execCommand('indent');
            },
            refresh: function (editor, path) {
                var o, state, command;

                //initialize variables
                command = editor.getCommand('listindent');
                state = CKEDITOR.TRISTATE_DISABLED;

                //determine command state based on path
                if (path.elements.length > 0) {
                    o = $(path.elements[0].$);
                    if (!o.is('li')) o = o.parents('li').first();
                    o = o.prevAll('li');
                    if (o.length > 0) state = CKEDITOR.TRISTATE_OFF;
                }

                //update command state
                command.setState(state);
            }
        });
    }
});