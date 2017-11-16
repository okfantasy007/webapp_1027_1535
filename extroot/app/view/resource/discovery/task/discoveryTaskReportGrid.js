Ext.define('Admin.view.resource.discovery.task.discoveryTaskReportGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'discoveryTaskReportGrid',
    
    viewModel: {
        stores: {
            scan_report: {
                data: []
            },
        }
    },

    bind: {
        store: '{scan_report}',
    },

    columns: [
        { xtype: 'rownumberer', width: 60, sortable: false, align: 'center' }, 
        { text: _('IP Address'), dataIndex: 'ip_address', flex: 2 },
        { text: _('discovery protocol'), dataIndex: 'protocol', flex: 1 },
        { text: _('Product Class'), dataIndex: 'ne_type_name', flex: 1 },
        { text: _('Start Time'), dataIndex: 'startTime', flex: 1 },
        { text: _('detect time taken (s)'), dataIndex: 'durationTime', flex: 1 },
        { text: _('detect result'), dataIndex: 'status', flex: 1 },
    ],

});
