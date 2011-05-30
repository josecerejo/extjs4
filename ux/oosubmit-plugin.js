// Copied from: http://www.diloc.de/blog/2008/03/05/how-to-submit-ext-forms-the-right-way/

/*
* To make it even easier, i wrote a small plugin which can be plugged into a BasicForm or FormPanel.
* It overrides the standard submit() action and uses the OOSubmit action by default.
*
* To use the plugin, simply constuct a BasicForm or FormPanel and add this to the config:
* plugins: [new Ext.ux.OOSubmit()]
*/

/**
 * This plugin can be either used on BasicForm or FormPanel.
 * In both cases it changes the behaviour of submit() to use
 * the 'oosubmit' action instead of the 'submit' action.
 */
Ext.ux.OOSubmit=function()
{

    this.init=function(_object)
    {
        var form=null;
        if (typeof _object.form=="object")
        { //we are a formpanel:
            form=_object.form;
        }
        else form=_object;

        //Save the old submit method:
        form.oldSubmit=form.submit;

        //create a new submit method which calls the oosubmit action per default:
        form.submit=function(options)
        {
              this.doAction('oosubmit', options);
              return this;
        };
    };

};
