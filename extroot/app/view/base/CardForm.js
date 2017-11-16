Ext.define('Admin.view.base.CardForm', {
    extend: 'Ext.form.Panel',
    xtype: 'CardForm',

    controller: {
        // 清除form变量到初始值
        clearForm: function() {
            var form = this.getView();
            if (form.orgValues) {
                form.getForm().setValues( form.orgValues );
                this.setResetRecord();
                form.getForm().reset();
            } else {
                this.saveOriginalValues();
            };
        },

        // load记录到form
        loadFormRecord: function(record) {
            var form = this.getView();
            this.saveOriginalValues();
            form.getForm().loadRecord(record);
            this.setResetRecord();
        },

        // 保存form初始变量
        saveOriginalValues: function(){
            var form = this.getView();
            if (!form.orgValues) {
                form.orgValues = Ext.clone( form.getForm().getValues() );
            }
        },

        // 使用当前form中的变量值作为reset后初始值
        setResetRecord: function() {
            var form = this.getView();
            var fields = form.query();
            for (var i in fields) {
                 fields[i].originalValue =  fields[i].value;
            }
        }
    }

});
