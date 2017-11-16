Ext.define('Admin.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        alarm_sound: true,
        alarm_lv1_count: 0,
        alarm_lv2_count: 0,
        alarm_lv3_count: 0,
        alarm_lv4_count: 0,
        alarm_lv5_count: 0,

        alarm_last_update_time:0
    },

    formulas: {
        alarm_icon: function (get) {
            // return get('alarm_sound') ? 'x-fa fa-volume-up' : 'x-fa fa-volume-off'
            return get('alarm_sound') ? 'icon-volume-high' : 'icon-volume-mute2'
        },
        alarm_tooltip: function (get) {
            return get('alarm_sound') ? _('Disable alarm sound') : _('Enable alarm sound') 
        },
        alarm_total_count: function (get) {
            return get('alarm_lv1_count')
                  +get('alarm_lv2_count')
                  +get('alarm_lv3_count')
                  +get('alarm_lv4_count')
                  +get('alarm_lv5_count')
        }
    }    
});
