/***
*当前告警的工具栏
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmDockedItems', {
    extend: 'Ext.Toolbar',
    xtype: 'currentAlarmDockedItems',
    reference: 'currentAlarmDockedItems',
    scrollable:true,
    //height:100,
    items: [{
        //清除告警的menu
        xtype: 'splitbutton',
        text : _('Clear'),
        iconCls : 'x-fa fa-minus-circle',
        menu:[{
            //'清除选择项',
            text : _('Selected Items'),
            tooltip : _('Selected Items'),
            reference:'clearSelectedBtn',
            handler: 'onClearSelected',
            disabled: true
        },{
            //'所有同类型',
            text : _('Same Type'),
            tooltip : _('Same Type'),
            reference:'clearSameTypeBtn',
            handler: 'onClearSameType',
            bind:{
                disabled:'{oneCheckedDisabled}'
            }
        },{
            //'所有同位置',
            reference:'clearSameLocationBtn',
            text : _('Same Position'),
            tooltip : _('Same Position'),
            handler: 'onClearSameLocation',
            bind:{
                disabled:'{oneCheckedDisabled}'
            }               
        },{
            //'所有已确定',
            reference:'clearConfirmedBtn',
            text : _('Confirmed'),
            tooltip : _('Confirmed'),
            handler: 'onClearConfirmed'     
        },{
            //'全部清除',
            reference:'clearAllBtn',
            handler: 'onClearAllAlarm',
            text : _('Clear All'),
            tooltip : _('Clear All'),      
        },{
            //'按查询条件清除',
            reference:'clearCheckedBtn',
            handler: 'onClearChecked',
            text : _('Clear Queried Items'),
            tooltip : _('Clear Queried Items'),             
        }]
    },{
        text : _('Confirm Alarm'),
        tooltip : _('Confirm Alarm'),
        iconCls : 'x-fa fa-check-circle',
        disabled : true,
        reference:'confirmAlarmBtn',
        handler: 'onConfirmAlarm'
    },/*{
        text : _('Cancel Confirm'),
        tooltip : _('Cancel Confirm'),
        iconCls : 'x-fa fa-circle',//'unack_alarm_btn',
        disabled : true,
    },*/{
        xtype: 'splitbutton',
        text: _('Localization'),
        reference:'locationBtn',
        iconCls: 'x-fa fa-map-marker',
        bind:{
                disabled:'{oneCheckedDisabled}'
            },
        menu:[{
            text:_('Topological Localization'),
            reference:'topoLocationBtn',
            bind:{
                disabled:'{oneCheckedDisabled}'
            },
            handler:'onTopologicalLocalization'
        },{
            text:_('device Localization'),
            reference:'devLocationBtn',
            bind:{
                disabled:'{oneCheckedDisabled}'
            }
        }]
    },{
        text: _('Properties'),
        xtype: 'button',
        reference:'propertyBtn',
        iconCls:'x-fa fa-file-text-o',
        handler: 'onProperyTool',
        bind:{
            disabled:'{oneCheckedDisabled}'
        }
    },{
        xtype: 'splitbutton',
        text: _('Filter settings'),
        reference:'filterBtn',
        iconCls: 'x-fa fa-external-link',
        bind:{
              disabled:'{moreCheckedDisabled}'  
        },
        menu:[{
            text: _('Level Filtering'),
            reference:'filerLevelBtn',
            handler:'onFilteriLevel',
            bind:{
              disabled:'{moreCheckedDisabled}'  
            }
        },{
            text:_('Type Filtering'),
            reference:'filterTypeBtn',
            handler:'onFilterType',
            bind:{
              disabled:'{moreCheckedDisabled}'  
            }
        },{
            text:_('Position Filtering'),
            reference:'filterLocationBtn',
            handler:'onFilterLocation',
            bind:{
              disabled:'{moreCheckedDisabled}'  
            }
        },{
            text:_('Position & Type'),
            reference:'filterTypeLocBtn',
            handler:'onFilterTypeLoc',
            bind:{
              disabled:'{moreCheckedDisabled}'  
            }
        }]
    },/*{
        xtype: 'splitbutton',
        text: _('Affection'),
        reference:'effectBtn',
        iconCls: 'toolbar-overflow-list',
        menu:[{
            text:'Tunnel',
            reference:'tunnelBtn',
            iconCls: 'x-fa fa-undo',
            handler: 'onEffectTunnel',
            disabled: true
        },{
            text:'pw',
            reference:'pwBtn',
            iconCls: 'x-fa fa-undo',
            handler: 'onEffectPw',
            disabled: true
        },{
            text:_('Business'),
            reference:'businessBtn',
            iconCls: 'x-fa fa-undo',
            handler: 'onEffectBusiness',
            disabled: true
        }]
    },*/{
        text: _('Export'),
        xtype: 'splitbutton',
        iconCls:'x-fa fa-download',
        menu:[{
            text:_('All'),
            handler:'onExportAll'
        },{
            text:_('current page'),
            handler:'onExportCurrentPage'
        },{
            text:_('selected'),
            reference: 'selectExportBtn',
            bind:{
              disabled:'{moreCheckedDisabled}'  
            },
            handler:'onExportSelected'
        }]
    },'|','->', {
        itemId : 'showConditions',
        xtype : 'checkboxfield',
        boxLabel : _('Show Conditions'),
        checked : false,
        padding : '0 6 0 0',
        handler: 'isShow'
    },{
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    },{
        itemId : 'expandAll',
        text : '',
        tooltip : _('Full Expand'),
        handler :'onExpandAll',
        iconCls : 'x-fa fa-search-plus',
        disabled : false
    },{
        itemId : 'closeAll',
        text : '',
        tooltip : _('Collapse All'),
        handler : 'onCloseAll',
        iconCls : 'x-fa fa-search-minus',
        disabled : false
    },{
        itemId : 'tbSeparator1',
        xtype: 'tbseparator'
    },{
        itemId : 'reset',
        text : _('Reset'),
        tooltip : _('Reset'),
        iconCls : 'x-fa fa-reply',
        handler : 'onReset'
    },{
        itemId : 'search',
        text : _('Search'),
        tooltip : _('Search'),
        iconCls : 'x-fa fa-search',
        handler : 'onQuery'
    },{ 
        xtype:'BookMarkButton',       //必配
        iconCls:'x-fa fa-bookmark-o',//'x-fa fa-edit', 
        containerType: 'currentAlarmTreeView',     //必配，配置模块主页面的xtype
        formReference: 'alarmCheckForm',       //必配，配置查询条件form的reference
        module:'currentAlarmTreeView',          //必配，配置自己模块的名字，名字会被记录到数据库，根据模块名字来查询书签
        defaultName: _('CurrentAlarm--Query')    //必配，配置自己模块书签名字的默认前缀
    }]
});