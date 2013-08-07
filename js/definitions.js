(function ($) {

    ///////////////////////////////
    //
    //  READER DEFINITIONS
    //
    ///////////////////////////////

    (function () {

        var text;

        //write text readers
        text = function (data_type, field_name, node, field_item) {
            if (field_name == 'title' && node.firstChild.tagName == 'A') {
                return node.firstChild.innerHTML;
            } else {
                return node.innerHTML;
            }
        };
        Xpress.reader.register('text', text);
        Xpress.reader.register('text_long', text);
        Xpress.reader.register('text_with_summary', text);

        //other readers for other data types need to be written here

    })();


    ///////////////////////////////
    //
    //  COMMAND DEFINITIONS
    //
    ///////////////////////////////

    Xpress.command.register('contentsave', {
        exec: function (field, item, editor, params) {
            var i, j, items, fields, field_data, item_data, content, data = {};

            //get a list of modified Field objects
            fields = Xpress.field.getModified();
            for (i = 0; i < fields.length; i++) {

                //get data about the field that is needed to save
                field_data = fields[i].data();
                items = fields[i].items();

                //make sure that this modification has the proper namespaces
                if (!data[field_data.id]) data[field_data.id] = {};
                if (!data[field_data.id][field_data.field_name]) data[field_data.id][field_data.field_name] = [];

                //go through FieldItem objects and build modified data components
                for (j = 0; j < items.length; j++) {

                    //if the item has been modified then add relevant update data
                    if (items[j].modified()) {
                        //get item data
                        item_data = items[j].data();

                        //get the content via the field item reader
                        content = items[j].read();

                        //add relevant update data
                        data[field_data.id][field_data.field_name].push({
                            value: content,
                            field_name: item_data.field_name,
                            delta: item_data.delta || 0,
                            old_delta: item_data.original_delta || 0,
                            data_type: item_data.field_data_type,
                            language: item_data.language,
                            view_mode: item_data.view_mode,
                            node_id: item_data.id
                        });

                        //field item not modified
                    } else {
                        data[field_data.id][field_data.field_name].push(false);
                    }
                }

            }

            //do an ajax submit to update the fields
            $.post('/admin/xpress/ajax/update', {
                data: data,
                page: Xpress.pageId()
            }, function () {
                //console.info('ajax success');
            });
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        },
        ctrl: true,
        charCode: 's'
    });

    // not having at least one "content edit" for the field select not to break
    // check further!!
    Xpress.command.register('link', {
        exec: function (field, item, editor, params) {},
        state: function (field, item, editor) {
            Xpress.command.INACCESSIBLE;
        },
    });

    Xpress.command.register('editcontent', {
        exec: function (field, item, editor, params) {
            window.location = '/node/' + pagenodeid + '/edit';
            //window.location = '/vanilla/node/edit/' + pagenodeid;
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });


    Xpress.command.register('onestoptask', {
        exec: function (field, item, editor, params) {

            window.location = '/node/add/tasks?location=' + window.location; /* insert url here */
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('onestopchecklist', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/checklists?location=' + window.location; /* insert url here */
            //https://icat-stg.byu.edu/node/add/adaptive-content-image?render=references-dialog
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('onestopoffice', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/offices?location=' + window.location; /* insert url here */
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('onestopadlarge', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/onestop-ad-large?location=' + window.location; /* insert url here */
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('onestopadsmall', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/onestop-ad-small?location=' + window.location; /* insert url here */
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('admissions', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/admissions?location=' + window.location; /* insert url here */

        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('financialaid', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/financialaid?location=' + window.location; /* insert url here */

        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('registrar', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/registrar?location=' + window.location; /* insert url here */

        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('training_content_section', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/training_content_section?location=' + window.location; /* insert url here */

        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('training_positions_page', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/training_positions_page?location=' + window.location; /* insert url here */

        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });


})(jQuery);