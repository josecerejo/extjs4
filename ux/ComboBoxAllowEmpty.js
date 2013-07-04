/*
#LICENSE BEGIN
#LICENSE END
*/


/*
see: <http://stackoverflow.com/questions/9371705/how-to-re-empty-combobox-when-forceselection-is-set-to-true-extjs-4>
*/


/**
 * ComboBox allows empty even if forceSelection is true.
 * See other alternatives below
 */


Ext.override( Ext.form.field.ComboBox, {

    // private !!! modified
    assertValue: function() {
        var me = this,
            value = me.getRawValue(),
            rec, currentValue;

        if (me.forceSelection) {
            if (me.multiSelect) {
                // For multiselect, check that the current displayed value matches the current
                // selection, if it does not then revert to the most recent selection.
                if (value !== me.getDisplayValue()) {
                    me.setValue(me.lastSelection);
                }
            } else {
                // For single-select, match the displayed value to a record and select it,
                // if it does not match a record then revert to the most recent selection.
                rec = me.findRecordByDisplay(value);
                if (rec) {
                    currentValue = me.value;
                    // Prevent an issue where we have duplicate display values with
                    // different underlying values.
                    if (!me.findRecordByValue(currentValue)) {
                        me.select(rec, true);
                    }
                } else {
                    // if value is '' or null and blank is allowed
                    // we do not use lastSelection but set to empty string
                    if (me.allowBlank &&
                        (value === '' || value === null)) {
                      me.setValue('');
                    }
                    else {
                        me.setValue(me.lastSelection);
                    }
                }
            }
        }
        me.collapse();
    },

});




/*
 *
// alternative 1
// see: <http://stackoverflow.com/questions/9371705/how-to-re-empty-combobox-when-forceselection-is-set-to-true-extjs-4>

Ext.override( Ext.form.field.ComboBox, {

    onChange: function(newVal, oldVal)
    {
        var me = this;

        if ( me.allowBlank && me.forceSelection && newVal === null )
            me.reset();

        me.callParent( arguments );
    },

});




// alternative 2
// see: <http://stackoverflow.com/questions/9371705/how-to-re-empty-combobox-when-forceselection-is-set-to-true-extjs-4>

Ext.override( Ext.form.field.ComboBox, {

    onKeyUp: function( aEvent ) {
        var me            = this,
            iKey          = aEvent.getKey();
            isValidKey    = !aEvent.isSpecialKey() || iKey == aEvent.BACKSPACE || iKey == aEvent.DELETE,
            iValueChanged = me.previousValue != this.getRawValue();

        me.previousValue = this.getRawValue();

        // Prevents the picker showing up when there's no selection
        if ( iValueChanged &&
             isValidKey &&
             me.allowBlank &&
             me.forceSelection &&
             me.getRawValue() === '' )
        {
            // Resets the field
            me.reset();

            // Set the value to null and fire select
            me.setValue( null );
            me.fireEvent('select', me, null );

            // Collapse the picker
            me.collapse();
            return;
        }
        me.callParent( arguments );
    },

});



// alternative 3 - overwrite assertValue
// see: <http://stackoverflow.com/questions/7345922/extjs-4-combobox-autocomplete>

    // private  !!! original 4.1.0
    assertValue: function() {
        var me = this,
            value = me.getRawValue(),
            rec;

        if (me.forceSelection) {
            if (me.multiSelect) {
                // For multiselect, check that the current displayed value matches the current
                // selection, if it does not then revert to the most recent selection.
                if (value !== me.getDisplayValue()) {
                    me.setValue(me.lastSelection);
                }
            } else {
                // For single-select, match the displayed value to a record and select it,
                // if it does not match a record then revert to the most recent selection.
                rec = me.findRecordByDisplay(value);
                if (rec) {
                    me.select(rec);
                } else {
                    me.setValue(me.lastSelection);
                }
            }
        }
        me.collapse();
    },

Ext.override(Ext.form.field.ComboBox,{
    assertValue: function() {
        var me = this,
            value = me.getRawValue(),
            rec;
        if (me.multiSelect) {
            // For multiselect, check that the current displayed value matches the current
            // selection, if it does not then revert to the most recent selection.
            if (value !== me.getDisplayValue()) {
                me.setValue(me.lastSelection);
            }
        } else {
            // For single-select, match the displayed value to a record and select it,
            // if it does not match a record then revert to the most recent selection.
            rec = me.findRecordByDisplay(value);
            if (rec) {
                me.select(rec);
            } else {
                if(!value){
                    me.setValue('');
                }else{
                    me.setValue(me.lastSelection);
                }
            }
        }
        me.collapse();
    }
});

*/
