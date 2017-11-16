package consumer

import (
	"fmt"
	"log"
	// "strconv"
	"encoding/json"
	// "time"
)

func sysoid2netype(oid string) (int, string) {
	var id int = 2
	var netype string = "general_snmp"
	// sql := fmt.Sprintf(`
	// 	SELECT nnm.rcnetype.id,
	// 	       nnm.rcnetype.NETYPE_DISPLAY_NAME AS name
	// 	  FROM nnm.rcnetype
	// 	 WHERE nnm.rcnetype.oid like '%%%s%%'`,
	// 	oid,
	// )
	sql := fmt.Sprintf(`
		SELECT res_node_type.id,
		       res_node_type.name
		  FROM res_node_type
		 WHERE res_node_type.sysoid like '%%%s%%'`,
		oid,
	)
	log.Println(sql)
	if rows, err := GLB_sql.Query(sql); err == nil {
		for rows.Next() {
			rows.Scan(&id, &netype)
			break
		}
		rows.Close()
	}
	return id, netype
}

func discovery_process(p_node, p_results *map[string]interface{}) {
	node := (*p_node)
	results := (*p_results)
	snmp := node["Poll_template_config"].(map[string]interface{})["snmp"].(map[string]interface{})
	snmp_template := int64(snmp["id"].(float64))
	snmp_port := int64(snmp["port"].(float64))
	snmp_version := snmp["version"].(string)
	discovery_task_id := int64(node["discovery_task_id"].(float64))
	startTime := results["startTime"]
	finishTime := results["finishTime"]
	durationTime := results["durationTime"]
	sysoid := ""
	ne_type_id := 1
	ne_type_name := "general_icmp"
	discovery_status := "skipped"

	is_ping_ok := false
	if status, exist := results["icmpPing"].(map[string]interface{})["ping_ok"].(bool); exist {
		is_ping_ok = status
	}

	is_snmp_ok := false
	if status, exist := results["snmpMib2System"].(map[string]interface{})["success"].(bool); exist {
		is_snmp_ok = status
		// 从轮询结果中获取sysoid
		if VarBinds, exist := results["snmpMib2System"].(map[string]interface{})["VarBinds"]; exist {
			for _, vb := range VarBinds.([]interface{}) {
				oid := vb.(map[string]interface{})["Oid"].(string)
				if oid == "1.3.6.1.2.1.1.2.0" {
					sysoid = vb.(map[string]interface{})["Variable"].(map[string]interface{})["Value"].(string)
					break
				}
			}
		}
		//
		ne_type_id, ne_type_name = sysoid2netype(sysoid)
		if sysoid == "" {
			is_snmp_ok = false
		}
	}

	if is_snmp_ok {
		exesql := fmt.Sprintf(`
		INSERT INTO res_node (
			id,
			hostname, 
			ip_address, 
			type, 
			poll_enabled, 
			poll_interval, 
			poll_template, 
			last_polling_time, 
			last_polling_duration, 
			json, 
			polling_results) 
		VALUES (NULL, '%s', '%s', '%d', '1', '300', '%d', CURRENT_TIMESTAMP, NULL, NULL, NULL)`,
			node["Hostname"].(string),
			node["Hostname"].(string),
			ne_type_id,
			snmp_template,
		)
		log.Println("SQL:", exesql)

		if RowsAffected, err := GLB_sql.Exec(exesql); RowsAffected == 1 && err == nil {
			discovery_status = "success"
		} else {
			discovery_status = "exist"
		}
	}

	exesql := fmt.Sprintf(`
		INSERT INTO res_discovery_report (
			id,
			discovery_task,
			ip_address,
			snmp_template,
			port,
			protocol,
			device_model,
			action_status,
			action_description)
		VALUES (NULL, %d, '%s', %d, %d, 'SNMP%s', %d, '%d', '%s')`,

		discovery_task_id,
		node["Hostname"].(string),
		snmp_template,
		snmp_port,
		snmp_version,
		1,
		1,
		discovery_status,
	)
	log.Println("SQL:", exesql)

	if RowsAffected, err := GLB_sql.Exec(exesql); err == nil {
		log.Println("RowsAffected=", RowsAffected, err)
	}

	var ip_numbers, finish_ip_numbers int64
	sql := fmt.Sprintf(`
		SELECT ip_numbers 
		  FROM res_discovery_task
		 WHERE id=%d`,
		discovery_task_id,
	)
	log.Println(sql)
	if rows, err := GLB_sql.Query(sql); err == nil {
		for rows.Next() {
			rows.Scan(&ip_numbers)
		}
		rows.Close()
	}
	log.Println(ip_numbers)

	sql = fmt.Sprintf(`
	    SELECT COUNT(*) AS count 
	      FROM res_discovery_report 
	     WHERE discovery_task=%d`,
		discovery_task_id,
	)
	log.Println(sql)
	if rows, err := GLB_sql.Query(sql); err == nil {
		for rows.Next() {
			rows.Scan(&finish_ip_numbers)
		}
		rows.Close()
	}
	log.Println(finish_ip_numbers)

	if finish_ip_numbers == ip_numbers {
		exesql := fmt.Sprintf(`
			UPDATE res_discovery_task
			   SET task_status = 'scaned' 
			 WHERE id=%d`,
			discovery_task_id,
		)
		log.Println("SQL:", exesql)
		GLB_sql.Exec(exesql)
	}

	pack := map[string]interface{}{
		"task_id": node["discovery_task_id"],
		"percent": fmt.Sprintf("%d/%d (%1.f%%)",
			finish_ip_numbers,
			ip_numbers,
			float64(finish_ip_numbers)/float64(ip_numbers)*100.0,
		),
		"task_finish":  finish_ip_numbers == ip_numbers,
		"ip_address":   node["Hostname"],
		"port":         snmp_port,
		"protocol":     fmt.Sprintf("SNMP%s", snmp_version),
		"startTime":    startTime,
		"finishTime":   finishTime,
		"durationTime": durationTime,
		"sysoid":       sysoid,
		"is_ping_ok":   is_ping_ok,
		"is_snmp_ok":   is_snmp_ok,
		"ne_type_name": ne_type_name,
		"ne_type_id":   ne_type_id,
		"status":       discovery_status,
	}
	x, _ := json.MarshalIndent(&pack, "", "  ")

	GLB_mqtt.Publish("discovery_update", string(x))

}
