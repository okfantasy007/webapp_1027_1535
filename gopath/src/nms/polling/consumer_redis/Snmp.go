package consumer

import (
	"fmt"
	"log"
	"time"

	"github.com/k-sone/snmpgo"
)

func SnmpConnect(p *map[string]interface{}) (*snmpgo.SNMP, error) {
	node := (*p)
	snmpConfig := node["Poll_template_config"].(map[string]interface{})["snmp"].(map[string]interface{})
	target := fmt.Sprintf("%s:%d",
		node["Hostname"].(string),
		uint16(snmpConfig["port"].(float64)),
	)

	log.Println("=======3=======>", target)
	log.Println("=======3=======>", snmpConfig["community_read"].(string))

	snmp, err := snmpgo.NewSNMP(snmpgo.SNMPArguments{
		Address:   target,
		Version:   snmpgo.V2c,
		Community: snmpConfig["community_read"].(string),
		Timeout:   time.Duration(snmpConfig["timeout"].(float64)) * time.Second,
		Retries:   uint(snmpConfig["retries"].(float64)),
	})
	if err != nil {
		// Failed to create snmpgo.SNMP object
		log.Println(err)
		return nil, err
	}
	if err := snmp.Open(); err != nil {
		// Failed to open connection
		log.Println(err)
		return nil, err
	}
	return snmp, nil
}
