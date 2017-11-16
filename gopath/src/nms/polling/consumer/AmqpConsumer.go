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
	amqpurl := fmt.Sprintf("amqp://%s:%s@%s:%s/", amqp_user, amqp_pwd, amqp_host, amqp_port)
	conn, err := amqp.Dial(amqpurl)
	failOnError(err, "Failed to connect to RabbitMQ: "+amqpurl)
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"polling_task", // name
		false,          // durable
		false,          // delete when usused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
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
			obj := PollingTask{}
			json.Unmarshal(d.Body, &obj)
			log.Printf("Received a task at %s, PollType:%s, Hostname:%s, NeId:%d", 
				time.Now().Format("2006-01-02 15:04:05"), obj.PollType, obj.Hostname, obj.NeId)
			go AmqpCoroutinePolling(&obj, amqp_host, amqp_port)

		}
	}()
	<-forever
}
