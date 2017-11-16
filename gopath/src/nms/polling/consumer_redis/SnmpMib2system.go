package consumer

import (
	"errors"
	"log"
	"time"

	g "github.com/soniah/gosnmp"
)

func SnmpMib2system(target string, p_snmpConfig *map[string]interface{}) (bool, error) {

	snmpConfig := (*p_snmpConfig)
	snmp := &g.GoSNMP{
		Target:    target,
		Port:      uint16(snmpConfig["port"].(float64)),
		Community: snmpConfig["community_read"].(string),
		// Version: g.Version2c,
		// Version: g.Version3,
		Version: g.Version1,
		Timeout: time.Duration(snmpConfig["timeout"].(float64)) * time.Second,
		Retries: int(snmpConfig["retries"].(float64)),
	}
	err := snmp.Connect()
	if err != nil {
		log.Printf("Connect() err: %v", err)
		return false, err
	}
	defer snmp.Conn.Close()

	// get mib2 system.uptime
	result, err2 := snmp.Get([]string{"1.3.6.1.2.1.1.3.0"})
	if err2 != nil {
		log.Printf("Get() err: %v", err2)
		return false, err2
	}

	if len(result.Variables) == 1 && result.Variables[0].Type == g.TimeTicks {
		log.Printf("=========== SNMP ping is ok! ============\n")
		return true, nil
	}

	return false, errors.New("snmp ping result not match!")
}
