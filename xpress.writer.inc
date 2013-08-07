<?php

/**
 * Writer function to write data for a field item with text data type.
 * @param Node $node The Drupal Node object
 * @param string $field_name The name of the field to update
 * @param string $language The language code to update the value for
 * @param int $delta The field item index to update
 * @param Array $value Relevant data needed to make the update
 * @param string $view_mode The view mode to save changes for
 */
function xpress_writer_text(&$node, $field_name, $language, $delta, $value, $view_mode) {
  $node->{$field_name}[$language][$delta]['value'] = $value;
}

/**
 * Writer function to write data for a field item with text_long data type.
 * @param Node $node The Drupal Node object
 * @param string $field_name The name of the field to update
 * @param string $language The language code to update the value for
 * @param int $delta The field item index to update
 * @param Array $value Relevant data needed to make the update
 * @param string $view_mode The view mode to save changes for
 */
function xpress_writer_text_long(&$node, $field_name, $language, $delta, $value, $view_mode) {
  $node->{$field_name}[$language][$delta]['value'] = $value;
}

/**
 * Writer function to write data for a field item with text_with_summary data type.
 * @param Node $node The Drupal Node object
 * @param string $field_name The name of the field to update
 * @param string $language The language code to update the value for
 * @param int $delta The field item index to update
 * @param Array $value Relevant data needed to make the update
 * @param string $view_mode The view mode to save changes for
 */
function xpress_writer_text_with_summary(&$node, $field_name, $language, $delta, $value, $view_mode) {
  if ($view_mode == 'teaser') {
    $node->{$field_name}[$language][$delta]['summary'] = $value;
  } else {
    $node->{$field_name}[$language][$delta]['value'] = $value;
  }
}