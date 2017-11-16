Ext.define('Admin.view.reports.reportResultListView', {
    extend: 'Ext.container.Container',
    xtype: 'reportResultListView',

    requires: [
        'Admin.view.base.PagedGrid',
        // 'Admin.view.reports.clock'
    ],

    controller: {
        preViewCommon: function(title, report_name) {
            var pdf_preview_window = Ext.widget('window', {
                title: title,
                modal: true,
                constrain: true,//禁止窗口移出浏览器屏幕
                items: [{
                    xtype: 'panel',
                    width: 850,
                    height: 500,
                    // html:"<img src='/images/banner_logo.png' height='24'>",//显示本地路径图片
                    // html:"<img src='http://c.hiphotos.baidu.com/zhidao/pic/item/86d6277f9e2f070832abe952e124b899a901f232.jpg'>"//根据url显示网络图片
                    // html: "<img src='/reports/高级信息系统项目管理师的5天修炼.pdf' width='450' height='400'>"
                }]
            }).show();
            var pdf_preview_id = pdf_preview_window.down('panel').id;

            var success = new PDFObject({
                url: "report/" + report_name,
                pdfOpenParams: {
                    scrollbars: '0',
                    toolbar: '0',
                    statusbar: '0'
                }
            }).embed(pdf_preview_id);
        },
        onPreview: function() {
            var me = this;
            var result_list_grid = this.lookupReference('result_list_grid');
            var records = result_list_grid.getSelectionModel().getSelection();
            var task_id = records[0].get('task_id');
            var report_name = records[0].get('report_name');
            if (report_name.indexOf('.html') !== -1) {
                report_name = report_name.substring(0, report_name.indexOf('.html')) + ".pdf";
            }
            if (report_name.indexOf('.csv') !== -1) {
                report_name = report_name.substring(0, report_name.indexOf('.csv')) + ".pdf";
            }
            var title = _('Preview Report') + ' ( ' + _('name') + "：" + records[0].get('report_name') + " )";
            Ext.Ajax.request({
                url: "report/" + report_name,
                success: function(response, opts) {
                    me.preViewCommon(title, report_name);
                    Ext.Ajax.request({
                        url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=1"
                    });
                    return;
                },
                failure: function(response, opts) {
                    // Ext.Msg.alert(_('Tip'), _('服务器未发现该文件'));
                    Ext.Ajax.request({
                        url: "reports/rest/report_task_result/previewReport?report_name=" + report_name + "&task_id=" + records[0].get("task_id"),
                        success: function(response, opts) {
                            var res = Ext.decode(response.responseText);
                            if (res && res.status == "success") {
                                me.preViewCommon(title, report_name);
                                Ext.Ajax.request({
                                     url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=1"
                                });
                            }else{
                                Ext.Msg.alert(_('Tip'), _('服务器未发现该文件'));
                                 Ext.Ajax.request({
                                     url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=0"
                                });
                            }
                            return;
                        },
                        failure: function(response, opts) {
                            // Ext.Msg.alert(_('Tip'), _('服务器未发现该文件'));
                            Ext.Ajax.request({
                                 url:"reports/rest/report_task_result/recordPreviewReportLog?report_name=" + report_name + "&flag=0"
                            });
                            //console.log('server-side failure with status code ' + response.status);
                            return;
                        }
                    });
                    //console.log('server-side failure with status code ' + response.status);
                    return;
                }
            });

        },
        onDownLoad: function() {
            var result_list_grid = this.lookupReference('result_list_grid');
            var records = result_list_grid.getSelectionModel().getSelection();
            if (records && records.length == 0) {
                console.log("请选择某行数据");
                Ext.Msg.alert('提示', '请选择某行数据');
                return;
            }
            location.href = 'reports/rest/report_task_result/reportDownload?fileName=' + records[0].get("report_name") + '&taskId=' + records[0].get("task_id");
        },
        onRefresh: function() {
            var result_list_grid = this.lookupReference('result_list_grid');
            var paging = result_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var page_size = paging.getComponent('result_list_grid_pagesize').getValue();
            var store = result_list_grid.getStore();
            var extra_params = store.proxy.extraParams;
            if ("report_name" in extra_params) {
                delete extra_params["report_name"];
            }
            store.reload({
                page: 1,
                start: 0,
                limit: page_size
            });
        },
        onKeyWordChange: function() {
            var result_list_grid = this.lookupReference('result_list_grid');
            var report_name = result_list_grid.down('toolbar').down('textfield').getValue();
            var paging = result_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = result_list_grid.getStore();
            store.proxy.extraParams = {
                "report_name": report_name
            };
            store.reload({
                page: 1,
                start: 0
            });
        }

    },
    viewModel: {
        stores: {
            // 远程store
            result_list_grid_store: {
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/reports/rest/report_task_result/getTaskResultInfo',
                    // url: '/report/gettaskresultlist/db/page', //本地调试用
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'count'
                    }
                },
                autoLoad: true
            }
        }
    },
    // 指定布局
    layout: 'card',
    views: ['clock'],
    cls: 'shadow',

    items: [{
        // store: task_list_store,
        xtype: 'grid',
        title: _('Result List'),
        iconCls: 'x-fa fa-line-chart',
        // hidden: true,
        reference: 'result_list_grid',
        bind: {
            store: '{result_list_grid_store}'
        },
        // forceFit: true, //列表宽度自适应
        columnLines: true,
        // split: true,
        // frame: true,
        selModel: {
            selType: 'checkboxmodel'
        },
        // margin: '0 0 10 0',
        //border: false,
        columns: [
            //{ xtype: 'rownumberer', sortable: false, align: 'center' },
            //menuDisabled: true 右边不可选择列显示
            {
                text: _('Task Name'),
                dataIndex: 'task_name',
                sortable: true,
                flex: 2,
                align: 'center'
            }, {
                text: _('Report Name'),
                dataIndex: 'report_name',
                menuDisabled: true,
                sortable: true,
                flex: 2,
                align: 'center'
            }, {
                text: _('Start Time'),
                dataIndex: 'start_time',
                sortable: true,
                flex: 1.75,
                align: 'center'
            }, {
                text: _('End Time'),
                dataIndex: 'end_time',
                menuDisabled: true,
                sortable: true,
                flex: 1.75,
                align: 'center'
            }, {
                text: _('Task Execution Result'),
                dataIndex: 'execute_result',
                sortable: true,
                flex: 1.5,
                align: 'center',
                renderer: function(value, metaData) {
                    value = value.toString(); //如果value为int型，则转化为string型
                    if (value == '0') {
                        metaData.style = 'color:#d9534f;';
                        return _('failure');
                    } else if (value == '1') {
                        metaData.style = 'color:#5cb85c;';
                        return _('success');
                    } else {
                        metaData.style = 'color:#f0ad4e;';
                        return _('unknown');
                    }
                }
            }, {
                text: _('Time Consuming'),
                dataIndex: 'time_consuming',
                menuDisabled: true,
                sortable: true,
                flex: 1,
                align: 'center'
            },{

                text:_('Email Result'),
                dataIndex:'email_result',
                sortable:true,
                flex:1.8,
                align:'center',
                renderer:function(value,metaData,rowData){
                    if (value=='1') {
                        return _('success');
                    }else if (value=='0'){
                        var email_error_code=rowData.get('email_error_code');
                        if (email_error_code=='0') {
                            return _('failure')+':'+_('Email Error1');
                        }else {
                            return _('failure')+':'+_('Email Error2');
                        }
                    }else if (value=='2'){
                         return _('Nil');
                    }

                   
                }

            }

        ],

        viewConfig: {
            //Return CSS class to apply to rows depending upon data values
            emptyText: _('No data to display'),
            deferEmptyText: false,
            trackOver: false,
            stripeRows: false,
            getRowClass: function(record) {

            }
        },
        dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                fieldDefaults: {
                    labelWidth: 40,
                    maxWidth: 145,
                    labelAlign: "right",
                    buttonAlign: "right"
                }, // The fields
                items: [{
                        text: _('Download'),
                        iconCls: 'x-fa fa-download',
                        itemId: 'resultDownLoadBtn',
                        handler: 'onDownLoad',
                        disabled: true
                    }, {
                        text: _('Preview'),
                        iconCls: 'x-fa fa-eye',
                        itemId: 'resultPreviewBtn',
                        handler: 'onPreview',
                        disabled: true
                    }, '->', {
                        xtype: 'textfield',
                        fieldLabel: _('Report Name'),
                        labelWidth: APP.lang == 'zh_CN' ? 60 : 87,
                        name: 'report_name',
                        listeners: {
                            change: 'onKeyWordChange'
                        }
                    },
                    /*{
                       tooltip: _('Query'),
                       iconCls: 'x-fa fa-search',
                       handler: 'onQuery'
                   },*/
                    {
                        xtype: 'button',
                        text: _('Refresh'),
                        iconCls: 'x-fa fa-refresh',
                        handler: 'onRefresh'
                    }
                ]
            }, {
                xtype: 'pagingtoolbar',
                dock: 'top',
                inputItemWidth: 80,
                displayInfo: true,
                displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
                emptyMsg: _("Empty"),
                items: [
                    '-', {
                        fieldLabel: _('Page Size'),
                        xtype: 'combobox',
                        itemId: 'result_list_grid_pagesize',
                        width: 170,
                        padding: '0 0 0 5',
                        displayField: 'val',
                        valueField: 'val',
                        multiSelect: false,
                        editable: false,
                        labelWidth: APP.lang == 'zh_CN' ? 60 : 65,
                        store: Ext.create('Ext.data.Store', {
                            fields: [{
                                name: 'val',
                                type: 'int'
                            }],
                            data: [{
                                val: 1
                            }, {
                                val: 2
                            }, {
                                val: 15
                            }, {
                                val: 100
                            }, {
                                val: 200
                            }, {
                                val: 500
                            }, {
                                val: 1000
                            }, ]
                        }),
                        value: 15,
                        listeners: {
                            change: function(me, newValue, oldValue, ops) {
                                var grid = this.up('grid');
                                Ext.apply(grid.store, {
                                    pageSize: newValue
                                });
                                this.up('pagingtoolbar').moveFirst();
                            }
                        }
                    }
                ]
            }

        ], //dockedItems
        listeners: {
            rowclick: function(grid, record, tr, rowIndex, e, eOpts) {
                var result_list_grid = this;
                var resultDownLoadBtn = result_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('resultDownLoadBtn');
                var resultPreviewBtn = result_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('resultPreviewBtn');
                var sm = result_list_grid.getSelectionModel();
                var rows = sm.getSelection();

                if (rows.length > 1 || rows.length == 0) { //多选或无选择的情况
                    resultDownLoadBtn.setDisabled(true);
                    resultPreviewBtn.setDisabled(true);
                } else if (rows.length == 1) {
                    if (rows[0].get('execute_result') == '1') {
                        resultDownLoadBtn.setDisabled(false);
                        resultPreviewBtn.setDisabled(false);
                    } else {
                        resultDownLoadBtn.setDisabled(true);
                        resultPreviewBtn.setDisabled(true);
                    }

                }

            },
            selectionchange: function(model, records) {
                var result_list_grid = this;
                var resultDownLoadBtn = result_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('resultDownLoadBtn');
                var resultPreviewBtn = result_list_grid.getDockedItems('toolbar[dock="top"]')[0].getComponent('resultPreviewBtn');
                var hd_checker = result_list_grid.getEl().select('div.x-column-header-checkbox');
                var hd = hd_checker.first();
                if (hd != null) {
                    if (hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) { //x-grid-hd-checker-on
                        console.log("全选");
                        resultDownLoadBtn.setDisabled(true);
                        resultPreviewBtn.setDisabled(true);
                    } else if (!hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) {
                        console.log("全不选");
                        resultDownLoadBtn.setDisabled(true);
                        resultPreviewBtn.setDisabled(true);
                    }
                }
            }
        }
        // end 分页
    }]
});