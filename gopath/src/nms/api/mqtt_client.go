package api

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"
)

//define a function for the default message handler
var message_handler MQTT.MessageHandler = func(client MQTT.Client, msg MQTT.Message) {
	log.Printf("MQTT TOPIC: %s\n", msg.Topic())
	log.Printf("MQTT MSG: %s\n", msg.Payload())
}

func RandomString(strlen int) string {
	rand.Seed(time.Now().UTC().UnixNano())
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, strlen)
	for i := 0; i < strlen; i++ {
		result[i] = chars[rand.Intn(len(chars))]
	}
	return string(result)
}

type MqttClient struct {
	c           MQTT.Client
	isConnected bool
	ClientId    string
}

func (m *MqttClient) Connect(brokerUrl string, f MQTT.MessageHandler) error {
	m.ClientId = RandomString(32)
	opts := MQTT.NewClientOptions().AddBroker(brokerUrl)
	opts.SetClientID(m.ClientId)
	opts.SetDefaultPublishHandler(f)
	//create and start a client using the above ClientOptions
	m.c = MQTT.NewClient(opts)
	if token := m.c.Connect(); token.Wait() && token.Error() != nil {
		log.Println(token.Error())
		m.isConnected = false
		return token.Error()
	}
	m.isConnected = true
	return nil
}

func (m *MqttClient) Disconnect() {
	if m.isConnected {
		m.c.Disconnect(250)
	}
}

func (m *MqttClient) Publish(title, payload string) error {
	if m.isConnected {
		token := m.c.Publish(title, 0, false, payload)
		token.Wait()
		return nil
	} else {
		return fmt.Errorf("Publish error: no connet to a broker!")
	}
}

func (m *MqttClient) Subscribe(topic string) error {
	//subscribe to the topic
	if token := m.c.Subscribe(topic, 0, nil); token.Wait() && token.Error() != nil {
		log.Println(token.Error())
		return token.Error()
	}
	return nil
}

func (m *MqttClient) Unsubscribe(topic string) error {
	//unsubscribe from topic
	if token := m.c.Unsubscribe(topic); token.Wait() && token.Error() != nil {
		log.Println(token.Error())
		return token.Error()
	}
	return nil
}

func PublishLocalOnce(topic, payload string) {
	mq := MqttClient{}
	err := mq.Connect("tcp://127.0.0.1:1883", message_handler)
	if err == nil {
		mq.Publish(topic, payload)
		log.Printf("publish %s:%s success\n", topic, payload)
	} else {
		log.Println(err.Error())
	}
	mq.Disconnect()

}

func TestMain() {
	mq := MqttClient{}
	err := mq.Connect("tcp://127.0.0.1:1883", message_handler)
	mq.Subscribe("nnm/update")
	if err == nil {
		mq.Publish("nnm/dbupdate", "devices")
		log.Printf("Client '%s' publish success\n", mq.ClientId)
	} else {
		err = mq.Publish("nnm/dbupdate", "devices")
		log.Println(err.Error())
	}
	mq.Disconnect()
}
