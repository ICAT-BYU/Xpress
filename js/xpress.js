(function ($) {

    var Render, //namespace for building the Xpress toolbar UI
        Buttons, //namespace for getting Buttons and managing buttion states (UI)
        Field, //namespace/constructor for managing Field information
        FieldItem, //namespace/constructor for managing FieldItem information
        Page, //stores data about the page
        bod, originalMarginTop;

    // check that data has been saved before exit    
    window.onbeforeunload = function() {
        var CKEDITOR   = window.parent.CKEDITOR;
        var needSave = false;
        var commentArray = [
                            'Smokey Bear says, "Only you can prevent lost changes."', 
                            'Ere you made a change this morning,\nDid you think to save?', 
                            'I don’t always save my changes...\nbut when I do, I use the SAVE button.',
                            'No more rhymes now. I mean it!\nDoes anyone want a peanut?',
                            'We noticed you’ve made some changes.\nYou may want to save them.',
                            'Hey, dude, don’t make it bad\nTake a second and make it better\nRemember to save it onto that site\nThen you just might\nBe making it better.'
                            ];
        var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
        // Check for Dirty values to see if Save should be active
        for(var instanceName in CKEDITOR.instances) {
            if (CKEDITOR.instances[instanceName].checkDirty()) needSave = true;
        }
        if (needSave) {
            return comment;
        } 
    };
        
    //////////////////////////////////
    //								//
    //		CKEDITOR CONFIGURATION  //
    //								//
    //////////////////////////////////

    //turn off automatic ckeditor creation
    CKEDITOR.disableAutoInline = true;

    //remove unused predefined dialog tabs and fields from CKEDITOR
    CKEDITOR.on('dialogDefinition', function (e) {
        var name, dialog, tab, field;
        name = e.data.name;
        dialog = e.data.definition;

        //remove unused fields from table property dialog
        switch (name) {
        case 'link':

            infoTab = dialog.getContents('info');
            targetTab = dialog.getContents('target');
        
            // Limit LINK dialog to URL (remove email)
            //tab.remove('linkType');
            linkTypeField = infoTab.get('linkType');
            linkTypeField.items.splice(2, 1);

            // Limit PROTOCOL dialog to URL (remove ftp, and news)
            //tab.remove('protocol');
            protocolField = infoTab.get('protocol');
            protocolField.items.splice(2, 2);

            // Limit TARGET dialog to notSet and _blank (remove frame, _top, _parent, _self, and popup)
            var targetField = targetTab.get('linkTargetType');
            targetField['items'].splice(1, 2);
            targetField['items'].splice(2, 3); 
            
            
            //remove target and advanced tabs
            //dialog.removeContents('target');
            dialog.removeContents('advanced');
            break;

        case 'table':
        case 'tableProperties':
            //remove fields from table property dialog
            tab = dialog.getContents('info');
            tab.remove('txtWidth');
            tab.remove('txtHeight');
            tab.remove('txtCellSpace');
            tab.remove('txtCellPad');
            tab.remove('txtBorder');
            tab.remove('cmbAlign');
            tab.remove('txtCaption');
            tab.remove('txtSummary');

            //remove tabs from table property dialog
            dialog.removeContents('advanced');
            break;
        }
    });

    CKEDITOR.on( 'instanceCreated', function( event ) {
        var editor = event.editor,
            element = editor.element;
        
        editor.config.extraPlugins = 'justify';
        
        editor.config.extraPlugins = 'menu';
        editor.config.extraPlugins = 'panel';
        editor.config.extraPlugins = 'floatpanel';
        editor.config.extraPlugins = 'dialogui';
        editor.config.extraPlugins = 'contextment';
        editor.config.extraPlugins = 'liststyle';
        
        editor.config.justifyClasses = [ 'rteleft', 'rtecenter', 'rteright', 'rtejustify' ];
        editor.config.allowedContent = true;

        editor.on('instanceReady', function(e) {
            $(e.editor.element.$).removeAttr("title");
        });
        
        editor.on( 'configLoaded', function() {
            editor.config.toolbar = [
                { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline','-','JustifyLeft','JustifyCenter','JustifyRight'] },
                { name: 'links',       items: [ 'Link', 'Unlink', 'Anchor' ] },
                { name: 'insert',      items: [  'Table'] },
                { name: 'others',      items: [ '-' ] },
                { name: 'paragraph',   items: [ 'NumberedList','BulletedList','-','Outdent','Indent'] },
                { name: 'clipboard',   items: [ 'Cut', 'Copy', 'Paste', 'PasteText', '-', 'Undo', 'Redo' ] },
            ];
        });
    });
    
    //when each CKEDITOR instance is ready:
    //1. process CKEDITOR commands
    //2. set command state change listeners
    //3. set selection change listeners
    CKEDITOR.on('instanceReady', function (e) {
        var editor = e.editor,
            editable_container,
            previous_html = editor.getData(),
            field_item = FieldItem.getByNode(editor.element.$),
            field = field_item.field(),
            data = field_item.data(),

            syncFieldItems = function () {
                var nodes, i;

                nodes = field_item.nodes();
                for (i = 0; i < nodes.length; i++) {
                    if (nodes[i] != editor.element.$) nodes[i].innerHTML = editor.element.$.innerHTML;
                }

                //if html has changed then mark the FieldItem object as modified
                if (previous_html != editor.getData()) {
                    //console.info('changed');
                    field_item.modified(true);
                }
            },

            getTitleNodeContainer = function (node, title) {
                var i, result;
                if (node.innerHTML == title) return node;
                for (i = 0; i < node.childNodes.length; i++) {
                    result = getTitleNodeContainer(node.childNodes[i], title);
                    if (result) return result;
                }
                return null;
            },

            selectionInEditableContainer = function (selection) {
                var start, end, range, ranges;

                //get first editable range
                ranges = selection.getRanges(true);
                range = ranges.length > 0 ? ranges[0] : null;
                if (!range) return false;

                //get start and end nodes for range
                start = range.startContainer.$;
                end = range.endContainer.$;

                //make sure start and end nodes are in editable container
                if (!Xpress.node.contains(editable_container, start)) return false;
                if (!Xpress.node.contains(editable_container, end)) return false;

                return true;
            };

        //Get the content editable bounds by identifing the appropriate containing
        //node. The container may vary based on field type or by Xpress settings
        //specified through the Drupal administration pages.
        if (data.title) {
            editable_container = getTitleNodeContainer(editor.element.$, data.title);
        } else if (data.scope) {
            editable_container = $(editor.element.$).find(data.scope);
            editable_container = editable_container.length > 0 ? editable_container[0] : null;
        } else {
            editable_container = editor.element.$;
        }


        //listen for blur to check for a change in html
        editor.on('blur', function (e) {
            //update related field items and note modification
            syncFieldItems();

            //fire the selection change event (it will have fired right before this
            //blur event, but we need it to run after this blur event)
            Xpress.event.trigger('selection', field, field_item, editor);
        });

        // ensure save button state changes on content change
        editor.on('change', function(e) {
            Xpress.refresh();
            syncFieldItems();
        });
        
        //after a command is executed through the CKEDITOR, sync all nodes that use
        //this same FieldItem object.
        editor.on('afterCommandExec', function () {
            syncFieldItems();
        });

        //on selection change:
        // 1. make sure the selection is within the 'selector' scope specified. Ex:
        //  selector scope may be set to 'table' but the content editable region
        //  encompasses the entire div around the table (because tables cannot have
        //  contenteditable='true'). This function would force the selection to stay
        //  within the table
        // 2. fire Xpress selection event
        editor.on('selectionChange', function (e) {
            var ranges, range, o, start, end, n, addr, point,
                selection = e.data.selection,

                isBefore = function (base, find) {
                    var n = Xpress.node.getPrevious(base, function (node) {
                        return node == editor.element.$ || node == find;
                    });
                    if (n == find) return true;
                },

                isAfter = function (base, find) {
                    var n = Xpress.node.getNext(base, function (node) {
                        return node == editor.element.$ || node == find;
                    });
                    if (n == find) return true;
                };
            //get the first range in the selection
            ranges = e.data.selection.getRanges(true);
            range = ranges.length > 0 ? ranges[0] : null;

            //build a CKEDITOR Node object for the container and get its address
            o = new CKEDITOR.dom.node(editable_container);
            addr = o.getAddress();
            point = addr[addr.length - 1];

            //determine if the selection is within the container
            if (editable_container && range) {
                start = range.startContainer.$;
                end = range.endContainer.$;

                //if start of range is outside of container then determine new start of range
                if (!Xpress.node.contains(editable_container, start)) {
                    if (editable_container.parentNode == start) {
                        if (point < range.startOffset) {
                            range.setStart(o, editable_container.childNodes.length);
                        } else {
                            range.setStart(o, 0);
                        }
                    } else if (isAfter(editable_container, start)) {
                        range.setStart(o, editable_container.childNodes.length);
                    } else {
                        range.setStart(o, 0);
                    }
                }

                //if end of range is outside of container then determine new end of range
                if (!Xpress.node.contains(editable_container, end)) {
                    if (editable_container.parentNode == end) {
                        if (point < range.endOffset) {
                            range.setEnd(o, editable_container.childNodes.length);
                        } else {
                            range.setEnd(o, 0);
                        }
                    } else if (isBefore(editable_container, end)) {
                        range.setEnd(o, 0);
                    } else {
                        range.setEnd(o, editable_container.childNodes.length);
                    }
                }
            }

            //set a single range
            selection.selectRanges([range]);


            //fire the selection change event
            Xpress.event.trigger('selection', field, field_item, editor);

            //console.info('selection change');

        });

        //on mouse up update field items
        $(editor.element.$).mouseup(syncFieldItems);

        //on destroy, remove bound mouseup event
        editor.on('destroy', function () {
            $(editor.element.$).unbind('mouseup', syncFieldItems);
        })
    });




    //////////////////////////////////
    //					            //
    //		XPRESS    			    //
    //								//
    //////////////////////////////////

    ;
    (function () {
        var Xpress = {};
        window.Xpress = Xpress;

        //get the page id
        Xpress.pageId = function () {
            return Page.id;
        }

        //refresh the UI for Xpress
        Xpress.refresh = function () {
            var commands, status, buttons, i, j;

            //go through each command, updating UI
            commands = Xpress.command.list();
            for (j = 0; j < commands.length; j++) {
                //get command status
                status = Xpress.command.status(commands[j]);

                //update Xpress toolbar UI
                buttons = Buttons.getByCommand(commands[j], 'Button');
                for (i = 0; i < buttons.length; i++) buttons[i].status(status);
            }

            //trigger refresh events
            Xpress.event.trigger('refresh');

            //refresh render
            Render.refresh();
        }

    })();


    //////////////////////////////////
    //								//
    //		XPRESS EVENTS      	//
    //								//
    //////////////////////////////////

    (function () {
        var handles = {};

        Xpress.event = {};

        //set a function to handle for a specific key
        Xpress.event.handle = function (key, handler) {
            if (!handles[key]) handles[key] = [];
            handles[key].push(handler);
        }

        //run all handlers that match the key
        Xpress.event.trigger = function (key) {
            //console.info('%s %o', key, Array.prototype.slice(arguments, 1));

            var i, params;
            if (handles[key]) {
                params = Array.prototype.slice.call(arguments, 1);
                for (i = 0; i < handles[key].length; i++) {
                    handles[key][i].apply(window, params);
                }
            }
        }

    })();


    //////////////////////////////////
    //								//
    //		XPRESS READER      	//
    //								//
    //////////////////////////////////

    (function () {
        var readers = {};

        Xpress.reader = {};

        /**
         * Register a reader for a specific data type.
         * @param data_type The Drupal data type for the field.
         * @param handle The function to use to produce the reader data.
         * @return Returns the registered handler function.
         **/
        Xpress.reader.register = function (data_type, handle) {
            readers[data_type] = handle;
            return handle;
        }

        /**
         * Get the reader handler for the specified data type or FieldItem
         * @param item A FieldItem object or a data type.
         * @return Returns a the handler function if the reader exists, null otherwise.
         **/
        Xpress.reader.get = function (field_item) {
            var data_type = field_item;
            if (typeof field_item == 'object') data_type = field_item.field().data_type();
            return typeof field_item == 'string' && readers[data_type] ? readers[data_type] : null;
        }

        //get a list of all registered readers
        Xpress.reader.list = function () {
            return readers;
        }

    })();



    //////////////////////////////////
    //								//
    //		XPRESS COMMANDS    	//
    //								//
    //////////////////////////////////

    (function () {
        var commands = {}, command_states = {},

            //function to get a command's status
            command_status = function (command, field, item) {
                var accessible_commands, status, command_object;

                //get accessible commands
                accessible_commands = Drupal.settings.xpress.commands;
                if (field) accessible_commands = accessible_commands.concat(field.commands());

                //get the config object for the command
                command_object = commands[command];

                //get current command status
                if (accessible_commands.indexOf(command) == -1 || !command_object) {
                    status = Xpress.command.INACCESSIBLE;
                } else {
                    status = command_object.state.call(window, field, item, CKEDITOR.currentInstance);
                }

                //if current command status is different than previous known command status
                //then store new status and fire command status change event
                if (command_states[command] != status) {
                    //console.info(command + ": " + status);
                    command_states[command] = status;
                    Xpress.event.trigger('command status change', command, status);
                }

                return status;
            };

        Xpress.command = {};

        //execute an existing command
        Xpress.command.execute = function (command) {
            var parameters, handle;
            if (commands[command]) {

                //if the command is not executable based on command state then exit
                switch (command_status(command, Xpress.selection.field(), Xpress.selection.fieldItem())) {
                case Xpress.command.DISABLED:
                case Xpress.command.INACCESSIBLE:
                    return;
                }

                //get executer function and execution parameters for the command
                handle = commands[command].exec;
                parameters = Array.prototype.slice.call(arguments, 1);

                //execute the command
                handle.call(
                    window,
                    Xpress.selection.field(),
                    Xpress.selection.fieldItem(),
                    CKEDITOR.currentInstance, parameters
                );

                //refresh
                Xpress.refresh();
            }
        }

        /**
         * Return the first command name that is linked to the specified keyboard
         * inputs where the command is also enabled or active.
         **/
        Xpress.command.getByShortcut = function (keyCode, charCode, ctrlKey, altKey, shiftKey) {
            var o, command, ch;
            for (command in commands) {
                o = commands[command];
                ch = String.fromCharCode(charCode).toLowerCase();

                if (o.keyCode != null || o.charCode != null) {
                    if ((o.keyCode === null || o.keyCode === keyCode) &&
                        (o.charCode === null || o.charCode === charCode || o.charCode === ch) &&
                        (o.ctrl === null || o.ctrl === ctrlKey) &&
                        (o.alt === null || o.alt === altKey) &&
                        (o.shift === null || o.shift === shiftKey)) {

                        switch (Xpress.command.status(command)) {
                        case Xpress.command.ENABLED:
                        case Xpress.command.ACTIVE:
                            return command;
                        }
                    }
                }
            }

            return null;
        }

        //get a list of all xpress commands
        Xpress.command.list = function () {
            var command, results = [];
            for (command in commands) results.push(command);
            return results;
        }

        /**
         * Register an Xpress command and its status updating function.
         * @param command The command name.
         * @param config Command configuration instructions included with command.
         **/
        Xpress.command.register = function (command, config) {
            commands[command] = $.extend({
                exec: null, //function that executes the command
                state: null, //function that returns that status of the command
                keyCode: null, //if not null, the required keycode for the shortcut
                charCode: null, //if not null, the character or character code that must be depressed for shortcut
                ctrl: false, //if TRUE, control or command key must be depressed for shortcut
                shift: false, //if TRUE, shift key must be depressed for shortcut
                alt: false //if TRUE, alt key must be depressed for shortcut
            }, config);

            //if keyboard shortcut charcode is specified as a character then make it lower case
            if (typeof commands[command].charCode == 'string') commands[command].charCode = commands[command].charCode.toLowerCase();
        }

        //get the command status
        Xpress.command.status = function (command) {
            return command_status(command, Xpress.selection.field(), Xpress.selection.fieldItem());
        }

        //command status namespace
        Xpress.command.INACCESSIBLE = -1;
        Xpress.command.DISABLED = 0;
        Xpress.command.ACTIVE = 1;
        Xpress.command.ENABLED = 2;

        //listen for selection changes to update command status
        Xpress.event.handle('selection', function () {
            var command;

            //loop through commands, updating command status
            for (command in commands) {
                command_status(command, Xpress.selection.field(), Xpress.selection.fieldItem());
            }

        });

    })();



    //////////////////////////////////
    //								//
    //		XPRESS Node         	//
    //								//
    //////////////////////////////////
    (function () {
        Xpress.node = {};

        /**
         * Determine if the specified node contains another node.
         * @param node The container node.
         * @param find The node to search for.
         * @return Returns TRUE if node contains, FALSE otherwise.
         **/
        Xpress.node.contains = function (node, find) {
            var n = find;
            while (n && n != node) n = n.parentNode;
            return n != null;
        }

        /**
         * Traverse the DOM from the specified node to the first node that matches
         * the selector.
         * @param node The node to start the search from.
         * @param selector jQuery selector or function to identify the next match by
         * @return Returns the DOM Node that matches the selection, if any.
         **/
        Xpress.node.getNext = function (node, selector) {
            var found, wait = true;

            //loop until done
            do {
                //traverse downward
                if (node.nodeType == 1 && node.hasChildNodes() && !wait) {
                    node = node.firstChild;

                    //traverse to the right
                } else if (node.nextSibling) {
                    node = node.nextSibling;
                    wait = false;

                    //traverse upward
                } else {
                    node = node.parentNode;
                    wait = true;
                }

                //see if this node fits the criteria
                if (node) {
                    if (typeof selector == 'string' && $(node).is(selector)) return node;
                    if (typeof selector == 'function' && selector.call(window, node)) return node;
                }
            } while (node && !found);

            //return the final node result
            return node;
        }

        /**
         * Traverse the DOM from the specified node to the first node that matches
         * the selector.
         * @param node The node to start the search from.
         * @param selector jQuery selector or function to identify the next match by
         * @return Returns the DOM Node that matches the selection, if any.
         **/
        Xpress.node.getPrevious = function (node, selector) {
            var found, wait = true;

            //loop until done
            do {
                //traverse downward
                if (node.nodeType == 1 && node.hasChildNodes() && !wait) {
                    node = node.lastChild;

                    //traverse to the right
                } else if (node.previousSibling) {
                    node = node.previousSibling;
                    wait = false;

                    //traverse upward
                } else {
                    node = node.parentNode;
                    wait = true;
                }

                //see if this node fits the criteria
                if (node) {
                    if (typeof selector == 'string' && $(node).is(selector)) return node;
                    if (typeof selector == 'function' && selector.call(window, node)) return node;
                }
            } while (node && !found);

            //return the final node result
            return node;
        }
    })();



    //////////////////////////////////
    //								//
    //		XPRESS FIELDS      	//
    //								//
    //////////////////////////////////
    (function () {

        var ignore;

        //////////////////////////
        //                      //
        //      FIELD           //
        //                      //
        //////////////////////////

        (function () {
            var fields = {};

            //field class definition
            Field = function (ref, data) {

                var Field = {}, //The Field object
                    nodes = []; //DOM nodes that are representatives of this Field object

                //if trying to build an existing Field object then return existing, otherwise register
                if (fields[ref]) return fields[ref];
                fields[ref] = Field;
                //console.info("Field: %o", data);

                //field getters
                Field.ref = function () {
                    return ref;
                };
                Field.title = function () {
                    return data.title;
                };
                Field.label = function () {
                    return data.field_label;
                };
                Field.name = function () {
                    return data.field_name;
                };
                Field.data_type = function () {
                    return data.field_data_type;
                };
                Field.max = function () {
                    return data.max;
                };
                Field.min = function () {
                    return data.min;
                };
                Field.settings = function () {
                    return data.field_settings;
                };
                Field.commands = function () {
                    return data.commands;
                };
                Field.scope = function () {
                    return data.scope;
                };
                Field.data = function () {
                    return $.extend({
                        nodes: Field.nodes(),
                        ref: ref
                    }, data);
                }

                /**
                 * Returns TRUE if the field has been modified.
                 * Modification occurs when:
                 * 1) a field adds, removes, or reorders field items.
                 * 2) the value of an item in the field has changed
                 **/
                Field.modified = function () {
                    var i, items = Field.items();
                    for (i = 0; i < items.length; i++) {
                        if (items[i].modified()) return true;
                    }
                    return false;
                }

                /**
                 * Add a new node to this field. (Multiple nodes for a single Field object.)
                 * @param node The DOM Node to link to this Field object.
                 * @param item_selector jQuery selector for aquiring field items.
                 **/
                Field.add = function (node) {
                    //add this node as a reference to the Field
                    nodes.push(node);
                }

                /**
                 * Remove a node from this field.
                 * @param node The DOM Node to remove from this Field object
                 **/
                Field.remove = function (node) {
                    var index = nodes.indexOf(node);
                    if (index != -1) nodes.splice(index, 1);
                }

                /**
                 * Get an list of all nodes tied to this field.
                 **/
                Field.nodes = function () {
                    return nodes;
                }


                /**
                 * Get a list of all field items
                 * @return Returns an indexed array containing all FieldItem objects.
                 **/
                Field.items = function () {
                    var items, i, index, low, results = [];

                    //get all FieldItem objects and sort into delta order
                    items = Array.prototype.slice.call(FieldItem.getByFieldReference(ref), 0);
                    while (items.length > 0) {
                        //find next lowest delta
                        low = null;
                        for (i = 0; i < items.length; i++) {
                            if (low === null || items[i].delta() < low) {
                                low = items[i].delta();
                                index = i;
                            }
                        }

                        //add FieldItem to results array and remove from items array
                        results.push(items[index]);
                        items.splice(index, 1);
                    }

                    return results;
                }

                /**
                 * Add a field item at the specified index.
                 * @param node The dom Node to insert.
                 * @param index The index of where to insert the node. Default to last index.
                 **/
                Field.itemAdd = function (node, index) {

                }

                Field.itemMove = function (index, toIndex) {

                }

                Field.itemsRemove = function (index) {

                }

                //return the Field object
                return Field;
            }

            Xpress.field = {};

            Xpress.field.getByReference = Field.getByReference = function (ref) {
                return fields[ref] ? fields[ref] : null;
            }

            //get an array of modified field objects
            Xpress.field.getModified = function () {
                var ref, modified_fields = [];
                for (ref in fields) {
                    if (fields[ref].modified()) modified_fields.push(fields[ref]);
                }
                return modified_fields;
            }

        })();

        //////////////////////////
        //                      //
        //      FIELD ITEM      //
        //                      //
        //////////////////////////
        (function () {
            var field_items = {};

            //field item class definition
            FieldItem = function (ref, data) {

                var is_modified, //store whether the field has been modified
                    nodes = [], //the nodes associated with the field item
                    FieldItem = {}, //the FieldItem object,
                    oField, //the Field object this item belongs to
                    reader, //allows reading of the DOM to produce savable data for this field
                    original_delta = data.delta,

                    getHTML = function (node) {
                        var copy = $(node).clone(false);
                        copy.find('.xpress-field').remove();
                        copy.find('.xpress-context-hover').removeClass('xpress-context-hover');
                        copy.find('.xpress-context-active').removeClass('xpress-context-active');
                        return copy.html();
                    },

                    mouseover = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        Xpress.selection.hint(this);
                    },

                    mouseout = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        Xpress.selection.hint(null);
                    },

                    click = function (e) {
                        var pref_tabs, i, button, first, current_is_preferred;

                        //prevent click from being handled by anything else
                        e.preventDefault();
                        e.stopPropagation();

                        //console.info('FieldItem: %o', data);

                        //set the selection to this field Node
                        Xpress.selection.set(this);

                        //find a preffered tab for this field
                        pref_tabs = oField.data().preferred_tabs;
                        for (i = 0; i < pref_tabs.length; i++) {
                            button = Buttons.getByReference(pref_tabs[i]);
                            if (button) {
                                switch (button.status()) {
                                case Xpress.command.ACTIVE:
                                    current_is_preferred = true;
                                case Xpress.command.ENABLED:
                                    if (!first) first = button;
                                    break;
                                }
                            }
                        }

                        //if a preffered tab was found then select it
                        if (first && !current_is_preferred) first.status(Xpress.command.ACTIVE);
                    };

                //if trying to build an existing FieldItem object then return existing,
                //otherwise register the FieldItem object and it's parent field if needed
                if (field_items[ref]) return field_items[ref];
                field_items[ref] = FieldItem;

                //register Field of FieldItem
                oField = Field.getByReference(data.field_ref);
                (function () {
                    var $fields, attr, field_data, field;

                    //get all fields with field reference class
                    $fields = $('.' + data.field_ref);

                    //get field attributes
                    attr = $fields.first().attr('data-xpress');
                    if (attr) field_data = $.parseJSON(attr);
                    if (field_data) field = Field.getByReference(field_data.field_ref);

                    //if a Field object does not exist for this reference then build one now
                    if (field_data && !field) field = Field(data.field_ref, field_data);

                    //add $fields nodes to the Field object
                    if (field) $fields.each(function () {
                        field.add(this);
                    });

                    //store a copy of the Field object
                    oField = field;

                    //store a copy of the reader function
                    reader = Xpress.reader.get(oField.data_type());
                })();




                //getters
                FieldItem.ref = function () {
                    return ref
                }
                FieldItem.field = function () {
                    return oField;
                }
                FieldItem.nodes = function () {
                    return nodes;
                }
                FieldItem.data = function () {
                    return $.extend(
                        oField.data(), {
                            original_delta: original_delta
                        },
                        data
                    );
                }

                //console.info("FieldItem: %o", FieldItem.data());

                //use the reader for this field to produce data that is ready to send
                //to the server
                /**
                 * Use the reader for this field to produce data that is ready to send
                 * to the server.
                 * @return Returns an object contaning information used to save data to server.
                 **/
                FieldItem.read = function () {
                    if (typeof reader == 'function' && nodes.length > 0) {
                        return reader.call(window, oField.data_type, oField.name(), nodes[0], FieldItem);
                    }
                    return null;
                }

                /**
                 * Get or set the modified state for the field item.
                 * Modification occurs when the html within the field item is changed.
                 * @param modified TRUE or FALSE to specify modified state. Defaults to undefined.
                 * @return Returns TRUE if the field item has been modified.
                 **/
                FieldItem.modified = function (modified) {
                    if (typeof modified != 'undefined') is_modified = modified != false;
                    return is_modified || data.delta != original_delta;
                }

                /**
                 * Get or set field item delta.
                 * @param delta The field item delta to set.
                 * @return Returns the current delta.
                 **/
                FieldItem.delta = function (delta) {
                    if (typeof delta != 'undefined') data.delta = delta;
                    return data.delta;
                }

                /**
                 * Get the original delta for the field.
                 **/
                FieldItem.original_delta = function () {
                    return original_delta;
                }

                /**
                 * Add a DOM Node reference for this field item
                 * @param node The DOM Node to add.
                 **/
                FieldItem.add = function (node) {
                    var $node = $(node),
                        contenteditable = oField.scope() !== null;

                    //if this node has already been added as a field item then exit
                    if (nodes.indexOf(node) >= 0) return;

                    //if this the page information has not yet been stored then store it now
                    if (!Page) {
                        Page = {
                            id: data.id,
                            bundle: data.bundle
                        }
                    }

                    //add this node to the list of nodes
                    nodes.push(node);

                    //if the FieldItem object has no reader then edits cannot be saved,
                    //so if there is no reader then exit function now
                    if (!reader) return;

                    //bind events to this field item
                    if (oField.commands().length > 0) {
                        $node.mouseover(mouseover).mouseout(mouseout).click(click);
                    }

                    //if field is set to have content editable then enable ckeditor
                    if (contenteditable) {
                        //make these content areas editable
                        $node.attr('contenteditable', 'true');

                        //disable firefox table editing controls
                        setTimeout(function () {
                            try {
                                document.execCommand("enableObjectResizing", false, "false");
                                document.execCommand("enableInlineTableEditing", false, "false");
                            } catch (e) {}
                        }, 0);

                        //initialize the ckeditor
                        CKEDITOR.inline(node, {
                            customConfig: '',
                            forcePasteAsPlainText: true,
                            disableNativeSpellChecker: false,
                            emailProtection: 'encode'
                         });
                    }
                }

                /**
                 * Remove a node from the FieldItem object. This will not remove the node
                 * from the DOM.
                 * @param node The Node to remove.
                 **/
                FieldItem.remove = function (node) {
                    var name, index, instance,
                        $node = $(node),
                        contenteditable = oField.scope() != null;

                    //remove the node from the nodes array
                    index = nodes.indexOf(node);
                    if (index == -1) return;
                    nodes.splice(index, 1);

                    //get the CKEDITOR instance for this node and destroy it
                    if (contenteditable) {
                        for (name in CKEDITOR.instances) {
                            instance = CKEDITOR.instances[name];
                            if (instance.$ == node) {
                                instance.destroy(false);
                                break;
                            }
                        }
                    }

                    //unbind events and remove content editability
                    $node.unbind('mouseover', mouseover)
                        .unbind('mouseout', mouseout)
                        .unbind('click', click)
                        .removeAttr('contenteditable');
                }

                return FieldItem;
            }

            Xpress.fieldItem = {}

            /**
             * Static namespace function used to get a FieldItem object from its reference.
             * @param ref The string used to reference the FieldItem object.
             **/
            Xpress.fieldItem.getByReference = FieldItem.getByReference = function (ref) {
                return field_items[ref] ? field_items[ref] : null;
            }

            /**
             * Static namespace function used to get a FieldItem object from a node.
             * @param node The node to get the FieldITem object for.
             **/
            Xpress.fieldItem.getByNode = FieldItem.getByNode = function (node) {
                var nodes, ref;
                for (ref in field_items) {
                    nodes = field_items[ref].nodes();
                    if (nodes.indexOf(node) != -1) return field_items[ref];
                }
            }

            /**
             * Get all FieldItems with a specific field reference.
             * @param ref The Field object reference key
             **/
            Xpress.fieldItem.getByFieldReference = FieldItem.getByFieldReference = function (ref) {
                var item_ref, item, results = [];
                for (item_ref in field_items) {
                    item = field_items[item_ref];
                    if (item.data().field_ref == ref) results.push(item);
                }
                return results;
            }

            /**
             * Get a list of all FieldItem objects.
             * @return Returns an object of all FieldItem objects
             **/
            Xpress.fieldItem.list = function () {
                return field_items;
            }

            /**
             * Get a list of all modified FieldItems
             **/
            Xpress.fieldItem.getModified = function () {
                var ref, results = [];
                for (ref in field_items) {
                    if (field_items[ref].modified()) results.push(field_items[ref]);
                }
                return results;
            }

        })();




        //sync all field nodes with field objects. This will not erase already existing objects.
        Xpress.event.handle('refresh', function () {

            //build a list of FieldItem objects that are title fields
            $('#page-title, .xpress-node-title-title').each(function () {
                var $this, $field, attr, data, item;

                //initialize variables
                $this = $(this);
                $field = $this.parents('.xpress-field').first();
                attr = $field.attr('data-xpress');
                if (attr) data = $.parseJSON(attr);
                if (data) item = FieldItem.getByReference(data.item_ref);

                //if a FieldItem object does not exist for this reference then build one
                //now and store it as a new field item
                if (data && !item) item = FieldItem(data.item_ref, data);

                //add this node to the FieldItem object
                if (item) item.add(this);
            });

            //build a list of all new FieldItem objects
            $('.field-item').each(function () {
                var $this, attr, data, item;

                //initialize variables
                $this = $(this);
                attr = $this.attr('data-xpress');
                if (attr) data = $.parseJSON(attr);
                if (data) item = FieldItem.getByReference(data.item_ref);

                //if a FieldItem object does not exist for this reference then build one
                //now and store it as a new field item
                if (data && !item) item = FieldItem(data.item_ref, data);

                //add this node to the FieldItem object
                if (item) item.add(this);
            });

        });


        //initialization function for fields
        Xpress.event.handle('content ready', function () {

            //if click event reaches the body then set selection to none
            bod.click(function () {
                Xpress.selection.set(null);
            });

            //if keypress event reaches body, execute any xpress commands associated with it
            bod.keypress(function (e) {
                var command, field, commands;

                //get a command that fits the current keyboard key combination
                command = Xpress.command.getByShortcut(e.keyCode, e.charCode, e.ctrlKey || e.metaKey, e.altKey, e.shiftKey);

                //if a command fits the keyboard combination then prevent browser handling and execute command
                if (command) {
                    //console.warn('prevent browser keypress handle for: ' + command);

                    //stop the browser and other scripts from handling the event
                    e.preventDefault();
                    e.stopPropagation();

                    //execute the command - execution will not occur if command state is disabled or inaccessible
                    Xpress.command.execute(command);
                }
            });
        });

    })();



    //////////////////////////////////
    //								//
    //		XPRESS SELECTION    	//
    //								//
    //////////////////////////////////

    ;
    (function () {
        var active_field, hint_field, breadcrumbs,
            field_item_selector = '.field-item, .xpress-node-title-title, #page-title',

            getEditorContainingNode = function (node) {
                var o, editor, key;

                //get editor which is node or parent of node
                o = $(node);
                editor = o.is(field_item_selector) ? o : o.parents(field_item_selector).first();

                //if no editor, return null
                if (editor.length == 0) return null;

                //loop through editor instances to find this editor
                for (key in CKEDITOR.instances) {
                    if (CKEDITOR.instances[key].element.$ == editor[0]) return CKEDITOR.instances[key];
                }

                //nothing found
                return null;
            },

            getDrupalItem = function (node) {
                var o = $(node);
                if (o.is(field_item_selector)) return o;
                o = o.parents(field_item_selector).first();
                return o.length > 0 ? o : null;
            };



        Xpress.selection = {};

        /**
         * Set the selection onto the specified node.
         * Setting the node will also fire selection change handlers (unless supressed)
         * and will update the UI to show the selected field and breadcrumb path.
         *
         * @param node The node to select.
         * @param suppressHandlers TRUE to not fire selection change handlers. Defaults to FALSE.
         * @param forceEditorNodeSelection TRUE to force node selection with CKEDITOR. Defaults to FALSE.
         */
        Xpress.selection.set = function (node, suppressHandlers, forceEditorNodeSelection) {
            var o, el, editor, path, i, item, field, field_item;
            //console.warn('set path to %o', node);

            //remove previous active field
            if (active_field) active_field.removeClass('xpress-context-active');

            //set to node
            o = $(node);
            if (node && node instanceof Node) {

                //set new active field
                active_field = getDrupalItem(o);
                if (active_field) active_field.addClass('xpress-context-active');

                //if node exists within CKEDITOR instance then select that node and
                //set focus to the editor
                editor = getEditorContainingNode(o);
                if (editor) {
                    $(editor.element.$).focus();
                    CKEDITOR.currentInstance = editor;

                    if (editor.element.$ != active_field[0] || forceEditorNodeSelection) {
                        el = new CKEDITOR.dom.element(node);
                        editor.getSelection().selectElement(el);
                    }

                    //set focus to the node
                } else {
                    o.focus();
                }

            } else {
                //bod.focus(); // IE takes focus off the edited field if this is set
                active_field = null;
            }

            //if the breadcrumb bar doesn't exist then make it exist now
            if (!breadcrumbs) {
                breadcrumbs = $("<div id='XpressBreadcrumbs' />");
                bod.append(breadcrumbs);
            }

            //clear children from breadcrumb bar
            breadcrumbs.children().remove();

            //add new path children
            path = active_field ? Xpress.selection.path() : [];
            for (i = 0; i < path.length; i++) {
                (function (o) {
                    var item, store;

                    if (o.node.nodeType == 1) {
                        item = $("<a href='#'>" + o.label + "</a>");

                        //on mouseover highlight region
                        item.mouseover(function () {
                            Xpress.selection.hint(o.node);
                        })
                            .mouseout(function () {
                                Xpress.selection.hint(null);
                            });

                        //prevent change of focus
                        item.mousedown(function (e) {
                            e.preventDefault();
                            store = Xpress.selection.store();
                            return false;
                        });

                        //click will place focus on specific node
                        item.mouseup(function (e) {
                            e.preventDefault();
                            setTimeout(function () {
                                Xpress.selection.restore(store);
                                Xpress.selection.set(o.node, true, true);
                            }, 0);
                        });

                        breadcrumbs.append(item);
                    }
                })(path[i]);

            }

            //fire selection handlers
            if (!suppressHandlers) {
                field = Xpress.selection.field();
                field_item = Xpress.selection.fieldItem();
                Xpress.event.trigger('selection', field, field_item, editor);
            }
        }

        /**
         * Get the active FieldItem object based on the current selection
         * @return Returns a FieldItem object or null.
         **/
        Xpress.selection.fieldItem = function () {
            var path, node, item;
            path = Xpress.selection.path();
            while (path.length > 0) {
                node = path.pop().node;
                item = FieldItem.getByNode(node);
                if (item) return item;
            }
            return null;
        }

        /**
         * Get the active Field object based on the current selection.
         * @return Returns a Field object or null
         **/
        Xpress.selection.field = function () {
            var item = Xpress.selection.fieldItem();
            return item ? item.field() : null;
        }

        /**
         * Get the Page object.
         * @return Returns the Page object
         **/
        Xpress.selection.page = function () {
            return Page;
        }

        /**
         * Modify the UI to hint at what field will be selected if a click event
         * occurs.
         **/
        Xpress.selection.hint = function (node) {
            //remove previous hint field
            if (hint_field) hint_field.removeClass('xpress-context-hover');

            //if a node then hint to that location
            if (node && node instanceof Node) {
                hint_field = getDrupalItem(node);
                if (hint_field) hint_field.addClass('xpress-context-hover');
            }
        }

        /**
         * Get the relavent selection path. The path will include all nodes within
         * a CKEDITOR instance from the selected node to the CKEDITOR instance root
         * and will contain all fields that container the selected node.
         *
         * @return Returns an array containing the path from the document body to the selected node.
         **/
        Xpress.selection.path = function () {
            var label, i, item, items, path = [];

            //get the path from the active_field node to the document body
            if (active_field) {
                //get all drupal items at this node and upward
                items = [];
                if (active_field.is(field_item_selector)) items.push(active_field[0]);
                active_field.parents('.field-item').each(function () {
                    items.push(this);
                });

                //go through all items determining nodes, labels, and field properties
                for (i = 0; i < items.length; i++) {
                    //get the clicked field item
                    item = FieldItem.getByNode(items[i]);

                    //if the item is not null then add the field details to the path array
                    if (item) {
                        label = item.field().title();
                        if (label.length > 0) label += ': ';
                        label += item.field().label()

                        path.unshift({
                            node: items[i],
                            label: item.field().label(),
                            data: item.field().data()
                        });
                    }
                }
            }

            return path;
        }

        /**
         * Get the current selection and store it into an object which will be returned.
         * @return Returns an object containing information about the active selection.
         */
        Xpress.selection.store = function () {
            var store, selection, range;

            if (CKEDITOR.currentInstance) {
                store = {
                    editor: CKEDITOR.currentInstance.name,
                    ranges: CKEDITOR.currentInstance.getSelection().getRanges(),
                    field: CKEDITOR.currentInstance.element.$
                }
            } else {
                //get native browser selection
                if (window.getSelection) {
                    selection = window.getSelection();
                } else if (document.selection) { // should come last; Opera!
                    selection = document.selection.createRange();
                }

                //get native browser selection range
                if (selection.getRangeAt)
                    range = selection.getRangeAt(0);
                else { // Safari!
                    range = document.createRange();
                    range.setStart(selectionObject.anchorNode, selectionObject.anchorOffset);
                    range.setEnd(selectionObject.focusNode, selectionObject.focusOffset);
                }

                store = {
                    editor: null,
                    ranges: range,
                    field: active_field
                }
            }
            return store;
        }

        /**
         * Restore a selection if possible.
         * @param store The store object to restore the selection to.
         * @return Returns TRUE if successful, FALSE otherwise.
         */
        Xpress.selection.restore = function (store) {
            var selection;

            try {
                if (store.editor) {
                    CKEDITOR.currentInstance = CKEDITOR.instances[store.editor];
                    if (store.ranges) CKEDITOR.instances[store.editor].getSelection().selectRanges(store.ranges);
                } else {
                    //get native browser selection
                    if (window.getSelection) {
                        selection = window.getSelection();
                    } else if (document.selection) { // should come last; Opera!
                        selection = document.selection.createRange();
                    }

                    //clear selected ranges
                    selection.removeAllRanges();

                    //add range
                    selection.addRange(store.ranges);
                }

                return true;
            } catch (e) {
                return false;
            }
        }
    })();


    //////////////////////////////////
    //								//
    //	XPRESS BUTTONS REFERENCE   //
    //	used for getting buttons    //
    //	by various references       //
    //								//
    //////////////////////////////////

    (function () {
        var commands = {}, buttons = [],

            //Button class, privately scoped to only be accessible by Buttons namespace.
            Button = function (node, command, parentNode, config) {
                //console.info('New button: %o', arguments);

                var button = {}, children = [];

                button.addChild = function (node) {
                    if (children.indexOf(node) == -1) children.push(node);
                }

                button.getChildren = function () {
                    return children;
                }

                button.getParentNode = function () {
                    return parentNode;
                }

                button.getParentButton = function () {
                    return parentNode ? Buttons.getByNode(parentNode) : null;
                }

                button.getCommand = function () {
                    return command;
                }

                button.getNode = function () {
                    return node;
                }

                button.getjQueryObject = function () {
                    return $(node);
                }

                button.getConfig = function () {
                    return config;
                }

                //get or set button status
                button.status = function (status) {
                    var i, index, children, tabgroup_container, newtab, tabgroups,
                        jq = $(node),
                        parent = button.getParentButton(),
                        allChildrenDisabled = function () {
                            children = parent.getChildren();
                            for (i = 0; i < children.length; i++) {
                                if (children[i].status() == Xpress.command.ENABLED) return false;
                            }
                            return true;
                        };

                    //set status if provided
                    if (typeof status != 'undefined') {
                        //console.info('Update ' + (!parent ? 'non-' : '') + 'parent %o to %i', node, status);

                        //if this is a parent button (a.k.a. tab)
                        if (!parent) {
                            //console.warn('%s %s %o', status, command, node);

                            //get this tab's index and its subgroup
                            index = jq.prevAll().length;
                            tabgroup_container = $('#XpressToolbar .xpress-toolbar-tab-group');
                            tabgroups = tabgroup_container.children('.xpress-toolbar-group');

                            switch (status) {
                            case Xpress.command.ENABLED:
                                //apply proper classes
                                jq.removeClass('xpress-active xpress-disabled');

                                break;
                            case Xpress.command.ACTIVE:
                                //remove active state from other tabs
                                jq.siblings().removeClass('xpress-active');

                                //apply proper classes
                                jq.removeClass('xpress-disabled').addClass('xpress-active');

                                //get the index of the tab and use it to show correct tab buttons
                                tabgroups.hide().eq(index).show();
                                break;

                            case Xpress.command.DISABLED:
                            default:
                                //if this tab is active then move active tab to a new location
                                if (jq.hasClass('xpress-active')) {
                                    newtab = jq.siblings().not('.xpress-disabled').first();
                                    newtab.addClass('xpress-active');
                                    if (newtab.length > 0) tabgroups.hide().eq(newtab.prevAll().length).show();
                                }

                                //apply proper classes
                                jq.addClass('xpress-disabled').removeClass('xpress-active');

                                break;
                            }

                            //if non-parent button
                        } else {
                            //console.warn('%s %o', status, node);

                            switch (status) {
                            case Xpress.command.ENABLED:
                                //apply proper classes
                                jq.removeClass('xpress-active xpress-disabled xpress-inaccessible');

                                //if parent is disabled then enable parent
                                if (parent.status() == Xpress.command.DISABLED) parent.status(Xpress.command.ENABLED);
                                break;

                            case Xpress.command.ACTIVE:
                                //apply proper classes
                                jq.removeClass('xpress-disabled xpress-inaccessible').addClass('xpress-active');

                                //if parent is disabled then activate parent
                                if (parent.status() == Xpress.command.DISABLED) parent.status(Xpress.command.ENABLED);
                                break;

                            case Xpress.command.DISABLED:
                                //apply proper classes
                                jq.addClass('xpress-disabled').removeClass('xpress-active xpress-inaccessible');

                                //if all child buttons of parent are disabled then disable parent
                                if (parent.status() != Xpress.command.DISABLED && allChildrenDisabled()) {
                                    parent.status(Xpress.command.DISABLED);
                                }
                                break;

                            case Xpress.command.INACCESSIBLE:
                                //apply proper classes
                                jq.addClass('xpress-inaccessible').removeClass('xpress-active xpress-disabled');

                                //if all child buttons of parent are disabled then disable parent
                                if (parent.status() != Xpress.command.DISABLED && allChildrenDisabled()) {
                                    parent.status(Xpress.command.DISABLED);
                                }
                            }

                        }
                    }

                    //get status based on css class
                    if (jq.hasClass('xpress-active')) {
                        status = Xpress.command.ACTIVE;
                    } else if (jq.hasClass('xpress-disabled')) {
                        status = Xpress.command.DISABLED;
                    } else if (jq.hasClass('xpress-inaccessible')) {
                        status = Xpress.command.INACCESSIBLE;
                    } else {
                        status = Xpress.command.ENABLED;
                    }

                    return status;
                }

                //initialize
                node = $(node)[0];
                if (parentNode instanceof jQuery) parentNode = parentNode[0];

                //add a handler for updating this button's status on command status change
                Xpress.event.handle('command status change', function (command, status) {
                    if (button.getCommand() == command) button.status(status);
                });

                return button;
            };

        Buttons = {

            //get a button by its reference key
            //Note: only tab buttons have a key
            getByReference: function (ref) {
                var i;
                for (i = 0; i < buttons.length; i++) {
                    if (buttons[i].getConfig().key == ref) return buttons[i];
                }
                return null;
            },

            //get all buttons that execute a specific command
            getByCommand: function (command, mode) {
                var results = [],
                    buttons = commands[command];
                if (!buttons) return [];

                switch (mode) {
                case 'node':
                    buttons.each(function () {
                        results.push(this);
                    });
                    break;
                case 'button':
                case 'Button':
                    buttons.each(function () {
                        var b = Buttons.getByNode(this);
                        if (b) results.push(b);
                    });
                    break;
                case 'jQuery':
                    results = buttons;
                    break;
                }

                return results;
            },

            //get all child buttons of a button
            getChildren: function (node) {
                var button = Buttons.getByContainer(node);
                return button ? button.getChildren() : [];
            },

            getByNode: function (node) {
                var i;
                if (node instanceof jQuery) node = node[0];
                if (node.length && node.length > 0) node = node[0];
                if (!(node instanceof Node)) return null;
                for (i = 0; i < buttons.length; i++) {
                    if (buttons[i].getNode() == node) return buttons[i];
                }
                return null;
            },

            getAll: function () {
                return buttons;
            },

            //register a button
            register: function (node, command, parentNode, config) {
                var button, parentButton;

                //create a new button object and store
                button = new Button(node, command, parentNode, config);
                buttons.push(button);

                //store button to this command
                if (command) {
                    if (!commands[command]) {
                        commands[command] = button.getjQueryObject();
                    } else {
                        commands[command].add(button.getNode());
                    }
                }

                //store button to this parent
                if (parentNode) {
                    parentButton = Buttons.getByNode(parentNode);
                    if (parentButton) parentButton.addChild(button);
                }
            }

        }
    })();


    //////////////////////////////////
    //								//
    //		XPRESS TOOLBAR     	//
    //		RENDERING FUNCTIONS     //
    //								//
    //////////////////////////////////

    ;
    (function () {
        var drupalToolbar, xpressToolbar;

        Render = {
            refresh: function () {
                //make sure the critical node references exist
                if (!drupalToolbar) drupalToolbar = $('#toolbar');
                if (!xpressToolbar) xpressToolbar = $('#XpressToolbar');

                //adjust position of xpress toolbar and adjust page top margin
                bod.css('margin-top', originalMarginTop + xpressToolbar.height() + 'px');
                xpressToolbar.css('top', drupalToolbar.height() + 'px');
            },

            button: function (config, mods) {
                var ct, img, text, store;

                //normalize modifications
                mods = $.extend({
                    defaultView: 'icon',
                    onclick: null,
                    parent: null
                }, mods);

                //normalize configuration
                config = $.extend({
                    title: '',
                    description: '',
                    icon: '',
                    command: '',
                    'command arguments': [],
                    view: mods.defaultView
                }, config);


                //build render container
                ct = $("<a href='#' class='xpress-button' />");

                //if visible == true then never hide button
                if (config.visible) ct.addClass('xpress-visible');
                // icat later addition
                if (config.class) ct.addClass(config.class);

                //stopping mousedown event prevents focus being placed on the link
                ct.bind('mousedown', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    //store active editor selection
                    store = Xpress.selection.store();

                    return false;
                });

                //add icon to the container
                if (config.icon) {
                    img = $("<img src='" + config.icon + "' alt='" + config.title + "' />");
                    ct.append(img);
                }

                //add text to the container
                if (config.title) {
                    text = $("<span class='xpress-button-title' />")
                    text.text(config.title);
                    ct.append(text);
                }

                //set the view for the button (text, icon, or both) by adding a class to
                //the container
                switch (config.view) {
                case 'text':
                    ct.addClass('xpress-text');
                    break;
                case 'both':
                    ct.addClass('xpress-both');
                    break;
                case 'icon':
                    ct.addClass('xpress-icon');

                    //if icon only then add a hint bubble on mouseover
                    if (config.title) {
                        ct.attr('title', config.title);
                        ct.tipsy({
                            opacity: 1,
                            offset: 5,
                            gravity: 'nw'
                        });
                    }
                    break;
                }

                //stop mouse up from propagating
                ct.bind('mouseup', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });

                //if onclick function provided then place that as click event handler for
                //the button
                if (typeof mods.onclick == 'function') {
                    ct.click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        //if the button is not disabled then run click function
                        if (!ct.hasClass('xpress-disabled')) {
                            //restore active editor selection before calling handler
                            Xpress.selection.restore(store);

                            mods.onclick.call(ct, e);
                        }
                    });

                    //otherwise if the config contains a command then set up the click event
                    //to execute the command
                } else if (config.command) {
                    //click event executes command
                    ct.click(function (e) {
                        var params;
                        e.preventDefault();
                        e.stopPropagation();

                        //if the button is not disabled then run click function
                        if (!ct.hasClass('xpress-disabled')) {

                            //restore active editor selection before calling handler
                            Xpress.selection.restore(store);

                            //determine exec command parameters
                            params = config['command arguments'];
                            params.unshift(config.command);

                            //execute the command
                            Xpress.command.execute.apply(ct, params);
                        }
                    });
                }

                //register button
                Buttons.register(ct, config.command, mods.parent, config);

                //initialize button state to disabled
                Buttons.getByNode(ct[0]).status(Xpress.command.DISABLED);

                //return the container
                return ct;
            },

            buttonset: function (config, parentButton) {
                var ct, key, first = true;

                //build the buttonset container
                ct = $("<div class='xpress-toolbar-buttonset' />");

                //start adding buttons to button set
                for (key in config) {
                    //add a spacer between buttons
                    if (!first) ct.append("<div class='xpress-toolbar-spacer' />");

                    //add button
                    ct.append(Render.button(config[key], {
                        parent: parentButton
                    }));

                    //not first any more
                    first = false;
                }

                return ct;
            },

            group: function (config, parentButton) {
                var ct, i, o;

                //build quicklinks container
                ct = $("<div class='xpress-toolbar-group' />");

                //build the buttonsets for the quicklinks
                if (config) {
                    for (i = 0; i < config.length; i++) {
                        o = config[i];
                        if (o.items) ct.append(Render.buttonset(o.items, parentButton));
                    }
                }

                //if no child nodes in container then nullify container
                //if (ct.children().length == 0) ct = null;

                return ct;
            },

            toolbar: function (config) {
                var ct, i, group, tabs, groups;

                //build the toolbar container
                ct = $("<div id='XpressToolbar' />");

                //build quicklinks and attach to toolbar
                if (config.quicklinks) ct.append(Render.group(config.quicklinks));

                //build tabs
                if (config.tabs) {
                    //build the tabs group container
                    group = $("<div class='xpress-toolbar-tab-group' />");
                    ct.append(group);

                    //build the tabs container (contains the actual tab UI)
                    tabs = $("<div class='xpress-toolbar-tabs' />");
                    group.append(tabs);

                    //build the tabs and tab button groups
                    for (i = 0; i < config.tabs.length; i++) {
                        //narrow scope using self executing anonymous function
                        ;
                        (function (config) {
                            var row, tab;

                            //build a tab
                            tab = Render.button(config, {
                                defaultView: 'both',
                                onclick: function () {
                                    var node, button;
                                    node = tab[0];
                                    button = Buttons.getByNode(node);
                                    button.status(Xpress.command.ACTIVE);
                                }
                            });

                            //build this tab's buttons group
                            row = Render.group(config.items, tab);

                            //attach tab and row
                            tabs.append(tab);
                            group.append(row);
                        })(config.tabs[i]);
                    }

                    //hide all groups but the first
                    groups = group.children('.xpress-toolbar-group');
                    tabs.children().each(function (index) {
                        if (index > 0) groups.eq(index).css('display', 'none');
                    });
                }

                //append the toolbar to the body
                bod.append(ct);


                //adjust the body margin periodically to fit toolbar and not hide content
                setTimeout(Render.refresh, 50);
                setTimeout(Render.refresh, 150);
                setTimeout(Render.refresh, 350);
                setTimeout(Render.refresh, 750);
                setInterval(Render.refresh, 2000);
            }
        }
    })();

    //////////////////////////////////
    //								//
    //		XPRESS ON DOM READY	//
    //								//
    //////////////////////////////////
    $(function () {
        //store some useful variables (wide scope, but not global)
        bod = $(document.body);
        originalMarginTop = parseInt(bod.css('margin-top'));

        //render the Xpress toolbar
        Render.toolbar(Drupal.settings.xpress.toolbar);

        //fire Xpress content ready event
        Xpress.event.trigger('content ready');

        //fire Xpress refresh event
        Xpress.event.trigger('refresh');

        //set active selected to none
        Xpress.selection.set(null);

        //select first enabled tab to active
        $("#XpressToolbar .xpress-toolbar-tabs a").not('.xpress-disabled').first().click();

        /**
         * Creates the href for the insert content buttons on the page.
         */
        if (typeof pagenodeid != 'undefined') {
            var placeholders = $('.xpress-context-placeholder');

            for (var i = 0; i < placeholders.length; i++) {
                var field = $(placeholders[i]);

                var information = JSON.parse($(field).attr('data-xpress'));

                $(field).attr('href', '/node/' + pagenodeid + '/edit?field=' + information.field_name);
            }

            var xpressfield = $('.field-type-entityreference');

            for (var i = 0; i < xpressfield.length; i++) {

                var haschild = $(xpressfield[i]).find('.contextual-links-wrapper');

                if (haschild.length != 0) {
                    var field = $(xpressfield[i]);
                    var information = JSON.parse($(field).attr('data-xpress'));
                    $(haschild).find('.node-edit a').attr('href', '/node/' + pagenodeid + '/edit?field=' + information.field_name);
                } // end if

            } // end for loop
        }
        // End of code for other module------------------------



    });
})(jQuery);