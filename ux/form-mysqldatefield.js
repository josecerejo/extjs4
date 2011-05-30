/*
* Handle a date value of '0000-00-00' as empty date in extjs.
* Copied from: http://www.sencha.com/forum/showthread.php?39257-MysqlDateField-prevents-DateField-to-transform-0000-00-00-to-1970-01-01
*/
Ext.ux.form.MysqlDateField = Ext.extend(Ext.form.DateField,  {
    parseDate : function(value){
        if (value=='0000-00-00') {
            value = null;
        }
        return Ext.ux.form.MysqlDateField.superclass.parseDate.call(this, value);
    }
});
Ext.reg('mysqldatefield', Ext.ux.form.MysqlDateField);
