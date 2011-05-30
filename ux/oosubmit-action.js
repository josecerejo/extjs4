// Copied from: http://www.diloc.de/blog/2008/03/05/how-to-submit-ext-forms-the-right-way/

/*
* To use this, simply include the code somewhere in your page, and when you want to submit
* the form dont use form.submit() but form.doAction(’oosubmit’); This way you may always
* submit the form in the traditional way.
*/

Ext.namespace("Ext.ux");

/**
 * This submit action is basically the same as the normal submit action,
 * only that it uses the fields getSubmitValue() to compose the values to submit,
 * instead of looping over the input-tags in the form-tag of the form.
 *
 * To use it, just use the OOSubmit-plugin on either a FormPanel or a BasicForm,
 * or explicitly call form.doAction('oosubmit');
 *
 * @param {Object} form
 * @param {Object} options
 *
 * Comment oger000: This does definitly not work for file uploads.
 */
Ext.ux.OOSubmitAction = function(form, options){
    Ext.ux.OOSubmitAction.superclass.constructor.call(this, form, options);
};

Ext.extend(Ext.ux.OOSubmitAction, Ext.form.Action.Submit, {
    /**
    * @cfg {boolean} clientValidation Determines whether a Form's fields are validated
    * in a final call to {@link Ext.form.BasicForm#isValid isValid} prior to submission.
    * Pass <tt>false</tt> in the Form's submit options to prevent this. If not defined, pre-submission field validation
    * is performed.
    */
    type : 'oosubmit',

    // private
    /**
     * This is nearly a copy of the original submit action run method
     */
    run: function(){
        var o = this.options;
        var method = this.getMethod();
        var isPost = method == 'POST';

        var params = this.options.params || {};
        if (isPost) Ext.applyIf(params, this.form.baseParams);

        // working function
        var processField = function (field) {

          if (!field.disabled) {
            var tmpValue = null;
            var fieldName = field.getName();

            //check if the form item provides a specialized getSubmitValue() and use that if available
            if (typeof field.getSubmitValue == "function")
                tmpValue = field.getSubmitValue();
            else
                tmpValue = field.getValue();

            // oger000: EXPERIMENTAL get value of radio group
            // Needs item name at radio group level! to sadisfy transmission of unchecked state
            if (typeof field.getXType == 'function' &&  field.getXType() == 'radiogroup') {
              var radioItem = tmpValue;
              if (!radioItem) {
                tmpValue = '';
              }
              // original radio item
              else if (typeof radioItem.getXType == 'function' && radioItem.getXType() == 'radio') {
                tmpValue = radioItem.getGroupValue();
                fieldName = radioItem.getName();
              }
              // ux-radiogroup item (dont work as expected, so not used - oger000)
              else if (typeof radioItem.getXType == 'function' && radioItem.getXType() == 'ux-radiogroup') {
                tmpValue = radioItem.getValue();
                fieldName = radioItem.getName();
              }
            }  // eo radiogroup

            // oger000: EXPERIMENTAL get values of checkbox group
            // Needs item name at checkbox level! Name of checkbox group is ignored.
            if (typeof field.getXType == 'function' &&  field.getXType() == 'checkboxgroup') {
              field.items.each(processField);
              fieldName = null;
            }

            // oger000: get values of composite field
            if (typeof field.getXType == 'function' &&  field.getXType() == 'compositefield') {
              field.items.each(processField);
              fieldName = null;
            }


            // oger000: make boolean values more php friendly.
            // Change 'false' which evals to true in php into '' (empty string).
            if (typeof tmpValue == 'boolean' && !tmpValue) {
              tmpValue = ''
            }

            // assign value
            if (fieldName) {
              params[fieldName] = tmpValue;
            }

          }  // eo not disabled
        };


        // now traverse the form fields
        this.form.items.each(processField);


        //convert params to get style if we are not post
        if (!isPost) params=Ext.urlEncode(params);

        if(o.clientValidation === false || this.form.isValid()){
            Ext.Ajax.request(Ext.apply(this.createCallback(o), {
                url:this.getUrl(!isPost),
                method: method,
                params:params, //add our values
                isUpload: this.form.fileUpload
            }));

        }else if (o.clientValidation !== false){ // client validation failed
            this.failureType = Ext.form.Action.CLIENT_INVALID;
            this.form.afterAction(this, false);
        }
    },

});
//add our action to the registry of known actions
Ext.form.Action.ACTION_TYPES['oosubmit'] = Ext.ux.OOSubmitAction;



/*
* The function below this lines is NOT USED FOR NOW because XDateField does a good job.
* But copied it to preserve it - maybe useful another day.
* ###############################################################################################
*/

/*
* To fix the datetime problem mentioned above I spent Ext.form.DateField
* a getSubmitValue() function:
*/

/**
 * Returns the submit value of the datefield, always in the same format,
 * regardless of display format.
 * The format returned is Y-m-d, because this is common format used in rdbms. (mysql for example)
 *
 */

/*
Ext.form.DateField.prototype.getSubmitValue=function()
{
    var v = this.getValue();
    if(v !=='')
    {
       var date= new Date(v);
       return date.format("Y-m-d");
    }
    return v;
};
*/
