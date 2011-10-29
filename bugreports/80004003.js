

var formDef1 = {
  layout: 'anchor',
  items: [
    { fieldLabel: 'Label1', name: 'name', xtype: 'textfield', allowBlank: false },
    { fieldLabel: 'Label2', name: 'other', xtype: 'textfield' },
  ],
};


var formDef2 = Ext.create('Ext.form.Panel', {
  //xtype: 'form',
  layout: 'anchor',
  items: [
    { fieldLabel: 'Label1', name: 'name', xtype: 'textfield', allowBlank: false },
    { fieldLabel: 'Label2', name: 'other', xtype: 'textfield' },
  ],
});


Ext.define('App.view.Form', {
  extend: 'Ext.form.Panel',
  alias: 'widget.myform',

  layout: 'anchor',
  items: [
    { fieldLabel: 'Label1', name: 'name', xtype: 'textfield', allowBlank: false },
    { fieldLabel: 'Label2', name: 'other', xtype: 'textfield' },
  ],
});


Ext.define('App.view.Window', {
  extend: 'Ext.window.Window',

  title: 'TITLE',
  width: 500,
  height: 500,
  modal: true,
  layout: 'fit',
  //   following line of code works only for FIRST instance created with Ext.create('App.view.Window')
  //   the second instance is empty (form is here but looses its items!)
  //   extjs 4.0.7  (with 4.0.2a i got an 80004003 error)
  // items: [ Ext.create('App.view.Form') ],
  // items: [ { xtype: 'myform' } ],  // this works as expected
  // items: [ Ext.create('Ext.form.Panel', formDef1) ],  // this works only once like: Ext.create('App.view.Form')
  items: [ formDef2 ],  // this works only once like: Ext.create('App.view.Form')
  buttonAlign: 'center',
  buttons: [
    { text: 'Ok',
      handler: function(button, event) {
        alert('OK');
      }
    },
  ],
});



Ext.define('App.view.Viewport', {
  extend: 'Ext.container.Viewport',

  layout: 'border',
  autoScroll: true,
  items: [
    { region: 'center',
      xtype: 'panel',
      height: 30,
      items: [
        { xtype: 'button',
          text: 'Show Window',
          handler: function(button, event) {
            var win = Ext.create('App.view.Window').show();
            var x = x;
          },
        },
      ],
    },
  ]
});


Ext.application({
  name: 'App',
  appFolder: 'js/app',

  launch: function() {
    Ext.create('App.view.Viewport');
  },
});
