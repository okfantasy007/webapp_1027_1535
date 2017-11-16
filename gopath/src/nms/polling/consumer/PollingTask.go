package consumer

import (
	"bytes"
	"encoding/json"
//	"errors"
	"fmt"
//	"io/ioutil"
	"log"
	"net/http"
	"time"
	"github.com/streadway/amqp"
)

// func coroutinePolling(p *map[string]interface{}) {
// 	// 计时开始
// 	startTime := time.Now()
// 	fmt.Println("################## start ###################",
// 		time.Now().Format("2006-01-02 15:04:05"))

// 	node := (*p)

// 	// 按节点能力处理轮询
// 	// polling_results := abilitiesSwitch(p)
// 	polling_results := map[string]interface{}{
// 		"s": 1,
// 	}

// 	// 计时结束
// 	durationTime := time.Now().UTC().Sub(startTime.UTC()).Seconds()
// 	(*polling_results)["startTime"] = startTime
// 	(*polling_results)["finishTime"] = time.Now()
// 	(*polling_results)["durationTime"] = durationTime

// 	jsonObj, _ := json.Marshal(polling_results)

// 	// 打印调试信息
// 	x, _ := json.MarshalIndent(&polling_results, "", "    ")
// 	log.Println("polling_results:", node["Hostname"].(string), string(x))

// 	if _, ok := node["PollType"]; ok && node["PollType"].(string) == "discovery" {
// 		// 发现设备处理
// 		log.Println("########### discovery ###########")
// 		discovery_process(p, polling_results)
// 	} else {
// 		// 保存轮询结果
// 		exesql := fmt.Sprintf(`
// 		UPDATE res_node
// 		   SET last_polling_time = '%s',
// 		   	   last_polling_duration = %f,
// 		   	   polling_results = '%s'
// 		 WHERE id = %d`,
// 			startTime.Format("2006-01-02 15:04:05"),
// 			durationTime,
// 			string(jsonObj),
// 			int64(node["Id"].(float64)),
// 		)
// 		log.Println("SQL:", exesql)
// 		RowsAffected, err := GLB_sql.Exec(exesql)
// 		if RowsAffected == 1 {
// 			log.Println("RowsAffected=", RowsAffected, err)
// 		}
// 	}

// 	fmt.Println("################## finish ##################", durationTime)
// }

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

		// go coroutinePolling(&j)

	} // for read from redis

}

func HttpPost(url string, payload []byte) {
	client := &http.Client{}
	request, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	request.Header.Set("Content-type", "application/json")
	response, _ := client.Do(request)
	if response != nil {
		defer response.Body.Close()
		// if response.StatusCode == 200 {
		// 	body, _ := ioutil.ReadAll(response.Body)
		// 	// fmt.Println(string(body))
		// 	return nil, body
		// } else {
		// 	return errors.New("bad http response"), []byte("")
		// }
	}
}

func AmqpCoroutinePolling(p *PollingTask, amqp_host, amqp_port string) {
	// 计时开始
	startTime := time.Now()
	// log.Printf("poll %s start at %s", p.Hostname, time.Now().Format("2006-01-02 15:04:05"))

	// 按节点能力处理轮询
	pResults := PollingAbilitiesSwitch(p)
	
	switch p.PollType {
		case "performance":
			// 性能轮询结果处理
			result := make(map[string]interface{})
			result["poll_type"] = p.PollType
			result["hostname"] = p.Hostname
			result["polling_templates"] = p.PollingTemplates
			
			for _, value := range *pResults {
				result["node_abilities"] = []interface{}{value}
				break
			}
			result["timestamp_req"] = p.Timestamp
			result["timestamp_res"] = time.Now().UTC().Unix()

			jsonBytes, _ := json.MarshalIndent(result, "", "    ")

			sendByMQ(jsonBytes, p.QueueName)
			// log.Println("###send performance result(mq)###", p.Hostname)

		default:
			result := make(map[string]interface{})
			result["node_abilities"] = pResults
			// // 计时结束
			durationTime := time.Now().UTC().Sub(startTime.UTC()).Seconds()
			result["startTime"] = startTime.Format("2006-01-02 15:04:05")
			result["finishTime"] = time.Now().Format("2006-01-02 15:04:05")
			result["durationTime"] = fmt.Sprintf("%1.4f", durationTime)
			result["task_id"] = p.DiscoveryTaskId
			result["hostname"] = p.Hostname
			result["neid"] = p.NeId
			result["dest_subnet_id"] = p.DestSubnetId
			jsonBytes, _ := json.MarshalIndent(result, "", "    ")
			// log.Println("pResults:", p.Hostname, string(jsonBytes))

			if p.QueueName == "" {
				HttpPost(p.RestUrl, jsonBytes)
				// log.Println("###send", p.PollType, "result(rest)###", p.Hostname)
			} else {
				sendByMQ(jsonBytes, p.QueueName)
				// log.Println("###send", p.PollType, "result(mq)###", p.Hostname)
			}
	}

	log.Printf("Finished a task at %s, PollType:%s, Hostname:%s, NeId:%d", 
				time.Now().Format("2006-01-02 15:04:05"), p.PollType, p.Hostname, p.NeId)
}

func sendByMQ(jsonBytes []byte, queueName string) bool {
	if queueName == "polling_task" {
		log.Println("error! pm collect result send queue name is the same with polling_task")
		return false
	}
	// amqpurl := fmt.Sprintf("amqp://guest:guest@%s:%s/", amqp_host, amqp_port)
	amqpurl := fmt.Sprintf("amqp://%s:%s@%s:%s/", amqp_user, amqp_pwd, amqp_host, amqp_port)
	// log.Printf("dialing %q", amqpurl)
	connection, err := amqp.Dial(amqpurl)
	if err != nil {
		log.Printf("Dial: %s", err)
		return false
	}
	defer connection.Close()

	// log.Printf("got Connection, getting Channel")
	channel, err := connection.Channel()
	if err != nil {
		log.Printf("Channel: %s", err)
		return false
	}

	channel.QueueDeclare(
		queueName, 		// name
		false,          // durable
		false,          // delete when usused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)

	log.Printf("got Channel, begin publish to queue %s", queueName)
	if err = channel.Publish(
		"",   // publish to an exchange
		queueName, // routing to 0 or more queues
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			Headers:         amqp.Table{},
			ContentType:     "text/plain",
			ContentEncoding: "",
			Body:            jsonBytes,
			DeliveryMode:    amqp.Transient, // 1=non-persistent, 2=persistent
			Priority:        0,              // 0-9
			// a bunch of application/implementation-specific fields
		},
	); err != nil {
		log.Printf("Exchange Publish: %s", err)
		return false
	}
	return true
}