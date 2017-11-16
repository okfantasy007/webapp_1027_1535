package consumer

import (
	"encoding/json"
	"log"

	"github.com/k-sone/snmpgo"
)

func do_icmpPing(p, a *map[string]interface{}) map[string]interface{} {
	node := (*p)
	ability := (*a)
	target := node["Hostname"].(string)
	timeout := ability["config"].(map[string]interface{})["timeout"].(float64)

	log.Println("==============>", target, timeout)
	rtt, err := FastPing(target, timeout)

	return map[string]interface{}{
		"ping_ok":  err == 0,
		"ping_rtt": int64(rtt),
	}
}

func do_snmpPing(p, results *map[string]interface{}) map[string]interface{} {
	snmp, err := SnmpConnect(p)
	if err != nil {
		// Failed to open connection
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	defer snmp.Close()

	oids, _ := snmpgo.NewOids([]string{
		"1.3.6.1.2.1.1.3.0",
	})
	pdu, err := snmp.GetRequest(oids)
	if err != nil {
		// Failed to request
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		// Received an error from the agent
		log.Println(pdu.ErrorStatus(), pdu.ErrorIndex())
		return map[string]interface{}{
			"success": false,
			"error":   pdu.ErrorStatus(),
		}
	}

	return map[string]interface{}{
		"success": pdu.ErrorStatus() == snmpgo.NoError,
	}
}

func do_snmpMib2System(p, r *map[string]interface{}) map[string]interface{} {
	result := (*r)
	if ping, exist := result["icmpPing"]; exist {
		if ping.(map[string]interface{})["ping_ok"].(bool) == false {
			return map[string]interface{}{
				"success": false,
				"error":   "ping failure",
			}
		}
	}

	snmp, err := SnmpConnect(p)
	if err != nil {
		// Failed to open connection
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	defer snmp.Close()

	oids, _ := snmpgo.NewOids([]string{
		"1.3.6.1.2.1.1.1.0",
		"1.3.6.1.2.1.1.2.0",
		"1.3.6.1.2.1.1.3.0",
		"1.3.6.1.2.1.1.4.0",
		"1.3.6.1.2.1.1.5.0",
		"1.3.6.1.2.1.1.6.0",
		"1.3.6.1.2.1.1.7.0",
	})
	pdu, err := snmp.GetRequest(oids)
	if err != nil {
		// Failed to request
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		// Received an error from the agent
		log.Println(pdu.ErrorStatus(), pdu.ErrorIndex())
		return map[string]interface{}{
			"success": false,
			"error":   pdu.ErrorStatus(),
		}
	}

	var vbs interface{}
	err = json.Unmarshal([]byte(pdu.VarBinds().String()), &vbs)
	if err != nil {
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"success":  true,
		"VarBinds": vbs,

		// sysDescr.0 (octet string) Hardware: Intel64 Family 6 Model 60 Stepping 3 AT/AT COMPATIBLE - Software: Windows Version 6.1 (Build 7601 Multiprocessor Free) [48.61.72.64.77.61.72.65.3A.20.49.6E.74.65.6C.36.34.20.46.61.6D.69.6C.79.20.36.20.4D.6F.64.65.6C.20.36.30.20.53.74.65.70.70.69.6E.67.20.33.20.41.54.2F.41.54.20.43.4F.4D.50.41.54.49.42.4C.45.20.2D.20.53.6F.66.74.77.61.72.65.3A.20.57.69.6E.64.6F.77.73.20.56.65.72.73.69.6F.6E.20.36.2E.31.20.28.42.75.69.6C.64.20.37.36.30.31.20.4D.75.6C.74.69.70.72.6F.63.65.73.73.6F.72.20.46.72.65.65.29 (hex)]
		// sysObjectID.0 (object identifier) enterprises.311.1.1.3.1.1
		// sysUpTimeInstance (timeticks) 84 days 05h:34m:50s.53th (727769053)
		// sysContact.0 (octet string) (zero-length)
		// sysName.0 (octet string) RC006410.softnm.raisecom.com [52.43.30.30.36.34.31.30.2E.73.6F.66.74.6E.6D.2E.72.61.69.73.65.63.6F.6D.2E.63.6F.6D (hex)]
		// sysLocation.0 (octet string) (zero-length)
		// sysServices.0 (integer) 76
	}

}

func do_snmpMib2InterfaceState(p, results *map[string]interface{}) map[string]interface{} {
	snmp, err := SnmpConnect(p)
	if err != nil {
		// Failed to open connection
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	defer snmp.Close()

	oids_str := []string{
		"1.3.6.1.2.1.2.2.1.1",
		"1.3.6.1.2.1.2.2.1.2",
		"1.3.6.1.2.1.2.2.1.7",
		"1.3.6.1.2.1.2.2.1.8",
		"1.3.6.1.2.1.2.2.1.9",
	}
	oids, _ := snmpgo.NewOids(oids_str)

	pdu, err := snmp.GetBulkWalk(oids, 0, 5)
	if err != nil {
		// Failed to request
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		// Received an error from the agent
		log.Println(pdu.ErrorStatus(), pdu.ErrorIndex())
		return map[string]interface{}{
			"success": false,
			"error":   pdu.ErrorStatus(),
		}
	}

	var vbs interface{}
	err = json.Unmarshal([]byte(pdu.VarBinds().String()), &vbs)
	if err != nil {
		log.Println(err)
		return map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"root_oid": oids_str,
		"success":  true,
		"VarBinds": vbs,
	}
}
