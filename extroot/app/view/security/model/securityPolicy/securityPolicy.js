Ext.define('Admin.view.security.model.securityPolicy.securityPolicy', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'user_pwd_minilength' },
        { name: 'admin_pwd_minilength' },
        { name: 'pwd_maxlength' },
        { name: 'pwd_short_save_days' },
        { name: 'pwd_letter_minimum_num' },
        { name: 'pwd_uppercase_minimum_num' },
        { name: 'pwd_lowercase_minimum_num' },
        { name: 'pwd_number_minimum_num' },
        { name: 'pwd_special_char_minimum_num' },
        { name: 'max_name_pwd_same_num' },
        { name: 'no_name_char_num' },
        { name: 'pwd_no_workbook' },
        { name: 'pwd_no_name_reverse' },
        { name: 'pwd_no_four_series' },
        { name: 'pwd_no_increase_degressive' },
        { name: 'new_old_pwd_diffethree_time' },
        { name: 'name_minilength' },
        { name: 'forever_lock' },
        { name: 'auto_unlock_time' },
        { name: 'error_pwd_num_lock' },
        { name: 'pwd_expire_clew_days' },
        { name: 'admin_no_lock' }
    ]
})