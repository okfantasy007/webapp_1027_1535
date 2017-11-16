package consumer

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/k-sone/snmpgo"
)

func SnmpGetConnect(hostname string, pSnmpConfig *TemplateConfig) (*snmpgo.SNMP, error) {
	target := fmt.Sprintf("%s:%d",
		hostname,
		uint16(pSnmpConfig.Port),
	)
	var snmpargs snmpgo.SNMPArguments
	switch pSnmpConfig.Version {
	case 1:
		snmpargs = snmpgo.SNMPArguments{
			Version:   snmpgo.V1,
			Address:   target,
			Timeout:   time.Duration(pSnmpConfig.Timeout) * time.Second,
			Retries:   uint(pSnmpConfig.Retries),
			Community: pSnmpConfig.CommunityRead,
		}
	case 2:
		snmpargs = snmpgo.SNMPArguments{
			Version:   snmpgo.V2c,
			Address:   target,
			Timeout:   time.Duration(pSnmpConfig.Timeout) * time.Second,
			Retries:   uint(pSnmpConfig.Retries),
			Community: pSnmpConfig.CommunityRead,
		}
	case 3:
		securityLevel := snmpgo.NoAuthNoPriv
		switch strings.ToLower(pSnmpConfig.V3securityLevel) {
		case "noauthnopriv":
			securityLevel = snmpgo.NoAuthNoPriv
		case "authnopriv":
			securityLevel = snmpgo.AuthNoPriv
		case "authpriv":
			securityLevel = snmpgo.AuthPriv
		}

		authProtocol := snmpgo.Sha
		switch strings.ToUpper(pSnmpConfig.V3authProtocol) {
		case "MD5":
			authProtocol = snmpgo.Md5
		case "SHA":
			authProtocol = snmpgo.Sha
		}

		privProtocol := snmpgo.Des
		switch strings.ToUpper(pSnmpConfig.V3privProtocol) {
		case "DES":
			privProtocol = snmpgo.Des
		case "AES":
			privProtocol = snmpgo.Aes
		}

		snmpargs = snmpgo.SNMPArguments{
			Version:       snmpgo.V3,
			Address:       target,
			Timeout:       time.Duration(pSnmpConfig.Timeout) * time.Second,
			Retries:       uint(pSnmpConfig.Retries),
			UserName:      pSnmpConfig.V3securityName,
			SecurityLevel: securityLevel,
			AuthProtocol:  authProtocol,
			AuthPassword:  pSnmpConfig.V3authKey,
			PrivProtocol:  privProtocol,
			PrivPassword:  pSnmpConfig.V3privKey,
		}
	}

	snmp, err := snmpgo.NewSNMP(snmpargs)
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

func SnmpGet(hostname string, templ *TemplateConfig, ability *Ability) *map[string]interface{} {

	_, ping_err := FastPing(hostname, templ.Timeout)
	if ping_err != 0 {
		return &map[string]interface{} {
			"success":  false,
			"errmsg":   "ping failure",
		}
	}

	snmp, err := SnmpGetConnect(hostname, templ)
	defer snmp.Close()
	if err != nil {
		return &map[string]interface{} {
			"success":  false,
			"errmsg":   err.Error(),
		}
	}

	oids_str := make([]string, 0, len(ability.Mibnodes))
	for _, nodeInfo := range ability.Mibnodes {
		oids_str = append(oids_str, nodeInfo.Oid)
	}
	if len(oids_str) == 0 {
		return &map[string]interface{} {
			"success":  false,
			"errmsg":   "not any oid specified",
		}
	}

	// log.Printf("in SnmpGet %s for ability %s, oid prepared:%s ", hostname, ability.Name, oids_str)

	oids, _ := snmpgo.NewOids(oids_str)

	var success bool
	var errDesc string
	var vbs *ResultSet
	if ability.Type == "list" {
		success, errDesc, vbs = snmpGetList(hostname, snmp, &oids, ability)
	}

	if ability.Type == "table" {
		success, errDesc, vbs = snmpGetTable(hostname, snmp, &oids, ability)
	}

	return &map[string]interface{} {
		"success":  success,
		"errmsg":   errDesc,
		"records":	*vbs,
	}

}

func snmpGetTable(hostname string, snmp *snmpgo.SNMP, oids *snmpgo.Oids, ability *Ability) (bool, string, *ResultSet) {

	pdu, err := snmp.GetBulkWalk(*oids, 0, len(*oids))
	if err != nil {
		return false, err.Error(), nil
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		return false, "Received an error from the agent" + hostname, nil
	}

	log.Printf("successfully read ability: %s from device %s", ability.Name, hostname)
	
	pvbs := pdu.VarBinds()
	results := make(ResultSet)
	for logicName, nodeInfo := range ability.Mibnodes {
		for i, pvb := range pvbs {
			if pvb == nil {
				continue
			}

			iOidStr := pvb.Oid.String()
			if strings.Index(iOidStr, nodeInfo.Oid+".") == 0 {
				instance := iOidStr[len(nodeInfo.Oid)+1:]
				if results[instance] == nil {
					results[instance] = map[string]string{logicName: pvb.Variable.String()}
				} else {
					results[instance][logicName] = pvb.Variable.String()
				}

				pvbs[i] = nil
			}
		}
	}

	return true, "no error", &results
}

func snmpGetList(hostname string, snmp *snmpgo.SNMP, oids *snmpgo.Oids, ability *Ability) (bool, string, *ResultSet) {

	pdu, err := snmp.GetRequest(*oids)
	if err != nil {
		return false, err.Error(), nil
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		return false, "Received an error from the agent" + hostname, nil
	}

	log.Printf("successfully read ability: %s from device %s", ability.Name, hostname)

	pvbs := pdu.VarBinds()
	results := make(ResultSet)
	for logicName, nodeInfo := range ability.Mibnodes {
		for _, pvb := range pvbs {
			if nodeInfo.Oid == pvb.Oid.String() {
				if results["0"] == nil {
					results["0"] = map[string]string{logicName: pvb.Variable.String()}
				} else {
					results["0"][logicName] = pvb.Variable.String()
				}
			}
		}
	}

	return true, "no error", &results
}

func SnmpGetListArbitrary (hostname string, templ *TemplateConfig, ability *Ability) *map[string]interface{} {
	ret := map[string]interface{}{
		"success":  false,
		"errmsg":   "ping failure",
		"protocol": "SNMP",
	}

	_, ping_err := FastPing(hostname, templ.Timeout)
	if ping_err != 0 {
		return &ret
	}

	snmp, err := SnmpGetConnect(hostname, templ)
	defer snmp.Close()
	if err != nil {
		ret["errmsg"] = err.Error()
		return &ret
	}

	if len(ability.Oids_Str) == 0 {
		ret["errmsg"] = "not any oid specified"
		return &ret
	}

	// log.Printf("in SnmpGet %s for ability %s, oid prepared:%s ", hostname, ability.Name, ability.Oids_Str)

	oids, _ := snmpgo.NewOids(ability.Oids_Str)
	pdu, err := snmp.GetRequest(oids)
	if err != nil {
		ret["errmsg"] = err.Error()
		return &ret
	}
	if pdu.ErrorStatus() != snmpgo.NoError {
		ret["errmsg"] = "Received an error from the agent"
		return &ret
	}

	log.Printf("successfully read ability: %s from device %s", ability.Name, hostname)

	pvbs := pdu.VarBinds()
	oids_value := make([]interface{}, 0, len(ability.Oids_Str))
	for _, oidstr := range ability.Oids_Str {
		for _, pvb := range pvbs {
			if oidstr == pvb.Oid.String() {
				oids_value = append(oids_value, map[string]string{oidstr: pvb.Variable.String()})
				break
			}
		}
	}

	ret["success"] = true
	ret["errmsg"] = "no error"
	ret["oids_value"] = oids_value
	return &ret
}
