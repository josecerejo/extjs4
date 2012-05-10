/*
#LICENSE BEGIN
#LICENSE END
*/


/*
see: <http://stackoverflow.com/questions/6609275/extjs-4-how-to-extend-extjs-4-components>
*/


/**
 * Multiselect combo box.
 */
Ext.define('Ext.ux.ComboBoxMultiSelect', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.ux_multicombo',


  config:{
    multiSelect: true,  // Providing a value for existing config property.
  },

  constructor:function(cnfg){
    this.callParent(arguments);  // Calling the parent class constructor
    this.initConfig(cnfg);  // Initializing the component
  },


  getValue: function() {
    var value = this.callParent();
    if (typeof(value) == 'object' && (value instanceof Array)) {
      value = value.join(',');
    }
    return value;
  },

  setValue: function(value) {
    if (typeof value == 'string') {
      value = value.split(',');
    }
    this.callParent([value]);
  }

});
