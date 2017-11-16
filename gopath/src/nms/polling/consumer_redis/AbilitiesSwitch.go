package consumer

import (
	"log"
)

func abilitiesSwitch(p *map[string]interface{}) *map[string]interface{} {
	abilities := (*p)["Node_abilities"].([]interface{})

	// 保存轮询结果的map
	polling_results := map[string]interface{}{}

	for _, raw := range abilities {
		ability := raw.(map[string]interface{})
		ability_name := ability["name"].(string)

		switch ability["call_type"].(string) {
		case "static":

			switch ability_name {
			case "icmpPing":
				polling_results[ability_name] = do_icmpPing(p, &ability)
			case "snmpPing":
				polling_results[ability_name] = do_snmpPing(p, &polling_results)
			case "snmpMib2System":
				polling_results[ability_name] = do_snmpMib2System(p, &polling_results)
			case "snmpMib2InterfaceState":
				polling_results[ability_name] = do_snmpMib2InterfaceState(p, &polling_results)

			default:
				log.Printf("################## no support ability:%s ##################\n", ability["name"].(string))
			}

		case "config":
			log.Println("no support call_type:", ability["call_type"].(string))

		default:
			log.Println("no support call_type:", ability["call_type"].(string))

		}
		// log.Println(i, ability["name"].(string))
	}
	return &polling_results
}

func abilitiesSwitch(p *map[string]interface{}) *map[string]interface{} {
	abilities := (*p)["Node_abilities"].([]interface{})

	// 保存轮询结果的map
	polling_results := map[string]interface{}{}

	for _, raw := range abilities {
		ability := raw.(map[string]interface{})
		ability_name := ability["name"].(string)

		switch ability["call_type"].(string) {
		case "static":

			switch ability_name {
			case "icmpPing":
				polling_results[ability_name] = do_icmpPing(p, &ability)
			case "snmpPing":
				polling_results[ability_name] = do_snmpPing(p, &polling_results)
			case "snmpMib2System":
				polling_results[ability_name] = do_snmpMib2System(p, &polling_results)
			case "snmpMib2InterfaceState":
				polling_results[ability_name] = do_snmpMib2InterfaceState(p, &polling_results)

			default:
				log.Printf("################## no support ability:%s ##################\n", ability["name"].(string))
			}

		case "config":
			log.Println("no support call_type:", ability["call_type"].(string))

		default:
			log.Println("no support call_type:", ability["call_type"].(string))

		}
		// log.Println(i, ability["name"].(string))
	}
	return &polling_results
}
