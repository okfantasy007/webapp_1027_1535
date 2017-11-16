package daemon

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func SetCache() {
	// get cache info
	sql := fmt.Sprintf(`SELECT json FROM wifi_cache`)

	if rows, err := task_dbconn.Query(sql); err == nil {
		for rows.Next() {
			var str string
			rows.Scan(&str)

			params := []map[string]string{}
			errp := json.Unmarshal([]byte(str), &params)
			if errp != nil {
				return
			}

			payload := map[string]interface{}{
				"Command": "SetParameterValues",
				"Timeout": 10,
				"Names":   params,
			}
			log.Println(payload, rest_api_url)
			x, _ := json.Marshal(payload)

			devsql := fmt.Sprintf(`SELECT SerialNumber FROM devices`)
			if devrows, deverr := task_dbconn.Query(devsql); deverr == nil {
				for devrows.Next() {
					var devsn string
					devrows.Scan(&devsn)

					client := &http.Client{}
					r, _ := http.NewRequest("PUT", fmt.Sprintf("http://%s/rest/cpes/SetParameterValues/%s", rest_api_url, devsn), bytes.NewReader(x))
					r.Header.Set("Content-Type", "application/json; charset=UTF-8")
					resp, _ := client.Do(r)
					defer resp.Body.Close()
					log.Println(resp.Status)

					devrows.Close()
				}
			}
			rows.Close()
		}
	}
}
