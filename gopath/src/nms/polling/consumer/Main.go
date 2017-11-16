package consumer

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"encoding/json"
	"io/ioutil"
	// "strconv"
	// "time"

	"github.com/adjust/redis"
	"github.com/alyu/configparser"

	"nms/api"
)

var (
	redis_host = "127.0.0.1"
	redis_port = "6379"

	sql_host   = "127.0.0.1"
	sql_port   = "3306"
	sql_user   = "root"
	sql_pass   = "rootpass"
	sql_dbname = "wifiapp"

	mqtt_host = "127.0.0.1"
	mqtt_port = "1883"

	amqp_host = "127.0.0.1"
	amqp_port = "5672"
	amqp_user = "guest"
	amqp_pwd = "guest"

	GLB_sql   *api.DbInterface
	GLB_redis *redis.Client
	GLB_mqtt  api.MqttClient
)

func loadConfig(cfg_file string) {
	dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	cfg := filepath.Join(dir, cfg_file)
	log.Printf("Load config file: %s\n", cfg)

	config, err := configparser.Read(cfg)
	if err != nil {
		log.Fatal(err.Error())
	}
	// fmt.Println(config)

	if section, err := config.Section("DATABASE"); err == nil {
		log.Println(section)
		sql_host = section.Options()["HOST"]
		sql_port = section.Options()["PORT"]
		sql_user = section.Options()["USER"]
		sql_pass = section.Options()["PASSWD"]
		sql_dbname = section.Options()["NAME"]
	}

	if section, err := config.Section("REDIS"); err == nil {
		log.Println(section)
		redis_host = section.Options()["HOST"]
		redis_port = section.Options()["PORT"]
	}

	if section, err := config.Section("MQ"); err == nil {
		log.Println(section)
		mqtt_host = section.Options()["MQTT_SERVER"]
		mqtt_port = section.Options()["MQTT_PORT"]
		amqp_host = section.Options()["AMQP_SERVER"]
		amqp_port = section.Options()["AMQP_PORT"]
		amqp_user = section.Options()["AMQP_USER"]
		amqp_pwd = section.Options()["AMQP_PWD"]
	}

	GLB_redis = redis.NewTCPClient(&redis.Options{
		Addr:     redis_host + ":" + redis_port,
		Password: "", // no password set
		DB:       0,  // 0: use default DB
	})
	if pong, err := GLB_redis.Ping().Result(); err != nil || pong != "PONG" {
		log.Println(err.Error())
	}

	GLB_sql = new(api.DbInterface)
	GLB_sql.ConnectToRemote(sql_host, sql_port, sql_user, sql_pass, sql_dbname)

	// GLB_mqtt.Connect(fmt.Sprintf("tcp://%s:%s", mqtt_host, mqtt_port), mqtt_msg_callback)
	// GLB_mqtt.Subscribe("nnm/sync_alarm_status")

}

func loadSysGlobalConfig(cfgfile *string) {
	// dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	// cfgFileName := filepath.Join(dir, cfg_file)
	cfgFileName := *cfgfile
	log.Printf("Load config file: %s\n", cfgFileName)

	cb, err := ioutil.ReadFile(cfgFileName)
	if err != nil {
		amqp_host = "127.0.0.1"
		amqp_port = "5672"
		amqp_user = "admin"
		amqp_pwd = "admin"

		log.Fatalf("Unable to read config file '%s': %s", cfgFileName, err)
		return
	}

	cfg := SysGlobalConfig{}
	if err = json.Unmarshal(cb, &cfg); err != nil {
		log.Fatalf("Unable to parse JSON in config file '%s': %s", cfgFileName, err)
		return
	}

	amqp_host = cfg.MQ.IP
	amqp_port = fmt.Sprintf("%d", cfg.MQ.Port)
	amqp_user = cfg.MQ.User
	amqp_pwd = cfg.MQ.Pwd
}

func ListenAndServeBatch(port *int, cfgfile *string) {

	// 读配置文件
	// loadConfig("polling.conf")
	loadSysGlobalConfig(cfgfile)

	// 设置url路由
	route := InitUrlRoute()
	http.Handle("/", route)

	// send PERIODIC inform
	// go pollingLoop()

	go consumerMessage(amqp_host, amqp_port)

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}

func Test() {
	Convert()
}
