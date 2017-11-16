Ext.define('Admin.view.inventory.basemodel.basePortGrid', {
    extend: 'Admin.view.base.PagedGrid',
    xtype: 'basePortGrid',
    selType: 'checkboxmodel',
    // grid显示字段
    columns: [
    //  { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' },
        { text: _('Belong Ne'), dataIndex: 'ne_userlabel', width: 135 },
        { text: _('Port Index'),  dataIndex: 'port_index', width: 100 },
        { text: _('Port Name'),  dataIndex: 'userlabel', width: 120 },
        { text: _('Fixed Name'),  dataIndex: 'port_fix_name', width: 100 },
        { text: _('Port Type'),  dataIndex: 'port_type_name', width: 100 },
        { text: _('Port Desc'),  dataIndex: 'port_desc', width: 180 },
        { text: _('Tenant'), dataIndex: 'tenant', width: 80 },
        { text: _('Port Duplex Mode'), dataIndex: 'duplex', width: 100,
            menuDisabled: true,
            renderer: function getColor(v,m,r){
                if(r.get('duplex') == 0 ){
                    return _("自协商");
                }
                else if(r.get('duplex') == 1 ){
                    return _("全双工");
                }
                return _("半双工");// 0：自协商, 1:全双工, 2:半双工',
            }
        },
        { text: _('Update Time'), dataIndex: 'update_time', width: 160, 
            renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s')  
        },
        { text: _('Speed'),  dataIndex: 'speed', width: 100 },
        { text: _('Jumbo Frame'),  dataIndex: 'jumboframe', width: 80 },
        { text: 'mtu',  dataIndex: 'mtu', width: 80 },

        { xtype: 'hidden',text: _('MAC Address'),  dataIndex: 'macaddress', width: 120 },
        { xtype: 'hidden',text: _('Running status'), dataIndex: 'operstatus', width: 80,
            menuDisabled: true,
            renderer: function getColor(v,m,r){
                if (r.get('operstatus') == 1) {
                    m.tdCls = 'resourcestate_on';
                    return _("正常");
                }
                else {
                    m.tdCls = 'resourcestate_off';
                }
                return _("故障");
            }
        },
        // { text: '描述信息',  dataIndex: 'desc_info', width: 100 },
        { xtype: 'hidden', text: '端口OID',  dataIndex: 'port_identifier', width: 80 },
        { xtype: 'hidden', text: 'Mib值', dataIndex: 'index_in_mib', width: 100 },
        {xtype: 'hidden',text: 'adminstatus', dataIndex: 'adminstatus', width: 120},
        {xtype: 'hidden',text: '网元ID', dataIndex: 'neid', width: 120},
        {xtype: 'hidden',text: '速率类型ID', dataIndex: 'rate_id', width: 120},
        {xtype: 'hidden',text: '端口类型ID', dataIndex: 'port_type_id', width: 120},
        {xtype: 'hidden',text: '板卡ID', dataIndex: 'card_id', width: 120},
        {xtype: 'hidden',text: '端口分类', dataIndex: 'port_category', width: 120},
        {xtype: 'hidden',text: _('Port Name'), dataIndex: 'port_name', width: 120},
        {xtype: 'hidden', text: '端口ID', dataIndex: 'port_id', flex: 1 },
    ],
    viewConfig: {
        //Return CSS class to apply to rows depending upon data values
        emptyText: _('No data to display'),
        deferEmptyText: false,
        trackOver: false,
        stripeRows: true
    },
    // 分页工具条位置
    // pagingbarDock: 'bottom',
    pagingbarDock: 'top',
    // 默认每页记录数
    pagingbarDefaultValue: 15,
    // 分页策略
    pagingbarConfig: {
        fields: [{name: 'val', type: 'int'}],
        data: [
            {val: 15},
            {val: 30},
            {val: 60},
            {val: 100},
            {val: 200},
            {val: 500},
            {val: 1000},
            {val: 2000},
        ]
    }
});
