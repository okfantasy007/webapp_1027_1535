package main

import (
	"fmt"

	"github.com/k-sone/snmpgo"
)

func main() {
	snmp, err := snmpgo.NewSNMP(snmpgo.SNMPArguments{
		Version:   snmpgo.V2c,
		Address:   "172.16.75.95:161",
		Retries:   1,
		Community: "public",
	})
	if err != nil {
		// Failed to create snmpgo.SNMP object
		fmt.Println(err)
		return
	}

	oids, err := snmpgo.NewOids([]string{
		"1.3.6.1.2.1.2.2.1",
	})
	if err != nil {
		// Failed to parse Oids
		fmt.Println(err)
		return
	}

	if err = snmp.Open(); err != nil {
		// Failed to open connection
		fmt.Println(err)
		return
	}
	defer snmp.Close()

	pdu, err := snmp.GetBulkWalk(oids, 0, 2)
	if err != nil {
		fmt.Println(err)
	}

	// pdu, err := snmp.GetRequest(oids)
	// if err != nil {
	// 	// Failed to request
	// 	fmt.Println(err)
	// 	return
	// }
	if pdu.ErrorStatus() != snmpgo.NoError {
		// Received an error from the agent
		fmt.Println(pdu.ErrorStatus(), pdu.ErrorIndex())
	}

	// get VarBind list
	// fmt.Println(pdu.VarBinds())
	for i, vb := range pdu.VarBinds() {
		fmt.Println(i, "-->", vb)

	}

	// select a VarBind
	fmt.Println(pdu.VarBinds().MatchOid(oids[0]))
}
