/*
* Let empty response (0 bytes long) to a submit action fail.
* Default is to handle this as successful response!
*/
// from: http://www.sencha.com/forum/showthread.php?124283-form.submit-successful-on-empty-response
Ext.override(Ext.form.Action, {
  processResponse : function(response){
    this.response = response;
    if(!response.responseText && !response.responseXML){
      /*
      * comment out this to get the desired behavior!
      return true;
      */
      response.responseText = '{ "success": false, "msg": "Server response empty." }';
    }
    this.result = this.handleResponse(response);
    return this.result;
  }
});
