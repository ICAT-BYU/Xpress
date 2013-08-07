(function ($) {
    //dom ready function
    $(function () {

        //program check all / none links to check or uncheck links for each group
        $('.xpress-ui-command-grouptitle-sweep a').click(function (e) {
            var t = $(this),
                boxes = t.parents('.xpress-ui-command-group').find("input[type='checkbox']:enabled");

            //prevent default browser behavior
            e.preventDefault();

            switch (t.attr('href')) {
            case '#all':
                boxes.attr('checked', 'checked');
                break;
            case '#none':
                boxes.removeAttr('checked');
                break;
            }
        });

        //update visibility for commands based on content editability of the field
        $('.xpress-ui-command-field-content-editable')
            .each(update_field_content_editable_command_visibility)
            .change(update_field_content_editable_command_visibility);
    });

    function update_field_content_editable_command_visibility() {
        var count, command_fieldset;

        count = 0;
        command_fieldset = $(this).parents('fieldset').first().next('fieldset');

        //modify visibility of each command group within the fieldset
        command_fieldset.find('.xpress-ui-command-group').each(function () {
            var group = $(this),
                boxes = group.find("input[type='checkbox']:enabled");
            if (boxes.length > 0) count++;
            group.css('display', boxes.length == 0 ? 'none' : 'block');
        });

        //modify visibility of the command fieldset based on the numer of available command sets
        command_fieldset.css('display', count == 0 ? 'none' : 'block');
    }

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

})(jQuery)