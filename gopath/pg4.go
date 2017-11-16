package main

import (
	"fmt"
	"log"
	// "os"
	"strconv"
	"time"

	g "github.com/soniah/gosnmp"
)

func main() {

	// get Target and Port from environment
	envTarget := "172.16.75.95"
	envPort := "161"
	if len(envTarget) <= 0 {
		log.Fatalf("environment variable not set: GOSNMP_TARGET")
	}
	if len(envPort) <= 0 {
		log.Fatalf("environment variable not set: GOSNMP_PORT")
	}
	port, _ := strconv.ParseUint(envPort, 10, 16)

	// Build our own GoSNMP struct, rather than using g.Default.
	// Do verbose logging of packets.
	snmp := &g.GoSNMP{
		Target:    envTarget,
		Port:      uint16(port),
		Community: "public",
		Version:   g.Version2c,
		// Version: g.Version3,
		// Version: g.Version1,
		Timeout: time.Duration(2) * time.Second,
		// Logger:  log.New(os.Stdout, "", 0),
	}
	err := snmp.Connect()
	if err != nil {
		log.Fatalf("Connect() err: %v", err)
	}
	defer snmp.Conn.Close()

	// oids := []string{"1.3.6.1.2.1.1.3.0", "1.3.6.1.2.1.1.5.0"}
	// result, err2 := snmp.Get(oids) // Get() accepts up to g.MAX_OIDS
	result, err2 := snmp.Get([]string{"1.3.6.1.2.1.1.3.0"}) // Get() accepts up to g.MAX_OIDS
	if err2 != nil {
		log.Fatalf("Get() err: %v", err2)
	}

	for i, variable := range result.Variables {
		fmt.Printf("%d: oid: %s ", i, variable.Name)

		// the Value of each variable returned by Get() implements
		// interface{}. You could do a type switch...
		switch variable.Type {
		case g.OctetString:
			fmt.Printf("string: %s\n", string(variable.Value.([]byte)))
		default:
			// ... or often you're just interested in numeric values.
			// ToBigInt() will return the Value as a BigInt, for plugging
			// into your calculations.
			fmt.Printf("number: %d\n", g.ToBigInt(variable.Value))
		}
	}
}
