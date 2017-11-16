Ext.define('Admin.view.performance.realTimeTask.controller.realChart1', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.realChart1',
    export: function () {
        var chart = this.getView().up().up().down('#realChart1');
        var title = chart.getTitle();
        Ext.MessageBox.confirm(_('Confirm Download'), _('Would you like to download the chart as an image'), function (choice) {
            if (choice == 'yes') {
                chart.download({
                	url: '/pmManagement/api/export/image',
                    format: "jpeg",
                    filename: encodeURI(title),
                });
            }
        });
    },
    exportToCSV: function () {
        this.doExport({
            type: 'csv',
            title: 'Pivot grid export demo',
            fileName: 'GridExport.csv'
        });
    },

    /*   exportToTSV: function(){
           this.doExport({
               type:       'tsv',
               title:      'Pivot grid export demo',
               fileName:   'GridExport.csv'
           });
       },*/

    doExport: function (config) {
        this.getView().up().up().down('#displayGrid1').saveDocumentAs(config);
    },

    onBeforeDocumentSave: function (view) {
        view.mask({
            xtype: 'loadmask',
            message: 'Document is prepared for export. Please wait ...'
        });
    },

    onDocumentSave: function (view) {
        view.unmask();
    },
    //将long类型转换为日期格式显示
    timeType: function (time) {
        var datetimeType = "";
        var date = new Date();
        date.setTime(time);
        datetimeType += date.getFullYear();   //年  
        datetimeType += "-" + this.getMonth(date); //月   
        datetimeType += "-" + this.getDay(date);   //日  
        datetimeType += " " + this.getHours(date);   //时  
        datetimeType += ":" + this.getMinutes(date);      //分
        datetimeType += ":" + this.getSeconds(date);      //分
        return datetimeType;
    },
    //返回月份
    getMonth: function (date) {
        var month = "";
        month = date.getMonth() + 1; //getMonth()得到的月份是0-11  
        if (month < 10) {
            month = "0" + month;
        }
        return month;
    },
    //返回01-30的日期  
    getDay: function (date) {
        var day = "";
        day = date.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        return day;
    },
    //返回小时
    getHours: function (date) {
        var hours = "";
        hours = date.getHours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        return hours;
    },
    //返回分
    getMinutes: function (date) {
        var minute = "";
        minute = date.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        return minute;
    },
    //返回秒
    getSeconds: function (date) {
        var second = "";
        second = date.getSeconds();
        if (second < 10) {
            second = "0" + second;
        }
        return second;
    },
    /* setTitleY: function () {
          var card = this.getView().up().up();
          resourcesTree=card.down('#resourcesTree'),
          console.info(qutoTypeTree),
          recordsResourcesTree=resourcesTree.getChecked(),
          qutoTypeTitles=[];
          for(var i = 0; i<recordsResourcesTree.length; i++){
              qutoTypeTitles.push(recordsResourcesTree[i].data.text);
          };
         return qutoTypeTitles;
     },*/
    resourceNames: function () {
        resourceForm = this.getView().up().up().down('#resourceForm')
        var resource = resourceForm.getForm().getValues();
        var names = resource.resourceNames;
        var resourceNames = names.split(',');
        return resourceNames;
    },
    onlin1: function (tooltip, record, item) {
        var item1 = item;
        item1.series.setTitle(this.resourceNames()[0]);
        item1.series.getXField();
        var title = item1.series.getTitle();
        console.info(title);
        tooltip.setHtml(title + ' on ' + this.timeType(record.get('time')) + ': ' +
            record.get(item1.series.getYField()));
    },
    onlin2: function (tooltip, record, item) {
        var item1 = item;
        item1.series.setTitle(this.resourceNames()[1]);
        item1.series.getXField();
        var title = item1.series.getTitle();
        console.info(title);
        tooltip.setHtml(title + ' on ' + this.timeType(record.get('time')) + ': ' +
            record.get(item1.series.getYField()));
    },
    onlin3: function (tooltip, record, item) {
        var item1 = item;
        item1.series.setTitle(this.resourceNames()[2]);
        item1.series.getXField();
        var title = item1.series.getTitle();
        console.info(title);
        tooltip.setHtml(title + ' on ' + this.timeType(record.get('time')) + ': ' +
            record.get(item1.series.getYField()));
    },
    onlin4: function (tooltip, record, item) {
        var item1 = item;
        item1.series.setTitle(this.resourceNames()[3]);
        item1.series.getXField();
        var title = item1.series.getTitle();
        console.info(title);
        tooltip.setHtml(title + ' on ' + this.timeType(record.get('time')) + ': ' +
            record.get(item1.series.getYField()));
    },
    onlin5: function (tooltip, record, item) {
        var item1 = item;
        item1.series.setTitle(this.resourceNames()[4]);
        item1.series.getXField();
        var title = item1.series.getTitle();
        console.info(title);
        tooltip.setHtml(title + ' on ' + this.timeType(record.get('time')) + ': ' +
            record.get(item1.series.getYField()));
    },

});

