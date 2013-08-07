<?php

function xpress_documentation($page) {
    drupal_add_css(drupal_get_path('module', 'xpress') . '/css/xpress.documentation.css');
    
    $function = '_xpress_documentation_' . $page;
    if (function_exists($function))
        return drupal_get_form($function);
    return drupal_get_form('_xpress_documentation_home');
}

function _xpress_documentation_home($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['about'] = array(
        '#markup' => '<h2>' . t('About') . '</h2><p>' . t('Xpress is a module that
      allows content managers to make changes to their web content directly on
      the web page. This provides the advantage of allowing editors to see
      exactly how their changes will appear to their indended audience once they
      save those changes.') . '</p>'
    );
    
    $form['quickstart'] = array(
        '#markup' => '<h2>' . t('Quickstart') . '</h2><p>' . t('For content managers
      to use Xpress three things need to happen:') . '</p>
      <ol>
        <li>' . t('Editors must must be granted the <em>Xpress editor</em> role through
          the <a href="/admin/people/permissions">Drupal permissions system</a>.') . '</li>
        <li>' . t('The theme editors will be using must be enabled as an
          <a href="/admin/config/content/xpress">Xpress theme</a>.') . '</li>
        <li>' . t('The <a href="/admin/structure/types">fields specific settings</a>
          of each content type must be configured.') . '</li>
        <li>' . t('Optionally, set empty fields	to display a placeholder by
					<a href="/admin/structure/types">managing the display</a> for each field
					within each content type.') . '</li>
      </ol>'
    );
    
    $form['quickstart_dev'] = array(
        '#markup' => '<h2>' . t('Developer Quickstart') . '</h2><p>' . t('To build
			tools and widgets for Xpress:') . '</p>
      <ol>
        <li>' . t('Use <a href="/admin/xpress/docs/toolbar">hook_xpress_toolbar()</a>
					to add additional buttons and tabs to the toolbar.') . '</li>
        <li>' . t('<a href="/admin/xpress/docs/reader">Create a reader</a> for
					each new data type. By default Xpress handles the text, text_long, and
					text_with_summary data types.') . '</li>
        <li>' . t('<a href="/admin/xpress/docs/writer">Create a writer</a> for
					each new data type. By default Xpress handles the text, text_long, and
					text_with_summary data types.') . '</li>
        <li>' . t('<a href="/admin/xpress/docs/javascript">Include relevant JavaScript</a>
					files that are needed.') . '</li>
        <li>' . t('<a href="/admin/xpress/docs/ckeditor">If the plugin includes
					a CKEDITOR widget</a> then use <a href="/admin/xpress/docs/ckeditor">
					hook_xpress_ckplugin()</a>.') . '</li>
        <li>' . t('<a href="/admin/xpress/docs/commands">Define commands</a>
					that can be used by the editor.') . '</li>
      </ol>'
    );
    
    $form['other'] = array(
        '#markup' => '<h2>' . t('Other Documentation') . '</h2><p>' . t('The
      remainder of the documentation for Xpress is about extending Xpress
      functionality through Drupal hooks and through JavaScript. This documentation
      is available through Xpress documentation navigation menu.') . '</p>'
    );
    
    return $form;
}

function _xpress_documentation_toolbar($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['toolbar_about'] = array(
        '#markup' => '<h2>' . t('Toolbar') . '</h2><p>' . t('Use hook_xpress_toolbar()
			to add buttons and tabs to the Xpress toolbar and to define Xpress
			commands. hook_xpress_toolbar() must
			return an associative array that provides details on the buttons and tabs
			to add to the toolbar. The array must start with at least one of two keyed
			indeces: <em>@tab</em> and <em>@quicklinks</em>', array(
            '@tab' => 'tab',
            '@quicklinks' => 'quicklinks'
        )) . '</p>'
    );
    
    $form['toolbar_example_intro'] = array(
        '#markup' => '<p>' . t('The following is a code sample of what
			hook_xpress_toolbar() should return:') . '</p>'
    );
    
    $form['toolbar_example'] = array(
        '#markup' => "<pre><code>
function mymodule_xpress_toolbar() {
  return array(" . _xpress_documentation_code_quicklinks() . _xpress_documentation_code_tabs() . "
  );
}
</code></pre>"
    );
    
    $form = _xpress_documentation_toolbar_buttons($form, $form_state);
    
    $form = _xpress_documentation_toolbar_groups($form, $form_state);
    
    $form = _xpress_documentation_toolbar_bars($form, $form_state);
    
    $form = _xpress_documentation_toolbar_quicklinks($form, $form_state);
    
    $form = _xpress_documentation_toolbar_tabs($form, $form_state);
    
    return $form;
}

function _xpress_documentation_toolbar_buttons($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['buttons_about'] = array(
        '#markup' => '<h2>' . t('Buttons') . '</h2><p>' . t('The most fundamental
			unit of the toolbar, a toolbar button
			contains the information that links the button to fields, commands, readers,
			writers, and so forth. Each button is uniquely keyed within its respective group. If
			the unique key is used by another module later to create a button in the
			same namespace then the second button will be ignored. Each button should
			return the following fields:') . '</p>
      <ul>
        <li><strong>title:</strong> ' . t('The title of the button as will be
					seen by users.') . '</li>
        <li><strong>command:</strong> ' . t('The execution command to be called
					in JavaScript when the button is activated.') . '</li>
        <li><strong>command enabled:</strong> ' . t('TRUE to enable this command
					for all data types or an array of strings for each data type this
					command should be active for.') . '</li>
        <li><strong>description:</strong> ' . t('(optional) The description of
					the button as will be seen by users who are managing commands per
					field per content type. Defaults to an empy string.') . '</li>
        <li><strong>icon:</strong> ' . t('(optional) The path to the image that
					should be used as an icon for this button. Defaults to an empty string') . '</li>
        <li><strong>command arguments:</strong> ' . t('(optional) An array of
					parameters that should always be passed in with the command when the
					button is activated. Defaults to an empty array.') . '</li>
        <li><strong>content editable:</strong> ' . t('(optional) TRUE to specify
					that this button and command will only be accessible when the field
					is content editable. Defaults to TRUE.') . '</li>
        <li><strong>field specific:</strong> ' . t('(optional) TRUE to specify
					that this command is specific to each field. FALSE to specify that the
					command is general. Defaults to TRUE.') . '</li>
        <li><strong>weight:</strong> ' . t('(optional) The weight of the button
					determines its position in the button group. Lower values push the
					button towards the front of the toolbar.') . '</li>
      </ul>'
    );
    
    return $form;
}

function _xpress_documentation_toolbar_groups($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['groups_about'] = array(
        '#markup' => '<h2>' . t('Groups') . '</h2><p>' . t('A group consists of
			one or more buttons which are to be grouped visually. Each
			group is uniquely keyed within its respective bar. If a second module
			places buttons within the same group then those buttons will be added
			to the existing group. Each group consists of the following:') . '</p>
      <ul>
        <li><strong>items:</strong> ' . t('An associative array of buttons that
					belong to the group.') . '</li>
        <li><strong>weight:</strong> ' . t('(optional) The weight of the group
					determines its position in the group\'s bar. Lower values push the
					group towards the front of the bar.') . '</li>
      </ul>'
    );
    
    return $form;
}

function _xpress_documentation_toolbar_bars($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['bars_about'] = array(
        '#markup' => '<h2>' . t('Bars') . '</h2><p>' . t('A bar consists of
			one or more groups. Each bar is uniquely keyed within its respective
			container. The quicklinks is a container for single bar, whereas each tab is linked
			to a single bar. If a second module uses the same namespace as an existing
			bar then those groups within the bar will be merged
			places buttons within the same group then those buttons will be added
			to the existing group. Each group consists of the following:') . '</p>
      <ul>
        <li><strong>items:</strong> ' . t('An associative array of buttons that
					belong to the group.') . '</li>
        <li><strong>title:</strong> ' . t('If the bar belongs to a tab, this is
					the title that will be placed onto the tab.') . '</li>
        <li><strong>items:</strong> ' . t('An associative array of buttons that
					belong to the group.') . '</li>
        <li><strong>icon:</strong> ' . t('(optional) If the bar belongs to a tab,
					this is the icon that will be placed onto the tab.') . '</li>
        <li><strong>visible:</strong> ' . t('(optional) If the bar belongs to a
					tab, TRUE will make the tab always appear visible. If FALSE then the
					tab will disappear when all buttons within the tab are disabled. Defaults
					to FALSE.') . '</li>
        <li><strong>weight:</strong> ' . t('(optional) If the bar belongs to a
					tab then the weight of the bar determines the order of the tab compared
					to other tabs. Lower values push the tab towards the left.') . '</li>
      </ul>'
    );
    
    return $form;
}

function _xpress_documentation_toolbar_quicklinks($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['quicklinks_about'] = array(
        '#markup' => '<h2>' . t('Quicklinks') . '</h2><p>' . t('Toolbar quicklinks
      are listed on a single row at the top of the toolbar and buttons within
			the quicklinks bar are visible even when disaled.') . '</p>'
    );
    
    $form['quicklinks_code'] = array(
        '#markup' => "<pre><code>
function mymodule_xpress_toolbar() {
  return array(" . _xpress_documentation_code_quicklinks() . "
  );
}
</code></pre>"
    );
    
    return $form;
}

function _xpress_documentation_toolbar_tabs($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['tabs_about'] = array(
        '#markup' => '<h2>' . t('Tabs') . '</h2><p>' . t('Toolbar tabs are listed
			below the quicklinks bar. Each tab contains its own bar which is active
			when the tab is active. Tabs will only be active when at least one button
			within the tab is active.') . '</p>'
    );
    
    $form['tabs_code'] = array(
        '#markup' => "<pre><code>
function mymodule_xpress_toolbar() {
  return array(" . _xpress_documentation_code_tabs() . "
  );
}
</code></pre>"
    );
    
    return $form;
}

function _xpress_documentation_javascript($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['javascript_heading'] = array(
        '#markup' => '<h2>' . t('JavaScript Files') . '</h2>'
    );
    
    $form['javascript_intro'] = array(
        '#markup' => '<p>' . t('If defining a new commands or a new reader for Xpress
			then it will be necissary to include the JavaScript files that contain
			those definitions. Because Xpress JavaScript files will only be loaded
			if the user has access to use Xpress on a page, it is best to include
			those JavaScript files using hook_xpress_javascript(). This hook function
			should return an array of strings where each string is a path to the
			JavaScript file that needs to be loaded. See the following example:') . '</p>'
    );
    
    $form['javascript_code'] = array(
        '#markup' => '<pre><code>
function hook_xpress_javascript() {
  return array(
    \'/path/to/js/definitions.js\',
  );
}
			</code></pre>'
    );
    
    return $form;
}

function _xpress_documentation_ckplugins($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['ckeditor_heading'] = array(
        '#markup' => '<h2>' . t('CKEditor Plugins') . '</h2>'
    );
    
    $form['ckeditor_intro'] = array(
        '#markup' => '<p>' . t('Xpress uses the CKEditor library for HTML5 WYSIWYG
			editing, although it bypasses the Drupal module for the CKEditor. Because
			of this, any CKEditor plugins created which should be implemented into the
			CKEditor must use hook_xpress_ckplugin(). This hook function must return
			an associative array of plugin items to include. Each item should include
			the following attirbutes:') . '</p>
      <ul>
        <li><strong>name:</strong> ' . t('The keyed name of the CKEditor plugin.') . '</li>
        <li><strong>desc:</strong> ' . t('A short description for the plugin.') . '</li>
        <li><strong>path:</strong> ' . t('The path to the JavaScript file that
					defines the plugin.') . '</li>
      </ul>
			<p>' . t('The following is a code sample for how to use hook_xpress_ckplugin():') . '</p>'
    );
    
    $form['ckeditor_code'] = array(
        '#markup' => "<pre><code>
function hook_xpress_ckplugin() {
  return array(
    'listdentation' => array(
      'name' => 'listdentation',
      'desc' => t('Plugin for advanced list indent and outdent commands.'),
      'path' => '/path/to/plugin/ckeditor.listdentation.js',
    ),
    'linkfollow' => array(
      'name' => 'linkfollow',
      'desc' => t('Plugin for creating a command to follow a link within the editor.'),
      'path' => '/path/to/plugin/ckeditor.linkfollow.js',
    ),
  );
}
			</code></pre>"
    );
    
    return $form;
}

function _xpress_documentation_commands($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['commands_heading'] = array(
        '#markup' => '<h2>' . t('Commands') . '</h2>'
    );
    
    $form['commands_intro'] = array(
        '#markup' => '<p>' . t('Commands are used to execute functionality both within
			the CKEditor editable regions and outside of those editable regions. A
			command may consist of functionality for turning text to bold styling, adding
			a link, or saving content. Commands are what provide custom functionality
			to Xpress users. To register a command that can be executed by a toolbar
			button, by a keyboard shortcut, or programatically, use the JavaScript
			function Xpress.command.register() with the following input configuration
			parameters:') . '</p>
			<p><strong>Xpress.command.register(command_name, configuration)</strong></p>
      <ul>
        <li><strong>command_name:</strong> ' . t('The unique name for this command.') . '</li>
        <li><strong>configuration:</strong> ' . t('A generic JavaScript object
					containing the following properties:.') . '
					<ul>
						<li><strong>exec:</strong> ' . t('Function to execute when the command
							is called. This function will recieve four input parameters: 1)
							field object, 2) field item object, 3) editor object, and 4) an
							array of additional parameters.') . '</li>
						<li><strong>state:</strong> ' . t('Function used to determine the
							state of the command, whether active, enabled, disabled, or inaccessible.
							The values for these states can be accessed via Xpress.command.ACTIVE,
							Xpress.command.ENABLED, Xpress.command.DISABLED, or
							Xpress.command.INACCESSIBLE.') . '</li>
						<li><strong>ctrl:</strong> ' . t('Part of the keyboard shortcut
							configuration. TRUE specifies that the Ctrl key must be
							depressed for the keyboard shortcut to this command to fire.') . '</li>
						<li><strong>alt:</strong> ' . t('Part of the keyboard shortcut
							configuration. TRUE specifies that the Alt key must be
							depressed for the keyboard shortcut to this command to fire.') . '</li>
						<li><strong>shift:</strong> ' . t('Part of the keyboard shortcut
							configuration. TRUE specifies that the Shift key must be
							depressed for the keyboard shortcut to this command to fire.') . '</li>
						<li><strong>charCode:</strong> ' . t('The ascii code of the accompanying
							key for the keyboard shortcut, or a string with a single character
							to match.') . '</li>
						<li><strong>keyCode:</strong> ' . t('The key code of the accompanying
							key for the keyboard shortcut.') . '</li>
					</ul>
				</li>
      </ul>
			<p>' . t('The following is a code sample for how to register a command:') . '</p>'
    );
    
    $form['commands_code'] = array(
        '#markup' => "<pre><code>
Xpress.command.register('undo', {
  exec: function(field, item, editor, params) {
    editor.execCommand('undo');
  },
  state: function(field, item, editor) {
    if (!editor) return Xpress.command.INACCESSIBLE;
    return editor.getCommand('undo').state;
  },
  ctrl: true,
  charCode: 'z'
});
			</code></pre>"
    );
    
    return $form;
}

function _xpress_documentation_reader($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['title'] = array(
        '#markup' => '<h2>' . t('Reader') . '</h2>'
    );
    
    $form['purpose'] = array(
        '#markup' => '<p>' . t('The role of the reader is to capture the relevant
      information from the DOM that will be needed to save changes to the data.
      This is done by registering a reader with JavaScript. The reader builds
      a data object for the field and sends that data to the server to write
      changes.') . '</p>'
    );
    
    $form['register'] = array(
        '#markup' => '<h2>' . t('Registering a reader') . '</h2><p>' . t('Readers
      must be registered using JavaScript and the function Xpress.reader.register().
      The module implementing the writer often should also register the reader.
      Registering a reader more than once will overwrite the previous reader
      function.') . '</p><p>' . t('To register a reader, two parameters are
      needed:') . '</p>'
    );
    
    $form['register_options'] = array(
        '#markup' => '<ul>
        <li><strong>"data_type"</strong>: ' . t('The data type of the fields
          that should use this reader.') . '</li>
        <li><strong>"reader_function"</strong>: ' . t('The function that will
          be called whenever this reader is used. This function will return the
          data in a format that will be recognizable by the writer and that will
          contain all information necissary to write changes. The parameters
          used by this function follow:') . '
          <ul>
            <li><strong>"data_type"</strong>: ' . t('The data type of the field
              using the reader.') . '</li>
            <li><strong>"field_name"</strong>: ' . t('The name of the field
              using the reader.') . '</li>
            <li><strong>"node"</strong>: ' . t('The DOM Node of the FieldItem
              object. If a selector is specified for this field, the node will
              be that DOM Node that matches the selector.') . '</li>
            <li><strong>"field_item"</strong>: ' . t('The FieldItem object which
              can be used to capture all known information about the field.') . '</li>
          </ul>
        </li>
      </ul>'
    );
    
    //data_type, field_name, node, field_item
    
    $form['register_example'] = array(
        '#markup' => '<p>' . t('The following is an example of how to use
      Xpress.reader.register() to register a reader.') . '</p>
      <pre><code>
Xpress.reader.register(\'text_with_summary\', function(data_type, field_name, node, field_item) {
  return node.innerHTML;
});
      </code></pre>'
    );
    
    return $form;
}

function _xpress_documentation_writer($form, &$form_state) {
    $form['menu'] = _xpress_documentation_menu();
    
    $form['title'] = array(
        '#markup' => '<h2>' . t('Writer') . '</h2>'
    );
    
    $form['purpose'] = array(
        '#markup' => '<p>' . t('The writer is responsible for taking changes that
      are made by the user and storing those changes. One writer must exist for
      each data type that Xpress is indended to write to. Without a writer no
      modifications to data for that data type can be saved by Xpress. It is
      also important to note that additional data types may be created by other
      Drupal modules.') . '</p>'
    );
    
    $form['register'] = array(
        '#markup' => '<h2>' . t('Registering a writer') . '</h2><p>' . t('Writers
      must be registered using hook_xpress_writer(). The module implementing
      this hook must return an array of items keyed to the data types that this
      module is providing writers for. Each data type registered can have
      several options set:') . '</p>'
    );
    
    $form['register_options'] = array(
        '#markup' => '<ul>
        <li><strong>"callback"</strong>: ' . t('The name of the
          function to call that will write changes.') . '</li>
        <li><strong>"file"</strong>: ' . t('(optional) Specify
          the file that contains the writer callback function. Defaults to the
          module file.') . '</li>
        <li><strong>"file path"</strong>: ' . t('(optional) 
          Specifying the directory that contains the callback function file.
          Defaults to the current module directory.') . '</li>
        <li><strong>"weight"</strong>: ' . t('(optional) A lower
          weight will take precedence of those with a higher weight. Only one
          writer will ever be used, but specifying a lower weight will make
          one writer the preferred writer. Weight values default to zero.') . '</li>
      </ul>'
    );
    
    $form['register_example'] = array(
        '#markup' => '<p>' . t('The following is an example of how to use
      hook_xpress_writer() to register several writers.') . '</p>
      <pre><code>
function mymodule_xpress_writer() {
  return array(
    \'text\' => array(
      \'weight\' => 0,
      \'callback\' => \'mymodule_writer_text\',
      \'file\' => \'mymodule.writer.inc\',
      \'file path\' => \'/sites/all/modules/mymodule/\',
    ),
    \'text_long\' => array(
      \'weight\' => 0,
      \'callback\' => \'mymodule_writer_text_long\',
      \'file\' => \'mymodule.writer.inc\',
      \'file path\' => \'/sites/all/modules/mymodule/\',
    ),
    \'text_with_summary\' => array(
      \'weight\' => 0,
      \'callback\' => \'mymodule_writer_text_with_summary\',
      \'file\' => \'mymodule.writer.inc\',
      \'file path\' => \'/sites/all/modules/mymodule/\',
    ),
  );
}
      </code></pre>'
    );
    
    $form['callback'] = array(
        '#markup' => '<h2>' . t('Callback Parameters') . '</h2>
      <ul>
        <li><strong>"&$node"</strong>: ' . t('A reference to node object that is
          acquired by using node_load().') . '</li>
        <li><strong>"$field_name"</strong>: ' . t('The name of the field to
          update.') . '</li>
        <li><strong>"$language"</strong>: ' . t('The Drupal language code to
          use to update the value for.') . '</li>
        <li><strong>"$delta"</strong>: ' . t('The field item index to update.') . '</li>
        <li><strong>"$value"</strong>: ' . t('The data needed to make the update
          the field value as provided by the <a href="admin/xpress/docs/reader">
          Xpress reader</a>.') . '</li>
        <li><strong>"$view_mode"</strong>: ' . t('The view mode to save changes for.') . '</li>
      </ul>'
    );
    
    $form['callback_example'] = array(
        '#markup' => '<p>' . t('The following is an example of how to write a
      callback function.') . '</p>
      <pre><code>
function mymodule_writer_text_with_summary(&$node, $field_name, $language, $delta, $value, $view_mode) {
  if ($view_mode == \'full\') {
    $node->{$field_name}[$language][$delta][\'value\'] = $value;
  } else {
    $node->{$field_name}[$language][$delta][\'summary\'] = $value;
  }
}
      </code></pre>'
    );
    
    return $form;
}

function _xpress_documentation_menu() {
    return array(
        '#markup' => '<div id="XpressDocumentationMenu">
      <p>Navigation</p>
      <ul>
        <li><a href="/admin/xpress/docs/home">' . t('Quick Start Guide') . '</a></li>
        <li><a href="/admin/xpress/docs/toolbar">' . t('Toolbar') . '</a>
          <ul>
						<li><a href="/admin/xpress/docs/toolbar_buttons">' . t('Buttons') . '</a></li>
						<li><a href="/admin/xpress/docs/toolbar_groups">' . t('Groups') . '</a></li>
						<li><a href="/admin/xpress/docs/toolbar_bars">' . t('Bars') . '</a></li>
            <li><a href="/admin/xpress/docs/toolbar_quicklinks">' . t('Quicklinks') . '</a></li>
            <li><a href="/admin/xpress/docs/toolbar_tabs">' . t('Tabs') . '</a></li>
          </ul>
        </li>
        <li><a href="/admin/xpress/docs/javascript">' . t('JavaScript Files') . '</a></li>
        <li><a href="/admin/xpress/docs/ckplugins">' . t('CKEditor Plugins') . '</a></li>
        <li><a href="/admin/xpress/docs/commands">' . t('Commands') . '</a></li>
        <li><a href="/admin/xpress/docs/reader">' . t('Reader') . '</a></li>
        <li><a href="/admin/xpress/docs/writer">' . t('Writer') . '</a></li>
      </ul>
    </div>'
    );
}










function _xpress_documentation_code_quicklinks() {
    return "
    'quicklinks' => array(
      'history' => array(
        'weight' => -10,
        'items' => array(
          'undo' => array(
            'title' => 'Undo',
            'description' => 'Undo the previous action',
            'icon' => 'path/to/icons/history-undo.png',
            'command' => 'undo',
            'command enabled' => array('text', 'text_long', 'text_with_summary'),
            'content editable' => TRUE,
            'field specific' => TRUE,
          ),
          'redo' => array(
            'title' => 'Redo',
            'description' => 'Redo the previous action',
            'icon' => 'path/to/icons/history-redo.png',
            'command' => 'redo',
            'command enabled' => array('text', 'text_long', 'text_with_summary'),
            'content editable' => TRUE,
            'field specific' => TRUE,
          ),
        ),
      ),
      'clipboard' => array(
        'weight' => -10,
        'items' => array(
          'cut' => array(
            'title' => 'Cut',
            'description' => 'Cut the selection to the clipboard',
            'icon' => 'path/to/icons/clipboard-cut.png',
            'command' => 'cut',
            'command enabled' => array('text', 'text_long', 'text_with_summary'),
            'content editable' => TRUE,
            'field specific' => TRUE,
          ),
          'copy' => array(
            'title' => 'Copy',
            'description' => 'Copy the selection to the clipboard',
            'icon' => 'path/to/icons/clipboard-copy.png',
            'command' => 'copy',
            'field specific' => FALSE,
          ),
          'paste' => array(
            'title' => 'Paste',
            'description' => 'Paste content from the clipboard',
            'icon' => 'path/to/icons/clipboard-paste.png',
            'command' => 'paste',
            'command enabled' => array('text', 'text_long', 'text_with_summary'),
            'content editable' => TRUE,
            'field specific' => TRUE,
          ),
        ),
      ),
      'content' => array(
        'weight' => -10,
        'items' => array(
          'contentsave' => array(
            'title' => 'Save',
            'description' => 'Save changes',
            'icon' => 'path/to/icons/content-save.png',
            'command' => 'contentsave',
            'field specific' => FALSE,
          ),
        ),
      ),
    ),";
}

function _xpress_documentation_code_tabs() {
    return "
    'tabs' => array(
      'format' => array(
        'title' => 'Format',
        'description' => 'Basic text formatting control',
        'icon' => 'path/to/icons/format.png',
        'weight' => -10,
        'visible' => TRUE,
        'items' => array(
          'style' => array(
            'items' => array(
              'bold' => array(
                'title' => 'Bold',
                'description' => 'Apply/remove bold formatting',
                'icon' => 'path/to/icons/format-bold.png',
                'command' => 'bold',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'italic' => array(
                'title' => 'Italic',
                'description' => 'Apply/remove italic formatting',
                'icon' => 'path/to/icons/format-italic.png',
                'command' => 'italic',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
            ),
          ),
          'list' => array(
            'items' => array(
              'numbered' => array(
                'title' => 'Numbered list',
                'description' => 'Apply/remove numbered list formatting for the selection',
                'icon' => 'path/to/icons/list-numbered.png',
                'command' => 'listnumbered',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'bulleted' => array(
                'title' => 'Bulleted list',
                'description' => 'Apply/remove bulleted list formatting for the selection',
                'icon' => 'path/to/icons/list-bulleted.png',
                'command' => 'listbulleted',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'outdent' => array(
                'title' => 'Outdent',
                'description' => 'Outdent the selected list items',
                'icon' => 'path/to/icons/list-outdent.png',
                'command' => 'listoutdent',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'indent' => array(
                'title' => 'Indent',
                'description' => 'Indent the selected list items',
                'icon' => 'path/to/icons/list-indent.png',
                'command' => 'listindent',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
            ),
          ),
          'link' => array(
            'items' => array(
              'edit' => array(
                'title' => 'Create/edit link',
                'description' => 'Create a link or edit existing link',
                'icon' => 'path/to/icons/link.png',
                'command' => 'link',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'remove' => array(
                'title' => 'Remove link',
                'description' => 'Remove existing link',
                'icon' => 'path/to/icons/link-remove.png',
                'command' => 'linkremove',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
              'follow' => array(
                'title' => 'Follow link',
                'description' => 'Follow the link',
                'icon' => 'path/to/icons/link-follow.png',
                'command' => 'linkfollow',
                'command arguments' => array(),
                'command enabled' => array('text_long', 'text_with_summary'),
                'content editable' => TRUE,
                'field specific' => TRUE,
              ),
            ),
          ),
        ),
      ),
      'content' => array(
        'title' => 'Content',
        'description' => 'Content management',
        'icon' => 'path/to/icons/content.png',
        'weight' => 10,
        'visible' => TRUE,
        'items' => array(
          'node' => array(
            'items' => array(
              'contentsettings' => array(
                'title' => 'Settings',
                'description' => 'Open the settings window',
                'icon' => 'path/to/icons/gear.png',
                'command' => 'contentsettings',
                'command arguments' => array(),
                'field specific' => FALSE,
              ),
              /*'contentsave' => array(
                'title' => 'Save',
                'description' => 'Save changes',
                'icon' => 'path/to/icons/content-save.png',
                'command' => 'contentsave',
                'command arguments' => array(),
                'field specific' => FALSE,
              ),*/
            ),
          ),
          'position' => array(
            'items' => array(
              /*'contentinsert' => array(
                'title' => 'Insert',
                'description' => 'Insert a new content item',
                'icon' => 'path/to/icons/content-insert.png',
                'command' => 'contentinsert',
                'command arguments' => array(),
                'field specific' => FALSE,
              ),
              'contentremove' => array(
                'title' => 'Remove',
                'description' => 'Remove a content item',
                'icon' => 'path/to/icons/content-remove.png',
                'command' => 'contentremove',
                'command arguments' => array(),
                'field specific' => FALSE,
              ),*/
              'contentmoveup' => array(
                'title' => 'Move up',
                'description' => 'Move a content item upward',
                'icon' => 'path/to/icons/content-move-up.png',
                'command' => 'contentmoveup',
                'command arguments' => array(),
                'field specific' => FALSE,
                'content editable' => FALSE,
              ),
              'contentmovedown' => array(
                'title' => 'Move down',
                'description' => 'Move a content item downward',
                'icon' => 'path/to/icons/content-move-down.png',
                'command' => 'contentmovedown',
                'command arguments' => array(),
                'field specific' => FALSE,
                'content editable' => FALSE,
              ),
            ),
          ),
        ),
      ),
    ),";
}