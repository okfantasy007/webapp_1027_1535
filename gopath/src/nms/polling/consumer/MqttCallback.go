package consumer

import (
	// "fmt"
	"encoding/json"
	"log"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"
)

var mqtt_msg_callback MQTT.MessageHandler = func(mqtt_client MQTT.Client, msg MQTT.Message) {
	log.Printf("TOPIC: %s\n", msg.Topic())
	log.Printf("MSG: %s\n", msg.Payload())

	if msg.Topic() == "nnm/sync_alarm_status" {
		pack := map[string]interface{}{
			"Command": "polling_status_all",
			"time":    time.Now().Unix(),
		}
		x, _ := json.MarshalIndent(&pack, "", "  ")
		// client.LPush("dbupdate", string(x))
		log.Println(string(x))
	}
}
