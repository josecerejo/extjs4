
Ext.define('App.view.Form', {
  extend: 'Ext.form.Panel',

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
  items: [ Ext.create('App.view.Form') ],
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
            Ext.create('App.view.Window').show();
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
