/***
*历史告警的工具栏
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmhistory.historyAlarmDockedItems', {
    extend: 'Ext.Toolbar',
    xtype: 'historyAlarmDockedItems',
    reference: 'historyAlarmDockedItems',
    scrollable:true,
    items : [{
        text : _('Delete'),
        iconCls : 'x-fa fa-times',
        menu : [{
            itemId : 'removeSelectedBtn',
            reference: 'removeSelectedBtn',
            text : _('Delete Selected Items'),
            tooltip : _('Delete Selected Items'),
            disabled : true,
            handler : 'onRemoveSelected'
        },{
            itemId : 'removeQueryBtn',
            text : _('Delete Query results'),
            tooltip : _('Delete Query results'),
            handler : 'onRemoveChecked'
        }, {
            itemId : 'removeAllBtn',
            text : _('Delete All'),
            tooltip : _('Delete All'),
            handler : 'onRemoveAllHistory'
        }]
    }, '-', {
        itemId : 'addExperienceBtn',
        reference: 'addExperienceBtn',
        text : _('Add Troubleshooting'),
        tooltip : _('Add Troubleshooting'),
        iconCls : 'x-fa fa-wrench',
        disabled : true,
        handler : 'onAddExperience'
    },{
        xtype: 'splitbutton',
        reference: 'locationBtn',
        text: _('Localization'),
        iconCls: 'x-fa fa-map-marker',
        disabled : true,
        menu:[{
            text:_('Topological Localization'),
            reference: 'topoLocationBtn',
            handler:'onTopologicalLocalization',
            disabled: true
        },{
            text:_('device Localization'),
            reference: 'devLocationBtn',
            disabled: true
        }]
    },{
        text: _('Properties'),
        xtype: 'button',
        reference: 'propertyBtn',
        iconCls:'x-fa fa-file-text-o',  
        handler: 'onAdd',
        disabled: true,
        handler: 'onProperyTool'
    },{
        text: _('Export'),
        iconCls:'x-fa fa-download',
        menu:[{
            text:_('All'),
            handler:'onExportAll'
        },{
            text:_('current page'),
            reference: 'currentpageExportBtn',
            handler:'onExportCurrentPage'
        },{
            text:_('selected'),
            reference: 'selectExportBtn',
            handler:'onExportSelected',
            disabled: true
        }]
    },'->', {
        itemId : 'showConditions',
        xtype : 'checkboxfield',
        boxLabel : _('Show Conditions'),
        checked : false,
        padding : '0 6 0 0',
        handler: 'isShow'
    }, {
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    }, {
        itemId : 'expandAll',
        text : '',
        tooltip : _('Full Expand'),
        handler : 'onExpandAll',
        iconCls : 'x-fa fa-search-plus',
        disabled : false
    }, {
        itemId : 'closeAll',
        text : '',
        tooltip : _('Collapse All'),
        handler : 'onCloseAll',
        iconCls : 'x-fa fa-search-minus',
        disabled : false
    }, {
        itemId : 'tbSeparator1',
        xtype: 'tbseparator'
    }, {
        itemId : 'reset',
        text : _('Reset'),
        tooltip : _('Reset'),
        iconCls : 'x-fa fa-reply',
        handler : 'onReset'
    }, {
        itemId : 'search',
        text : _('Search'),
        tooltip : _('Search'),
        iconCls : 'x-fa fa-search',
        handler : 'onQuery'
    },{ 
        xtype:'BookMarkButton',       //必配
        iconCls:'x-fa fa-bookmark-o', 
        containerType: 'historyAlarmView',     //必配，配置模块主页面的xtype
        formReference: 'alarmCheckForm',       //必配，配置查询条件form的reference
        module:'historyAlarmView',          //必配，配置自己模块的名字，名字会被记录到数据库，根据模块名字来查询书签
        defaultName: _('HistoryAlarm--Query')    //必配，配置自己模块书签名字的默认前缀
    }]
});