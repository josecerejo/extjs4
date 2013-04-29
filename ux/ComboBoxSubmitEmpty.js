/*
#LICENSE BEGIN
#LICENSE END
*/



/**
 * ComboBox values not matching a store record are set to null
 * and a submitvalue of null is not submitted at all -
 * that means the variable is skiped.
 */


Ext.override( Ext.form.field.ComboBox, {

    getSubmitValue: function() {
        var value = this.getValue();
        if (value === null) {
          value = '';
        }
        return value;
    },

});




/*

// original

    getSubmitValue: function() {
        return this.getValue();
    },


*/
