<?php
/**
 * xpress_menu() callback function.
 * @param string $bundle The bundle to load the form for.
 * @return type Returns a Drupal form
 */
function xpress_bundle_field_commands($bundle) {
    drupal_add_css(drupal_get_path('module', 'xpress') . '/css/xpress.fields.css');
    return drupal_get_form('xpress_bundle_field_commands_form', $bundle);
}

/**
 * Builds a renderable array to be made into a Drupal form.
 * @param array $form The form.
 * @param array $form_state The state of the form.
 * @param string $bundle The bundle to build the form for.
 * @return array The built form renderable array.
 */
function xpress_bundle_field_commands_form($form, &$form_state, $bundle) {
    //load javascript
    drupal_add_js(drupal_get_path('module', 'xpress') . '/js/xpress.fields.js');
    
    //set the entity type
    $entity = 'node';
    
    // Set the id and identify this as an artwork edit form
    $form['#id'] = 'xpress-manage-commands-form';
    
    // Save the bundle and entity with the form
    $form['entity'] = array(
        '#type' => 'value',
        '#value' => $entity
    );
    $form['bundle'] = array(
        '#type' => 'value',
        '#value' => $bundle
    );
    
    // get a list of all defined xpress commands
    $commands = xpress_get_commands();
    
    //get a list of all Xpress toolbar tabs
    $tab_options = array();
    $toolbar     = xpress_get_toolbar(false);
    if (isset($toolbar['tabs'])) {
        foreach ($toolbar['tabs'] as $tab_key => $tab) {
            $tab_options[$tab_key] = array(
                'title' => is_array($tab['title']) ? implode(', ', $tab['title']) : $tab['title'],
                'description' => is_array($tab['description']) ? implode(', ', $tab['description']) : $tab['description']
            );
            $tab_names[]           = $tab_key;
        }
    }
    
    ///////////////////////////////////////////////
    // Start building the form for each field
    ///////////////////////////////////////////////
    
    //add description details
    $form['instruction_intro'] = array(
        '#markup' => '<p>' . t('For each field below use the following instructions:') . '</p>'
    );
    
    //add instructions
    $form['instruction_tabs']     = array(
        '#markup' => '<p><strong>' . t('Preferred tabs:') . '</strong> ' . t('Checking one or more tabs will cause the Xpress toolbar to display the first enabled checked tab when this field recieves focus.') . '</p>'
    );
    $form['instruction_editable'] = array(
        '#markup' => '<p><strong>' . t('Content editable:') . '</strong> ' . t('Making a field content editable enables direct editing of the field value for <a href="@themes">themes using Xpress</a>. This option is only recommended for text based fields.', array(
            '@themes' => '/admin/config/content/xpress'
        )) . '</p>'
    );
    $form['instruction_selector'] = array(
        '#markup' => '<p><strong>' . t('Selection scope:') . '</strong> ' . t('Content editable regions may specify thier selection scope to prevent editing outside of a specific region of the editable region. The scope should be specified using a CSS selector definition. Ex: "td, th" would allow editing only within table cells while "#stuff a" will restrict editing to links within the node with the id of "stuff".')
    );
    $form['instruction_commands'] = array(
        '#markup' => '<p><strong>' . t('Commands:') . '</strong> ' . t('Select the commands which should executable for each field. <strong>Note:</strong> Checking a command does not guarentee that the command will be executable at all times because selection context also plays a part in a commands active state. On the other hand, not checking a command for a specific field will guarentee that the command will not be enabled for the field.') . '</p>'
    );
    
    
    //add title field if node
    if ($entity == 'node') {
        $form['title'] = _xpress_build_checkboxes($entity, $bundle, 'Title', 'title', 'text', $tab_options, $commands);
        $field_names[] = 'title';
    }
    
    //get field data for the current entity and bundle
    $field_data = field_info_instances($entity, $bundle);
    
    //for each non-deleted field build a fieldset with command checkboxes
    foreach ($field_data as $field_name => $field_value) {
        if (!$field_value['deleted']) {
            //build checkboxes for field
            $field_info        = field_info_field($field_name);
            $field_label       = $field_value['label'];
            $field_type        = $field_info['type'];
            $form[$field_name] = _xpress_build_checkboxes($entity, $bundle, $field_label, $field_name, $field_type, $tab_options, $commands);
            
            //store field name
            $field_names[] = $field_name;
        }
    }
    
    //store all field names
    $form['field_names'] = array(
        '#type' => 'value',
        '#value' => $field_names
    );
    
    //store all command names
    $commands2 = xpress_get_commands(false);
    foreach ($commands2 as $command_name => $value)
        $command_names[] = $command_name;
    $form['command_names'] = array(
        '#type' => 'value',
        '#value' => $command_names
    );
    
    //store all tab names
    $form['tab_names'] = array(
        '#type' => 'value',
        '#value' => $tab_names
    );
    
    //build the submit button
    $form['buttons']            = array(
        '#type' => 'actions'
    );
    $form['buttons']['#weight'] = 100;
    $form['buttons']['submit']  = array(
        '#type' => 'submit',
        '#value' => t('Save'),
        '#weight' => 5,
        '#submit' => array(
            'xpress_bundle_field_commands_submit'
        )
    );
    
    return $form;
}

/**
 * Submit function for the xpress_bundle_field_commands_form() form.
 * @param array $form The form render array.
 * @param array $form_state The form state array.
 */
function xpress_bundle_field_commands_submit($form, &$form_state) {
    //make shortcut variable for values
    $values = $form_state['values'];
    
    //dsm($values);
    
    //get form bundle, entity, and checkboxes
    $entity   = $values['entity'];
    $bundle   = $values['bundle'];
    $fields   = $values['field_names'];
    $commands = $values['command_names'];
    $tabs     = $values['tab_names'];
    
    //try to save settings
    try {
        //go through each field and store information about it to the database
        foreach ($fields as $field_name) {
            $editable = isset($values[$field_name . '_editable']) ? (bool) $values[$field_name . '_editable'] : FALSE;
            $selector = isset($values[$field_name . '_selector']) ? (string) $values[$field_name . '_selector'] : NULL;
            
            /*
            dsm(array(
            'field' => $field_name,
            'editable' => $editable,
            'selector' => $selector,
            ));
            */
            
            //preferred tabs
            $preferred_tabs = array();
            foreach ($tabs as $tab) {
                if (isset($values[$field_name . '__tab__' . $tab]) && $values[$field_name . '__tab__' . $tab])
                    $preferred_tabs[] = $tab;
            }
            xpress_field_preferred_tabs($entity, $bundle, $field_name, $preferred_tabs);
            
            //editable
            if ($editable) {
                //add specified selector
                xpress_field_scope($entity, $bundle, $field_name, $selector);
                
                //non editable
            } else {
                //remove any existing selector
                xpress_field_scope($entity, $bundle, $field_name, NULL);
            }
            
            //store enabled commands for field
            foreach ($commands as $command) {
                if (isset($values[$field_name . '__' . $command]) && $values[$field_name . '__' . $command]) {
                    xpress_command_state($entity, $bundle, $field_name, $command, TRUE);
                } else {
                    xpress_command_state($entity, $bundle, $field_name, $command, FALSE);
                }
            }
        }
        
        //success message
        drupal_set_message('Xpress settings saved.');
        
        //catch any errors
    }
    catch (Exception $e) {
        //error message
        dsm($e);
        drupal_set_message('Xpress commands save failed.', 'error');
    }
    
    //set the form to redirect to the same page
    $form_state['redirect'] = 'admin/structure/types/manage/' . $bundle . '/xpress';
}









/**
 * Take the data regarding xpress command groups and turn it into renderable
 * form checkboxes.
 * @param string $entity The name of the entity.
 * @param string $bundle The name of the bundle.
 * @param string $field_label The label of the field to render commands for.
 * @param string $field_name The name of the field to render commands for.
 * @param string $field_type The Drupal data type for the field.
 * @param array $tabs An array of Xpress toolbar tabs.
 * @param array $commands An array of command groups and commands.
 * @return array Returns a renderable array.
 */
function _xpress_build_checkboxes($entity, $bundle, $field_label, $field_name, $field_type, $tabs, $commands) {
    
    //check if field is of text type
    $is_text_type = FALSE;
    switch ($field_type) {
        case 'text':
        case 'text_long':
        case 'text_with_summary':
            $is_text_type = TRUE;
            break;
    }
    
    //build the render container
    $render = array(
        '#type' => 'fieldset',
        '#title' => $field_label
    );
    
    //get the writer for this field data type
    $writer = xpress_get_writer_function_name($field_type, true, true);
    
    //if there is no writer function then output a message
    if (!$writer) {
        $render['writer'] = array(
            '#markup' => "<p><strong class='xpress-ui-command-red'>" . t('Writer missing') . ':</strong> ' . t("The writer is missing for field type: <em>@type</em>. See documentation for <a href='/admin/xpress/docs/writer'>hook_xpress_writer()</a>.", array(
                '@type' => $field_type
            )) . '</p>'
        );
    }
    
    //if writer then continue to build the form
    if ($writer) {
        
        /////////////////////
        //  PREFERRED TABS
        /////////////////////
        
        //build checkboxes for specifying preferred Xpress toolbar tabs
        if (count($tabs) > 0) {
            $render[$field_name . '_preferred_tabs'] = _xpress_build_preferred_tabs($entity, $bundle, $field_name, $tabs);
        }
        
        
        /////////////////////
        //  CONTENT EDITABLE
        /////////////////////
        
        //build content editable fieldset
        $render[$field_name . '_editable_fieldset'] = array(
            '#type' => 'fieldset',
            '#title' => 'Content Editable'
        );
        
        //build the content editable option
        $render[$field_name . '_editable_fieldset'][$field_name . '_editable'] = array(
            '#type' => 'checkbox',
            '#title' => t('Content editable') . ($is_text_type ? ' <span class="xpress-ui-recommend-yes">[ ' . t('Recommended') . ' ]</span>' : ' <span class="xpress-ui-recommend-no">[ ' . t('Not recommended') . ' ]<span>'),
            '#attributes' => array(
                'class' => array(
                    'xpress-ui-command-field-content-editable'
                )
            )
        );
        
        //potentially check the content editable checkbox
        $scope = xpress_field_scope($entity, $bundle, $field_name);
        if (!is_null($scope))
            $render[$field_name . '_editable_fieldset'][$field_name . '_editable']['#attributes']['checked'] = 'checked';
        
        //build the xpress scope limiter
        $render[$field_name . '_editable_fieldset'][$field_name . '_selector'] = array(
            '#type' => 'textfield',
            '#title' => t('Selection scope'),
            '#default_value' => is_null($scope) ? '' : $scope,
            '#states' => array(
                'visible' => array(
                    ':input[name="' . $field_name . '_editable"]' => array(
                        'checked' => TRUE
                    )
                )
            )
        );
        
        
        /////////////////////
        //  COMMANDS
        /////////////////////
        
        $render[$field_name . '_commands_fieldset'] = array(
            '#type' => 'fieldset',
            '#title' => 'Commands',
            '#attributes' => array(
                'class' => array(
                    'xpress-ui-command-fieldset'
                )
            )
        );
        
        //build the quick links container
        $render[$field_name . '_commands_fieldset']['quicklinks'] = array(
            '#type' => 'container',
            '#attributes' => array(
                'class' => array(
                    'xpress-ui-command-bar clearfix'
                )
            )
        );
        
        //build the tabs container
        $render[$field_name . '_commands_fieldset']['tabs'] = array(
            '#type' => 'container',
            '#attributes' => array(
                'class' => array(
                    'xpress-ui-command-bar clearfix'
                )
            )
        );
        
        //count total commands accessible to field
        $command_count = 0;
        
        //build quicklinks checkboxes
        foreach ($commands['quickstart'] as $group_name => $items) {
            //get commands specific to this field
            $commands_indexed = _xpress_field_commands_array($field_type, $items);
            
            //get the command group render and add to render array
            $group_render = _xpress_build_command_group($entity, $bundle, $field_name, $field_type, $group_name, $commands_indexed);
            
            //if there is a group render then add it to the quicklinks
            if ($group_render) {
                $command_count++;
                $render[$field_name . '_commands_fieldset']['quicklinks'][$field_name . '_' . $group_name] = $group_render;
            }
        }
        
        //build the tabs checkboxes
        foreach ($commands['tabs'] as $group_name => $items) {
            //get commands specific to this field
            $commands_indexed = _xpress_field_commands_array($field_type, $items);
            
            //get the command group render and add to render array
            $group_render = _xpress_build_command_group($entity, $bundle, $field_name, $field_type, $group_name, $commands_indexed);
            
            //if there is a group render then add it to the quicklinks
            if ($group_render) {
                $command_count++;
                $render[$field_name . '_commands_fieldset']['tabs'][$field_name . '_' . $group_name] = $group_render;
            }
        }
        
        //if no commands for the field then say so
        if ($command_count == 0) {
            $render[$field_name . '_commands_fieldset']['nocommands'] = array(
                '#markup' => '<div class=\'xpress-ui-none\'>No commands can be applied to this field type.</div>'
            );
            
            unset($render['toggle_all']);
        }
        
    }
    
    return $render;
}

// get an indexed array of commands for this field
function _xpress_field_commands_array($field_type, $items) {
    $commands = array();
    for ($i = 0; $i < count($items); $i++) {
        $command = $items[$i];
        
        $enabled        = $command['command enabled'] || (is_array($command['command enabled']) && array_search($field_type, $command['command enabled']) !== FALSE);
        $field_specific = $command['field specific'];
        
        //if command is enabled or not field specific then add it to the list of field commands
        if ($enabled || !$field_specific)
            $commands[] = $command;
    }
    return $commands;
}

//build a preferred tabs groups
function _xpress_build_preferred_tabs($entity, $bundle, $field_name, $tabs) {
    //get selected tabs
    $selected = xpress_field_preferred_tabs($entity, $bundle, $field_name);
    
    //make the container
    $render = array(
        '#type' => 'fieldset',
        '#title' => 'Preferred tabs',
        '#attributes' => array(
            'class' => array(
                'xpress-ui-tab-group',
                'clearfix'
            )
        )
    );
    
    //add checkboxes for each tab
    foreach ($tabs as $key => $tab) {
        //build a checkbox
        $checkbox = array(
            '#type' => 'checkbox',
            '#title' => is_array($tab['title']) ? implode(', ', $tab['title']) : $tab['title'],
            '#description' => is_array($tab['description']) ? implode(', ', $tab['description']) : $tab['description'],
            '#return_value' => 1,
            '#attributes' => array(
                'class' => array(
                    'xpress-ui-command-tab-group-checkbox'
                )
            )
        );
        
        if (in_array($key, $selected))
            $checkbox['#attributes']['checked'] = 'checked';
        
        $render[$field_name . '__tab__' . $key] = $checkbox;
    }
    
    return $render;
}

//builds the command group, including group title, check/uncheck links, and command checkboxes
function _xpress_build_command_group($entity, $bundle, $field_name, $field_type, $group_name, $commands) {
    
    //make the group container
    $render = array(
        '#type' => 'container',
        '#attributes' => array(
            'class' => array(
                'xpress-ui-command-group',
                'clearfix'
            )
        )
    );
    
    //make the group title container
    $render['title'] = array(
        '#type' => 'container',
        '#attributes' => array(
            'class' => array(
                'xpress-ui-command-grouptitle'
            )
        ),
        'all' => array(
            '#markup' => '<div class=\'xpress-ui-command-grouptitle-sweep\'><a href=\'#all\'>Check All</a> / <a href=\'#none\'>None</a></div>'
        ),
        'title' => array(
            '#markup' => '<div class=\'xpress-ui-command-grouptitle-title\'>' . ucfirst($group_name) . '</div>'
        )
    );
    
    //add enabled commands
    $count = 0;
    for ($i = 0; $i < count($commands); $i++) {
        $command = $commands[$i];
        $enabled = $command['command enabled'];
        
        //build the default command render checkbox
        $command_render = array(
            '#type' => 'checkbox',
            '#title' => $command['title'],
            '#description' => $command['description'],
            '#return_value' => 1
        );
        
        //add a class to the command render
        $command_render['#attributes']['class'][] = 'xpress-ui-commandgroup-checkbox';
        
        //if command is not field specific then check its value and disable
        if (!$command['field specific']) {
            //set checkbox as checked and disable checkbox
            $command_render['#default_value']          = 1;
            $command_render['#attributes']['checked']  = 'checked';
            $command_render['#attributes']['disabled'] = 'disabled';
            
            //if command is field specific and fits this field then display enabled w/ stored checked value
        } else if ($enabled === TRUE || (is_array($enabled) && in_array($field_type, $enabled))) {
            //increment field specific count
            $count++;
            
            //if field requires content editable then make sure content editable to enable the field
            if ($command['content editable']) {
                $command_render['#states'] = array(
                    'enabled' => array(
                        ':input[name="' . $field_name . '_editable"]' => array(
                            'checked' => TRUE
                        )
                    )
                );
            }
            
            //determine whether the command is currently checked or not
            if (xpress_command_state($entity, $bundle, $field_name, $command['command'])) {
                $command_render['#attributes']['checked'] = 'checked';
            }
            
            //else field is field specific but does not fit this field
        } else {
            $command_render = NULL;
        }
        
        //if command_render is an array then add to the render array
        if ($command_render)
            $render[$field_name . '__' . $command['command']] = $command_render;
    }
    
    //if the count of field specific commands that apply to this field is zero
    //then return an empty array
    return $count > 0 ? $render : NULL;
}

?>
