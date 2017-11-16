Ext.define('Admin.view.reports.reportTemplateListView', {
    extend: 'Ext.container.Container',
    xtype: 'reportTemplateListView',

    requires: [
        'Admin.view.base.PagedGrid'
    ],

    controller: {

        preViewCommon: function(title, template_name) {
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
                url: "report/" + template_name,
                pdfOpenParams: {
                    scrollbars: '0',
                    toolbar: '0',
                    statusbar: '0'
                }
            }).embed(pdf_preview_id);
        },

        onPreview: function() {
            var me = this;
            var template_list_grid = this.lookupReference('template_list_grid');
            var records = template_list_grid.getSelectionModel().getSelection();
            var template_name = records[0].get('template_id') + ".pdf";
            var title = _('Preview Template') + ' ( ' + _('name') + "：" + records[0].get('template_name') + " )";
            //
            Ext.Ajax.request({
                url: "report/" + template_name,
                success: function(response, opts) {
                    me.preViewCommon(title, template_name);
                    Ext.Ajax.request({
                        url:"reports/rest/report_template/recordPreviewTemplateLog?report_name=" + template_name + "&flag=1"
                    });
                    return;
                },
                failure: function(response, opts) {
                    // Ext.Msg.alert(_('Tip'), _('服务器未发现该文件'));
                    Ext.Ajax.request({
                        url: "reports/rest/report_template/getPreviewUrl?templateid=" + records[0].get('template_id'),
                        success: function(response, opts) {
                            var res = Ext.decode(response.responseText);
                            if (res && res.status == "success") {
                                me.preViewCommon(title, template_name);
                                Ext.Ajax.request({
                                    url:"reports/rest/report_template/recordPreviewTemplateLog?report_name=" + template_name + "&flag=1"
                                });
                            }else{
                                Ext.Ajax.request({
                                    url:"reports/rest/report_template/recordPreviewTemplateLog?report_name=" + template_name + "&flag=0"
                                });
                            }
                            return;
                        },
                        failure: function(response, opts) {
                            // Ext.Msg.alert(_('Tip'), _('服务器未发现该文件'));
                            Ext.Ajax.request({
                                    url:"reports/rest/report_template/recordPreviewTemplateLog?report_name=" + template_name + "&flag=0"
                                });
                            console.log('server-side failure with status code ' + response.status);
                            return;
                        }
                    });
                    console.log('server-side failure with status code ' + response.status);
                    return;
                }
            });
            //

        },
        onRefresh: function() {
            var template_list_grid = this.lookupReference('template_list_grid');
            var paging = template_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var page_size = paging.getComponent('template_list_grid_pagesize').getValue();

            var store = template_list_grid.getStore();
            var extra_params = store.proxy.extraParams;
            if ("template_name" in extra_params) {
                delete extra_params["template_name"];
            }
            store.reload({
                page: 1,
                start: 0,
                limit: page_size
            });
        },
        onQuery: function() {
            var template_list_grid = this.lookupReference('template_list_grid');
            var template_name = template_list_grid.down('toolbar').down('textfield').getValue();
            var paging = template_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = template_list_grid.getStore();
            store.proxy.extraParams = {
                "template_name": template_name
            };
            store.reload({
                page: 1,
                start: 0
            });
        },
        onKeyWordChange: function(me, newValue, oldValue, ops) {
            var template_list_grid = this.lookupReference('template_list_grid');
            var paging = template_list_grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = template_list_grid.getStore();
            store.proxy.extraParams = {
                "template_name": newValue
            };
            store.reload({
                page: 1,
                start: 0
            });
        },
    },
    viewModel: {
        stores: {
            // 远程store
            template_list_grid_store: {
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/reports/rest/report_template/getTemplateInfo',
                    // url: '/report/gettemplatelist/db/page', //本地调试用
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
    cls: 'shadow',

    items: [{
        xtype: 'grid',
        title: _('Template List'),
        iconCls: 'x-fa fa-puzzle-piece',
        reference: 'template_list_grid',
        bind: {
            store: '{template_list_grid_store}',
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
                text: _('Template Name'),
                dataIndex: 'template_name',
                sortable: true,
                flex: 4,
                align: 'center'
            }, {
                text: _('Template Desc'),
                dataIndex: 'template_desc',
                menuDisabled: true,
                sortable: true,
                flex: 6,
                align: 'center'
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
                        xtype: 'button',
                        text: _('Preview'),
                        // text: '<font color="white">预览</font>',
                        iconCls: 'x-fa fa-eye',
                        disabled: true,
                        handler: 'onPreview'
                    }, '->', {
                        xtype: 'textfield',
                        fieldLabel: _('Template Name'),
                        labelWidth: APP.lang == 'zh_CN' ? 60 : 103,
                        name: 'template_name',
                        listeners: {
                            change: 'onKeyWordChange'
                        }
                    },
                    /*{
                                       tooltip: '查询',
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
                        itemId: 'template_list_grid_pagesize',
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
                var template_list_grid = this;
                var toolbar = template_list_grid.getDockedItems('toolbar[dock="top"]')[0];
                var previewTemplateBtn = toolbar.down('button');

                var sm = template_list_grid.getSelectionModel();
                var rows = sm.getSelection();
                if (rows.length > 1 || rows.length == 0) { //多选或无选择的情况
                    previewTemplateBtn.setDisabled(true);
                } else if (rows.length == 1) {
                    previewTemplateBtn.setDisabled(false);
                    href = "http://www.baidu.com";
                }
            },
            selectionchange: function(model, records) {
                var template_list_grid = this;
                var toolbar = template_list_grid.getDockedItems('toolbar[dock="top"]')[0];
                var previewTemplateBtn = toolbar.down('button');
                var sm = template_list_grid.getSelectionModel();
                var rows = sm.getSelection();
                var hd_checker = template_list_grid.getEl().select('div.x-column-header-checkbox');
                var hd = hd_checker.first();
                if (hd != null) {
                    if (hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) { //x-grid-hd-checker-on
                        console.log("全选");
                        previewTemplateBtn.setDisabled(rows.length == 1 ? false : true);
                    } else if (!hd.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on')) {
                        console.log("全不选");
                        previewTemplateBtn.setDisabled(true);
                    }
                }
            }
        }
        // end 分页
    }]
});