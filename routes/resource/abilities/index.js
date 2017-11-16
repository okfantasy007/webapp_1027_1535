var abilityConfig = {
	ne_opticaldevice: {
		type: 'list',
		mibnodes: {
			sysObjectID: {oid: '1.3.6.1.2.1.1.2.0'},
			rcHardwareVersion: {oid: '1.3.6.1.4.1.8886.15.1.1.1.1.4.0'},
			rcSoftwareVersion: {oid: '1.3.6.1.4.1.8886.15.1.1.1.1.5.0'},
			rcDeviceSerialNumber: {oid: '1.3.6.1.4.1.8886.15.1.1.1.1.1.0', parse: 'rcDeviceSerialNumber'}
		},
		// filter: 
		dispose: 'dispose_ne_opticaldevice'
	},
	chassis_opticaldevice: {
		type: 'table',
		mibnodes: {
			rcShelfIndex: {oid: '1.3.6.1.4.1.8886.15.1.1.1.2.1.1'},
			rcShelfName: {oid: '1.3.6.1.4.1.8886.15.1.1.1.2.1.2'},
			rcShelfDescr: {oid: '1.3.6.1.4.1.8886.15.1.1.1.2.1.3'}
		},
		dispose: 'dispose_chassis_opticaldevice'
	},
	card_optentity: {
		type: 'table',
		mibnodes: {
			rcEntPhysicalID: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.1'},
			rcEntPhysicalModuleType: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.3'},
			rcEntPhysicalClass: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.5'},
			rcEntPhysicalName: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.7'},
			rcEntPhysicalHardwareVersion: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.9'},
			rcEntPhysicalSoftwareVersion: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.10'},
			rcEntPhysicalFirmwareVersion: {oid: '1.3.6.1.4.1.8886.15.1.4.1.1.1.1.11'}
		},
		dispose: 'dispose_card_optentity'
	},
	port_iftable: {
		type: 'table',
		mibnodes: {
			ifIndex: {oid: '1.3.6.1.2.1.2.2.1.1'},
			ifDescr: {oid: '1.3.6.1.2.1.2.2.1.2'},
			ifAdminStatus: {oid: '1.3.6.1.2.1.2.2.1.7'},
			ifOperStatus: {oid: '1.3.6.1.2.1.2.2.1.8'},
			ifSpeed: {oid: '1.3.6.1.2.1.2.2.1.5'}
		},
		dispose: 'dispose_port_iftable'
	}
};

exports.config = abilityConfig;