package consumer

import (
	"log"
)

func PollingAbilitiesSwitch(p *PollingTask) *map[string]interface{} {

	//used for ability.CallType: extend
	templateCache := make(map[string]*TemplateConfig)
	for _, template := range p.PollingTemplates {
		templateCache[template.Type] = &template.Config
	}

	// 保存轮询结果的map
	pResults := map[string]interface{}{}

	for _, ability := range p.NodeAbilities {

		switch ability.CallType {
			case "static":
				switch ability.Name {
					case "icmpPing":
						pResults[ability.Name] = IcmpPing(p)
					case "snmpPing":
						pResults[ability.Name] = SnmpPing(p)
					case "snmpMib2System":
						pResults[ability.Name] = SnmpMib2System(p)
					case "snmpMib2InterfaceState":
						pResults[ability.Name] = SnmpMib2InterfaceState(p)

					default:
						log.Printf(" no support ability:%s \n", ability.Name)
				}

			case "extend":
				switch ability.Protocol {
					case "SNMP":
						pResults[ability.Name] = SnmpGet(p.Hostname, templateCache[ability.Protocol], &ability)
					default:
						log.Printf(" no support ability:%s \n", ability.Name)
				}

			case "dynamic":
				switch ability.Protocol {
					case "SNMP":
						pResults[ability.Name] = SnmpGetListArbitrary(p.Hostname, templateCache[ability.Protocol], &ability)
					default:
						log.Printf(" no support ability:%s \n", ability.Name)
				}

			case "rest":
				log.Println("no support call_type:", ability.CallType)

			default:
				log.Println("no support call_type:", ability.CallType)
		}
	}
	return &pResults
}
