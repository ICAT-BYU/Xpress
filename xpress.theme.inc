<?php

function xpress_theme_management() {
    return drupal_get_form('xpress_theme_management_form');
}

function xpress_theme_management_form($form, &$form_state) {
    $data = variable_get('xpress_themes', array());
    
    //determine checkbox values and labels
    $themes = list_themes();
    foreach ($themes as $key => $object)
        $checkboxes[$key] = ucwords($object->name);
    
    //build checkboxes field
    $form['themes'] = array(
        '#title' => 'Select the themes that should enable Xpress editing.',
        '#type' => 'checkboxes',
        '#options' => $checkboxes
    );
    
    //modify checkboxes checked state as necissary
    foreach ($checkboxes as $key => $name) {
        if (in_array($key, $data)) {
            $form['themes'][$key] = array(
                '#attributes' => array(
                    'checked' => 'checked'
                )
            );
        }
    }
    
    $form['buttons']            = array(
        '#type' => 'actions'
    );
    $form['buttons']['#weight'] = 100;
    $form['buttons']['submit']  = array(
        '#type' => 'submit',
        '#value' => t('Save'),
        '#weight' => 5,
        '#submit' => array(
            'xpress_theme_management_form_submit'
        )
    );
    
    return $form;
}

function xpress_theme_management_form_submit($form, $form_state) {
    //build the saved data array
    $data = array();
    foreach ($form_state['values'] as $value) {
        if (is_array($value)) {
            foreach ($value as $theme => $checked) {
                if ($checked)
                    $data[] = $theme;
            }
        }
    }
    
    //save the data
    variable_set('xpress_themes', $data);
    
    //show message that save has been successful
    drupal_set_message(t('Changes saved.'));
    
    //redirect to the same path after save
    $form_state['redirect'] = 'admin/config/content/xpress';
}
