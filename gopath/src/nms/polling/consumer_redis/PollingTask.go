package consumer

import (
	"fmt"
	"log"
	// "strconv"
	"encoding/json"
	"time"
)

func coroutinePolling(p *map[string]interface{}) {
	// 计时开始
	startTime := time.Now()
	fmt.Println("################## start ###################",
		time.Now().Format("2006-01-02 15:04:05"))

	node := (*p)

	// 按节点能力处理轮询
	polling_results := abilitiesSwitch(p)

	// 计时结束
	durationTime := time.Now().UTC().Sub(startTime.UTC()).Seconds()
	(*polling_results)["startTime"] = startTime
	(*polling_results)["finishTime"] = time.Now()
	(*polling_results)["durationTime"] = durationTime

	jsonObj, _ := json.Marshal(polling_results)

	// 打印调试信息
	x, _ := json.MarshalIndent(&polling_results, "", "    ")
	log.Println("polling_results:", node["Hostname"].(string), string(x))

	if _, ok := node["PollType"]; ok && node["PollType"].(string) == "discovery" {
		// 发现设备处理
		log.Println("########### discovery ###########")
		discovery_process(p, polling_results)
	} else {
		// 保存轮询结果
		exesql := fmt.Sprintf(`
		UPDATE res_node
		   SET last_polling_time = '%s',
		   	   last_polling_duration = %f,
		   	   polling_results = '%s'
		 WHERE id = %d`,
			startTime.Format("2006-01-02 15:04:05"),
			durationTime,
			string(jsonObj),
			int64(node["Id"].(float64)),
		)
		log.Println("SQL:", exesql)
		RowsAffected, err := GLB_sql.Exec(exesql)
		if RowsAffected == 1 {
			log.Println("RowsAffected=", RowsAffected, err)
		}
	}

	fmt.Println("################## finish ##################", durationTime)
}

func pollingLoop() {

	log.Println("=============== Start polling loop ==============")
	for {

		llen, _ := GLB_redis.LLen("polling_task").Result()
		if llen == 0 {
			// log.Println("no date, sleep 1 second and continue")
			fmt.Printf(".")
			time.Sleep(time.Second)
			continue
		}

		log.Println("Queue LEN: ", llen)
		result, err := GLB_redis.LPop("polling_task").Result()
		if err != nil {
			log.Println("Error when pop from queue!, sleep 1 second and continue")
			time.Sleep(time.Second)
			continue
		}
		log.Println(result, err)

		var j map[string]interface{}
		json.Unmarshal([]byte(result), &j)

		// log.Println(j)

		go coroutinePolling(&j)

	} // for read from redis

}
