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
            var CKEDITOR   = window.parent.CKEDITOR;
  
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
                        
                        // parse out the data-cke-realelement tags for ANCHORS (embedded in <img> tags)
                        imgRegEx = /<img[^>]*>/g;
                        if (imgTags = content.match(imgRegEx)) {
                            for(i=0; i<imgTags.length; ++i) {
                                elementRegEx = /data-cke-realelement="([^"]*)"/g;
                                parts = elementRegEx.exec(imgTags[i]); // this returns the contents of data-cke-realelement="" to parts[1] - bracketed regex
                                if ((parts !== null) && (typeof (parts[1]) !== 'undefined') && (parts[1] !== null)) {
                                    replacement = decodeURIComponent(parts[1])
                                    content = content.replace(imgTags[i],replacement);
                                    parts.length = 0;
                                }
                             }
                        }
                        
                        // SPECIFIC TO SASS TRAINING - make sure editing Display Title elements remain flat text 
                        if ((item_data.field_data_type == "text") && (item_data.field_name == "field_display_title")) {
                            var remTags = /(<([^>]+)>)/ig; // regex for removing HTML tags
                            content = content.replace(remTags, '');
                        }
                        
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
            });
            
            // reset dirty values after save
            for(var instanceName in CKEDITOR.instances) {
                CKEDITOR.instances[instanceName].resetDirty();
            }
            
        },
        state: function (field, item, editor) {
            var needSave = false;
            for(var instanceName in CKEDITOR.instances) {
                if (CKEDITOR.instances[instanceName].checkDirty()) needSave = true;
            }
            if (needSave) {return Xpress.command.ENABLED;}
            else {return Xpress.command.DISABLED;}
        },
        ctrl: true,
        charCode: 's'
    });

    Xpress.command.register('editcontent', {
        exec: function (field, item, editor, params) {
            window.location = '/node/' + pagenodeid + '/edit';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('createcontent', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/';
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
    
    // ----------------- TRAINING --------------------
    Xpress.command.register('admissions', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/admissions';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('financialaid', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/financial-aid';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });

    Xpress.command.register('registrar', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/registrar';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    // ----------------- TRAINING ONESTOP --------------------
    Xpress.command.register('counseling', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/counseling';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('processing', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/processing';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('studentservices', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/student-services';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    // -------------------- TRAINING OTHER ----------------------------
    Xpress.command.register('executivedirector', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/executive-director';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('financialservices', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/financial-services';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('icat', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/icat';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('technologyapplications', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/technology-applications';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('treasuryservices', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/treasury-services';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    // -------------------- TRAINING MISC ----------------------------
    Xpress.command.register('assessment', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/quiz';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('saasposition', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/saas-position';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });
    Xpress.command.register('newspost', {
        exec: function (field, item, editor, params) {
            window.location = '/node/add/training-news-post';
        },
        state: function (field, item, editor) {
            return Xpress.command.ENABLED;
        }
    });


})(jQuery);