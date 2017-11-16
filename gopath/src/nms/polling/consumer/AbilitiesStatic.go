package consumer

import (
	"encoding/json"
	// "log"

	"github.com/k-sone/snmpgo"
)

func IcmpPing(p *PollingTask) *map[string]interface{} {
	timeout := 5.0
	retries := 1
	for _, temp := range p.PollingTemplates {
		if temp.Type == "ICMP" {
			timeout = temp.Config.Timeout
			retries = temp.Config.Retries
			break
		}
	}

	var ping_rtt int64 = -1
	var ping_ok bool = false
	var ping_tries = 0
	for i := 0; i <= retries; i++ {
		ping_tries = i + 1
		// log.Println("==============>", p.Hostname, timeout, retries)
		rtt, err := FastPing(p.Hostname, timeout)
		if err == 0 {
			ping_rtt = int64(rtt)
			ping_ok = true
			break
		}
	}

	return &map[string]interface{}{
		"ping_ok":    ping_ok,
		"ping_rtt":   ping_rtt,
		"ping_tries": ping_tries,
	}
}

func SnmpPing(p *PollingTask) *map[string]interface{} {

	var vbs interface{}
	ok := false
	errmsg := ""
	oids, _ := snmpgo.NewOids([]string{
		"1.3.6.1.2.1.1.3.0",
	})

	for _, temp := range p.PollingTemplates {
		if temp.Type != "SNMP" {
			continue
		}

		// log.Println(i, temp.Config)

		// snmp
		snmp, err := SnmpGetConnect(p.Hostname, &temp.Config)
		if err != nil {
			ok = false
			errmsg = "snmp Connect failure"
			continue
		}
		defer snmp.Close()

		pdu, err := snmp.GetRequest(oids)
		if err != nil {
			ok = false
			errmsg = "snmp Get failure"
			continue
		}
		if pdu.ErrorStatus() != snmpgo.NoError {
			ok = false
			errmsg = "Received an error from the agent"
			continue
		}

		err = json.Unmarshal([]byte(pdu.VarBinds().String()), &vbs)
		if err != nil {
			ok = false
			errmsg = err.Error()
			continue
		}

		ok = true
		errmsg = "no error"
		break
	}

	if !ok {
		// log.Println(errmsg)
	}

	return &map[string]interface{}{
		"success": ok,
		"errmsg":  errmsg,
	}

}

func SnmpMib2System(p *PollingTask) *map[string]interface{} {

	var vbs interface{}
	var use_template Template
	ok := false
	errmsg := ""
	oids, _ := snmpgo.NewOids([]string{
		"1.3.6.1.2.1.1.1.0",
		"1.3.6.1.2.1.1.2.0",
		"1.3.6.1.2.1.1.3.0",
		"1.3.6.1.2.1.1.4.0",
		"1.3.6.1.2.1.1.5.0",
		"1.3.6.1.2.1.1.6.0",
		"1.3.6.1.2.1.1.7.0",
	})

	for _, temp := range p.PollingTemplates {
		if temp.Type != "SNMP" {
			continue
		}

		// log.Println(i, temp.Config)

		// ping
		_, ping_err := FastPing(p.Hostname, temp.Config.Timeout)
		if ping_err != 0 {
			ok = false
			errmsg = "ping failure"
			break
		}

		// snmp
		snmp, err := SnmpGetConnect(p.Hostname, &temp.Config)
		if err != nil {
			ok = false
			errmsg = "snmp Connect failure"
			continue
		}
		defer snmp.Close()

		pdu, err := snmp.GetRequest(oids)
		if err != nil {
			ok = false
			errmsg = "snmp Get failure"
			continue
		}
		if pdu.ErrorStatus() != snmpgo.NoError {
			ok = false
			errmsg = "Received an error from the agent"
			continue
		}

		err = json.Unmarshal([]byte(pdu.VarBinds().String()), &vbs)
		if err != nil {
			ok = false
			errmsg = err.Error()
			continue
		}

		ok = true
		errmsg = "no error"
		use_template = temp
		break
	}

	if !ok {
		// log.Println(errmsg)
	}

	return &map[string]interface{}{
		"success":  ok,
		"errmsg":   errmsg,
		"VarBinds": vbs,
		"template": use_template,

		// sysDescr.0 (octet string) Hardware: Intel64 Family 6 Model 60 Stepping 3 AT/AT COMPATIBLE - Software: Windows Version 6.1 (Build 7601 Multiprocessor Free) [48.61.72.64.77.61.72.65.3A.20.49.6E.74.65.6C.36.34.20.46.61.6D.69.6C.79.20.36.20.4D.6F.64.65.6C.20.36.30.20.53.74.65.70.70.69.6E.67.20.33.20.41.54.2F.41.54.20.43.4F.4D.50.41.54.49.42.4C.45.20.2D.20.53.6F.66.74.77.61.72.65.3A.20.57.69.6E.64.6F.77.73.20.56.65.72.73.69.6F.6E.20.36.2E.31.20.28.42.75.69.6C.64.20.37.36.30.31.20.4D.75.6C.74.69.70.72.6F.63.65.73.73.6F.72.20.46.72.65.65.29 (hex)]
		// sysObjectID.0 (object identifier) enterprises.311.1.1.3.1.1
		// sysUpTimeInstance (timeticks) 84 days 05h:34m:50s.53th (727769053)
		// sysContact.0 (octet string) (zero-length)
		// sysName.0 (octet string) RC006410.softnm.raisecom.com [52.43.30.30.36.34.31.30.2E.73.6F.66.74.6E.6D.2E.72.61.69.73.65.63.6F.6D.2E.63.6F.6D (hex)]
		// sysLocation.0 (octet string) (zero-length)
		// sysServices.0 (integer) 76
	}

}

func SnmpMib2InterfaceState(p *PollingTask) *map[string]interface{} {

	var vbs interface{}
	ok := false
	errmsg := ""

	oids_str := []string{
		"1.3.6.1.2.1.2.2.1.1",
		"1.3.6.1.2.1.2.2.1.2",
		"1.3.6.1.2.1.2.2.1.7",
		"1.3.6.1.2.1.2.2.1.8",
		"1.3.6.1.2.1.2.2.1.9",
	}
	oids, _ := snmpgo.NewOids(oids_str)

	for _, temp := range p.PollingTemplates {
		if temp.Type != "SNMP" {
			continue
		}

		// log.Println(i, temp.Config)

		// ping
		_, ping_err := FastPing(p.Hostname, temp.Config.Timeout)
		if ping_err != 0 {
			ok = false
			errmsg = "ping failure"
			break
		}

		// snmp
		snmp, err := SnmpGetConnect(p.Hostname, &temp.Config)
		if err != nil {
			ok = false
			errmsg = "snmp Connect failure"
			continue
		}
		defer snmp.Close()

		pdu, err := snmp.GetBulkWalk(oids, 0, 5)
		if err != nil {
			ok = false
			errmsg = "snmp Get failure"
			continue
		}
		if pdu.ErrorStatus() != snmpgo.NoError {
			ok = false
			errmsg = "Received an error from the agent"
			continue
		}

		err = json.Unmarshal([]byte(pdu.VarBinds().String()), &vbs)
		if err != nil {
			ok = false
			errmsg = err.Error()
			continue
		}

		ok = true
		errmsg = "no error"
		break
	}

	if !ok {
		// log.Println(errmsg)
	}

	return &map[string]interface{}{
		"success":  ok,
		"errmsg":   errmsg,
		"VarBinds": vbs,
	}

}