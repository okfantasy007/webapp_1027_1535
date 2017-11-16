package consumer

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Printf("%s: %s", msg, err)
	}
}

func consumerMessage(amqp_host, amqp_port string) {
	// log.Println("consumer!!!!!!")
	amqpurl := fmt.Sprintf("amqp://guest:guest@%s:%s/", amqp_host, amqp_port)
	conn, err := amqp.Dial(amqpurl)
	failOnError(err, "Failed to connect to RabbitMQ: "+amqpurl)
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"hello", // name
		false,   // durable
		false,   // delete when usused
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)
	go func() {
		for d := range msgs {

			log.Printf("Received a message: %s", d.Body)
			obj := PollingTask{}
			json.Unmarshal(d.Body, &obj)
			log.Println(obj)
			go AmqpCoroutinePolling(&obj)

		}
	}()
	<-forever
}

func AmqpCoroutinePolling(p *PollingTask) {
	// 计时开始
	startTime := time.Now()
	fmt.Println("################## start ###################",
		time.Now().Format("2006-01-02 15:04:05"))

	fmt.Println(p.Hostname)
	// node := (*p)

	// // 按节点能力处理轮询
	// polling_results := abilitiesSwitch(p)

	// // 计时结束
	durationTime := time.Now().UTC().Sub(startTime.UTC()).Seconds()
	// (*polling_results)["startTime"] = startTime
	// (*polling_results)["finishTime"] = time.Now()
	// (*polling_results)["durationTime"] = durationTime

	// jsonObj, _ := json.Marshal(polling_results)

	// // 打印调试信息
	// x, _ := json.MarshalIndent(&polling_results, "", "    ")
	// log.Println("polling_results:", node["Hostname"].(string), string(x))

	// if _, ok := node["PollType"]; ok && node["PollType"].(string) == "discovery" {
	// 	// 发现设备处理
	// 	log.Println("########### discovery ###########")
	// 	discovery_process(p, polling_results)
	// } else {
	// 	// 保存轮询结果
	// 	exesql := fmt.Sprintf(`
	// 	UPDATE res_node
	// 	   SET last_polling_time = '%s',
	// 	   	   last_polling_duration = %f,
	// 	   	   polling_results = '%s'
	// 	 WHERE id = %d`,
	// 		startTime.Format("2006-01-02 15:04:05"),
	// 		durationTime,
	// 		string(jsonObj),
	// 		int64(node["Id"].(float64)),
	// 	)
	// 	log.Println("SQL:", exesql)
	// 	RowsAffected, err := GLB_sql.Exec(exesql)
	// 	if RowsAffected == 1 {
	// 		log.Println("RowsAffected=", RowsAffected, err)
	// 	}
	// }

	fmt.Println("################## finish ##################", durationTime)
}
