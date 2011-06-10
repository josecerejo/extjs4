/*
 * Ext JS FilterRow plugin v0.5
 * http://github.com/nene/filter-row
 *
 * Copyright 2010 Rene Saarsoo
 * Licensed under GNU General Public License v3.
 * http://www.gnu.org/licenses/
 */

/* extended/modified for extjs4 from this thread:
 * http://www.sencha.com/forum/showthread.php?128154-FilterRow-for-Ext-JS-4-Grids
 *
 * Usage:

  Ext.create('Ext.grid.Panel', {
	  plugins: [ Ext.create('Ext.ux.grid.FilterRow') ],
	  store: Ext.create('Ext.data.Store', {
		  pageSize:25,
		  remoteSort:true, fields:[ 'id', 'siteId', 'firstName', 'lastName', 'company', 'birthday' ],
		  proxy:{
	      type:'direct', directFn:Progik.Remote.Contacts.read,
			  reader:{ type:'json', root:'rows', successProperty:'success', idProperty:'id', totalProperty:'total' }
	    }
    }),
  	columns:[
  		{ header:'#', dataIndex: 'id', nofilter: {} },
	  	{ header:'siteId',
			  dataIndex:'siteId',
			  filter: {
				  xtype:'combo',
				  queryMode: 'local',
				  displayField: 'name',
				  valueField: 'id',
				  store:Ext.create('Ext.data.Store', {
					  fields:['id', 'name'],
					  data:[
					    { id:'0', name:'test' },
					    { id:'1', name:'test2' }
					  ]
				  })
			  }
		  },
		  { header:'firstName', dataIndex:'firstName', flex:1 },
		  { header:'lastName', dataIndex:'lastName', flex:1 },
		  { header:'company', dataIndex:'company'},
		  { header:'birthday', dataIndex:'birthday',
			  filter:{
				  xtype:'datefield',
				  format:'Y-m-d'
			  }
		  }
	  ]

  });



Example for the php part:

$search = json_decode($_POST['search']);
$size = sizeof($search);
$i = 0;
foreach($search as $key => $value) {
  $where .= mysql_real_escape_string($key).' LIKE '.mysql_real_escape_string($value).'%';
  if($i < $size) {
    $where .= ' AND ';
  }

}
// Put your code here
$rows = array();
$rs = mysql_query("SELECT * FROM table WHERE".$where);
if($rs !== false && mysql_num_rows($rs) > 0) {
  while($assoc = mysql_fetch_assoc($rs)) {
     $rows[] = $assoc;
  }
}
// Return you json data here
echo "{success:true, totalCount:".sizeof($rows).", rows:".json_encode($rows)."}";


 */



// VERSION 2:

//Ext.define('Progik.ux.grid.FilterRow', {  // original version2
Ext.define('Ext.ux.grid.FilterRow', {   // oger: renamed into Ext namespace
	extend:'Ext.util.Observable',

	init: function(grid) {
		this.grid = grid;
		this.applyTemplate();

		// when Ext grid state restored (untested)
		grid.on("staterestore", this.resetFilterRow, this);

		// when column width programmatically changed
		grid.headerCt.on("columnresize", this.resizeFilterField, this);

		grid.headerCt.on("columnmove", this.resetFilterRow, this);
		grid.headerCt.on("columnshow", this.resetFilterRow, this);
		grid.headerCt.on("columnhide", this.resetFilterRow, this);

		grid.horizontalScroller.on('bodyscroll', this.scrollFilterField, this);
	},




	applyTemplate: function() {

		var searchItems = [];
		this.eachColumn( function(col) {
			var filterDivId = this.getFilterDivId(col.id);

			if (!col.filterField) {
				// if(col.nofilter) {  // original version
				if(col.nofilter || col.cls == 'x-column-header-checkbox ') {  // extended by zonereseau in the same thread
					col.filter = { };
				} else if(!col.filter){
					col.filter = { };
					col.filter.xtype = 'textfield';
				}
				//console.log(col);
				col.filter = Ext.apply({
					id:filterDivId,
					hidden:col.hidden,
					xtype:'component',
					cls: "small-editor filter-row-icon",
					width:col.width-2,
					enableKeyEvents:true,
					style:{
						margin:'1px 1px 1px 1px'
					}
				}, col.filter);

				col.filterField = Ext.ComponentManager.create(col.filter);

			} else {
				if(col.hidden != col.filterField.hidden) {
					col.filterField.setVisible(!col.hidden);
				}
			}

			if(col.filterField.xtype == 'combo' || col.filterField.xtype == 'datefield') {
				col.filterField.on("change", this.onChange, this);
			} else {
				col.filterField.on("keypress", this.onKeyPress, this);
			}


			searchItems.push(col.filterField);
		});

		if(searchItems.length > 0) {
			this.grid.addDocked(this.dockedFilter = Ext.create('Ext.container.Container', {
				id:this.grid.id+'docked-filter',
				weight: 100,
				dock: 'top',
				border: false,
				baseCls: Ext.baseCSSPrefix + 'grid-header-ct',
				items:searchItems,
				layout:{
	                type: 'hbox'
	            }
			}));
		}
	},

	// Removes filter fields from grid header and recreates
	// template. The latter is needed in case columns have been
	// reordered.
	// orignal version:
	//resetFilterRow: function() {
	//	this.grid.removeDocked(this.grid.id+'docked-filter', true);
	//	delete this.dockedFilter;
	//	this.applyTemplate();
	//},
	// version modified by szolarp in the same thread:
  resetFilterRow: function () {
        this.grid.removeDocked(this.grid.id + 'docked-filter', true);
        delete this.dockedFilter;

        //This is because of the reconfigure
        if (document.getElementById(this.grid.id + 'docked-filter')) {
            var dockedFilter = document.getElementById(this.grid.id + 'docked-filter');
            dockedFilter.parentElement.removeChild(dockedFilter)
        }
        this.applyTemplate();
    },

	onChange: function() {

		if(!this.onChangeTask) {
			this.onChangeTask = new Ext.util.DelayedTask(function(){
	    		this.storeSearch();
			}, this);
		}

		this.onChangeTask.delay(1000);

	},

	onKeyPress: function(field, e) {
		if(e.getKey() == e.ENTER) {
			this.storeSearch();
		}
	},

	getSearchValues: function() {
		var values = {};
		this.eachColumn( function(col) {
			if(col.filterField.xtype != 'component') {
				values[col.dataIndex] = col.filterField.getValue();
			}
		});
		return values;
	},

	storeSearch: function() {
		if(!this.grid.store.proxy.extraParams) {
			this.grid.store.proxy.extraParams = {};
		}
		this.grid.store.proxy.extraParams.search = this.getSearchValues();
		this.grid.store.load();
	},

	// Resizes filter field according to the width of column
	// original version:
	//resizeFilterField: function(headerCt, column, newColumnWidth) {
	//	var editor = column.filterField;
	//	editor.setWidth(newColumnWidth - 2);
	//},
	// version modified by szolarp in the same thread:
 resizeFilterField: function (headerCt, column, newColumnWidth) {
        var editor;
        if (!column.filterField) {
            //This is because of the reconfigure
            this.resetFilterRow();
            editor = this.grid.headerCt.items.findBy(function (item) { return item.dataIndex == column.dataIndex; }).filterField;
        } else {
            editor = column.filterField;
        }
        editor.setWidth(newColumnWidth - 2);
    },

	scrollFilterField:function(e, target) {
		var width = this.grid.headerCt.el.dom.firstChild.style.width;
		this.dockedFilter.el.dom.firstChild.style.width = width;
		this.dockedFilter.el.dom.scrollLeft = target.scrollLeft;
	},

	// Returns HTML ID of element containing filter div
	getFilterDivId: function(columnId) {
		return this.grid.id + '-filter-' + columnId;
	},

	// Iterates over each column that has filter
	eachFilterColumn: function(func) {
		this.eachColumn( function(col, i) {
			if (col.filterField) {
				func.call(this, col, i);
			}
		});
	},

	// Iterates over each column in column config array
	eachColumn: function(func) {
		Ext.each(this.grid.columns, func, this);
	}

});








/*

// VERSION 1:

Ext.define('Ext.ux.grid.FilterRow', {
	extend:'Ext.util.Observable',

	init: function(grid) {
		this.grid = grid;
		this.applyTemplate();

		// when Ext grid state restored (untested)
		grid.on("staterestore", this.resetFilterRow, this);

		// when column width programmatically changed
		grid.headerCt.on("columnresize", this.resizeFilterField, this);

		grid.headerCt.on("columnmove", this.resetFilterRow, this);
		grid.headerCt.on("columnshow", this.resetFilterRow, this);
		grid.headerCt.on("columnhide", this.resetFilterRow, this);

		grid.horizontalScroller.on('bodyscroll', this.scrollFilterField, this);
	},


	applyTemplate: function() {

		var searchItems = [];
		this.eachColumn( function(col) {
			var filterDivId = this.getFilterDivId(col.id);

			if (!col.filterField) {
				if(col.nofilter) {
					col.filter = { };
				} else if(!col.filter){
					col.filter = { };
					col.filter.xtype = 'textfield';
				}
				//console.log(col);
				col.filter = Ext.apply({
					id:filterDivId,
					hidden:col.hidden,
					xtype:'component',
					cls: "small-editor filter-row-icon",
					width:col.width-2,
					enableKeyEvents:true,
					style:{
						margin:'1px 1px 1px 1px'
					}
				}, col.filter);

				col.filterField = Ext.ComponentManager.create(col.filter);

			} else {
				if(col.hidden != col.filterField.hidden) {
					col.filterField.setVisible(!col.hidden);
				}
			}

			if(col.filterField.xtype == 'combo' || col.filterField.xtype == 'datefield') {
				col.filterField.on("change", this.onChange, this);
			} else {
				col.filterField.on("keypress", this.onKeyPress, this);
			}


			searchItems.push(col.filterField);
		});

		if(searchItems.length > 0) {
			this.grid.addDocked(this.dockedFilter = Ext.create('Ext.container.Container', {
				id:this.grid.id+'docked-filter',
				weight: 100,
				dock: 'top',
				border: false,
				baseCls: Ext.baseCSSPrefix + 'grid-header-ct',
				items:searchItems,
				layout:{
	                type: 'hbox'
	            }
			}));
		}
	},

	// Removes filter fields from grid header and recreates
	// template. The latter is needed in case columns have been
	// reordered.
	resetFilterRow: function() {
		this.grid.removeDocked(this.grid.id+'docked-filter', true);
		delete this.dockedFilter;
		this.applyTemplate();
	},

	onChange: function() {
		var values = {};
		this.eachColumn( function(col) {
			if(col.filterField.xtype != 'component') {
				values[col.dataIndex] = col.filterField.getValue();
			}
		});

		this.grid.store.load({
			params:{
				search:values
			}
		});
	},

	onKeyPress: function(field, e) {
		if(e.getKey() == e.ENTER) {

			var values = {};
			this.eachColumn( function(col) {
				if(col.filterField.xtype != 'component') {
					values[col.dataIndex] = col.filterField.getValue();
				}
			});

			this.grid.store.load({
				params:{
					search:values
				}
			});
		}
	},


	// When grid has forceFit: true, then all columns will be resized
	// when grid resized or column added/removed.
	resizeAllFilterFields: function() {
		//var cm = this.grid.getColumnModel();
		this.eachFilterColumn( function(col, i) {
			if(col.el) { var width = col.getWidth(); }
			else { var width = col.width; }
			this.resizeFilterField(this.grid.headerCt, col, width);
		});
	},

	// Resizes filter field according to the width of column
	resizeFilterField: function(headerCt, column, newColumnWidth) {
		var editor = column.filterField;
		editor.setWidth(newColumnWidth - 2);
	},

	scrollFilterField:function(e, target) {
		var width = this.grid.headerCt.el.dom.firstChild.style.width;
		this.dockedFilter.el.dom.firstChild.style.width = width;
		this.dockedFilter.el.dom.scrollLeft = target.scrollLeft;
	},

	// Returns HTML ID of element containing filter div
	getFilterDivId: function(columnId) {
		return this.grid.id + '-filter-' + columnId;
	},

	// Iterates over each column that has filter
	eachFilterColumn: function(func) {
		this.eachColumn( function(col, i) {
			if (col.filterField) {
				func.call(this, col, i);
			}
		});
	},

	// Iterates over each column in column config array
	eachColumn: function(func) {
		Ext.each(this.grid.columns, func, this);
	}

});

*/
