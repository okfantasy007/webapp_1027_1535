package daemon

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/adjust/redis"
	"github.com/alyu/configparser"
	MQTT "github.com/eclipse/paho.mqtt.golang"

	"pkg/api"
)

var (
	ticker      = time.NewTicker(time.Second * 10)
	g_mqtt      api.MqttClient
	task_dbconn *DbInterface
	client      *redis.Client

	cpe_heartbeat_limit = 300

	task_redis_host = "127.0.0.1"
	task_redis_port = "6379"

	sql_host   = "127.0.0.1"
	sql_port   = "3306"
	sql_user   = "root"
	sql_pass   = "rootpass"
	sql_dbname = "wifiapp"

	mqtt_host = "127.0.0.1"
	mqtt_port = "1883"

	keep_log_days = 30
)

var mqtt_msg_callback MQTT.MessageHandler = func(mqtt_client MQTT.Client, msg MQTT.Message) {
	log.Printf("TOPIC: %s\n", msg.Topic())
	log.Printf("MSG: %s\n", msg.Payload())

	if msg.Topic() == "nnm/sync_alarm_status" {
		pack := map[string]interface{}{
			"Command": "polling_status_all",
			"time":    time.Now().Unix(),
		}
		x, _ := json.MarshalIndent(&pack, "", "    ")
		client.LPush("dbupdate", string(x))
	}
}

func syncAlarmStatus() {

	log.Printf("\n====  SyncAlarmStatus all devices ==== %v \n", time.Now())

	// 获取所有组并存入map
	sql := fmt.Sprintf(`SELECT id,parent,status FROM tree_nodes`)
	// log.Println(sql)
	nodes := map[int]*TreeNode{}
	if rows, err := task_dbconn.Query(sql); err == nil {
		for rows.Next() {
			var n TreeNode
			rows.Scan(&n.Id, &n.Parent, &n.Status)
			n.Status = 0
			nodes[n.Id] = &n
			// log.Println(n)
		}
		rows.Close()
	}

	// 获取所有包含设备的组,并通过设备确定组状态
	sql = fmt.Sprintf(`SELECT id,parent,status FROM devices`)
	// log.Println(sql)
	if rows, err := task_dbconn.Query(sql); err == nil {
		for rows.Next() {
			var id, parent, status int
			rows.Scan(&id, &parent, &status)
			if node, exist := nodes[parent]; exist {
				if status > node.Status {
					node.Status = status
				}
			}
		}
		rows.Close()
	}

	SyncTreeStatus(&nodes)

	var totalAffected int64 = 0
	for id, node := range nodes {
		log.Println("---after--->", id, node)
		sql := fmt.Sprintf(`
			UPDATE tree_nodes SET status=%d 
			 WHERE id=%d AND status<>%d`,
			node.Status,
			node.Id,
			node.Status,
		)
		// log.Println(sql)
		RowsAffected, _ := task_dbconn.Exec(sql)
		totalAffected += RowsAffected
	}

	if totalAffected > 0 {
		g_mqtt.Publish("nnm/dbupdate", "devices,tree_nodes")
	}
}

func periodicCleanLog() {
	log.Printf("\n====  Clean logs ==== %v \n", time.Now())

	sql := fmt.Sprintf(`
		DELETE FROM syslog WHERE DATEDIFF(now(), date) > %d;`,
		keep_log_days,
	)
	// log.Println("SQL:", exesql)
	RowsAffected, _ := task_dbconn.Exec(sql)
	log.Println("RowsAffected:", RowsAffected)
}

func pollingTimer(r *redis.Client) {
	for _ = range ticker.C {
		log.Printf("\n==== Start polling all devices ==== %v \n", time.Now())

		pack := map[string]interface{}{
			"Command": "polling_status_all",
			"time":    time.Now().Unix(),
		}
		x, _ := json.MarshalIndent(&pack, "", "    ")
		r.LPush("dbupdate", string(x))
		// log.Println(string(x))
	}
}

func updateValues(j *map[string]interface{}) {
	vals := (*j)["Values"].(map[string]interface{})
	sn := (*j)["SerialNumber"].(string)
	task_dbconn.UpdateDeviceJson(sn, &vals)
	// x, _ := json.MarshalIndent(&vals, "", "    ")
	// log.Println("#####js text######", string(x))
}

func informUpdate(j *map[string]interface{}) {
	var (
		jsonstr      string
		cpe_is_exist bool = false
	)

	inform := (*j)["Inform"].(map[string]interface{})
	vals := (*j)["Values"].(map[string]interface{})
	devJson := make(map[string]interface{})

	// 通过sn查找cpe
	sql := fmt.Sprintf(`
		SELECT json 
		  FROM devices
		 WHERE SerialNumber='%s'`,
		inform["SerialNumber"].(string),
	)
	// log.Println(sql)
	if rows, err := task_dbconn.Query(sql); err == nil {
		for rows.Next() {
			rows.Scan(&jsonstr)
			cpe_is_exist = true
			if err := json.Unmarshal([]byte(jsonstr), &devJson); err != nil {
				log.Println(err.Error())
				return
			}
		}
		rows.Close()
	}
	for k, v := range vals {
		// log.Println("k,v: ", k, v)
		devJson[k] = v
	}
	jsonBytes, _ := json.Marshal(devJson)

	devicename := inform["ExternalIPAddress"].(string)
	use_stun := false
	if cpe_url, exist := inform["ConnectionRequestURL"]; exist {
		if urlall, err := url.Parse(cpe_url.(string)); err == nil {
			cpe_host := strings.Split(urlall.Host, ":")[0]
			cpe_port := strings.Split(urlall.Host, ":")[1]
			if cpe_host != devicename {
				devicename = fmt.Sprintf("%s,%s", devicename, cpe_host)
				use_stun = true
			} else if cpe_port != "7547" {
				devicename = fmt.Sprintf("%s:%s,%s", devicename, cpe_port, urlall.Path)
			} else if strings.Contains(urlall.Path, "cpe/") {
				devicename = fmt.Sprintf("%s,%s", devicename, urlall.Path)
			}
		}
	}

	exesql := ""
	if !cpe_is_exist {

		exesql = fmt.Sprintf(`
			INSERT INTO devices (
				id ,
				parent ,
				SerialNumber ,
				OUI ,
				Manufacturer ,
				ModelName ,
				ExternalIPAddress ,
				ServerAddrPort ,
				UseStun ,
				json ,
				LastConnection ,
				DeviceName
				)
			VALUES (
				NULL,
				'1',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				'%s',
				%t,
				'%s',
				FROM_UNIXTIME(%1.1f),
				'%s'
			)`,
			inform["SerialNumber"],
			inform["OUI"],
			inform["Manufacturer"],
			inform["ModelName"],
			inform["ExternalIPAddress"],
			inform["ServerAddrPort"],
			use_stun,
			string(jsonBytes),
			inform["LastConnection"].(float64),
			devicename,
		)

	} else {

		exesql = fmt.Sprintf(`
			UPDATE devices 
			   SET OUI = '%s',
			       Manufacturer = '%s',
			       ModelName = '%s',
			       ExternalIPAddress = '%s',
			       ServerAddrPort = '%s',
			       UseStun = %t,
			       LastConnection = FROM_UNIXTIME(%1.1f),
			       json = '%s'
			 WHERE devices.SerialNumber = '%s'`,

			inform["OUI"],
			inform["Manufacturer"],
			inform["ModelName"],
			inform["ExternalIPAddress"],
			inform["ServerAddrPort"],
			use_stun,
			inform["LastConnection"].(float64),
			string(jsonBytes),
			inform["SerialNumber"],
		)

	}

	log.Println("SQL:", exesql)
	task_dbconn.Exec(exesql)
}

func DatabaseSyncLoop() {
	for {

		llen, _ := client.LLen("dbupdate").Result()
		if llen == 0 {
			// log.Println("no date, sleep 1 second and continue")
			// fmt.Printf(".")
			time.Sleep(time.Second)
			continue
		}

		log.Println("Queue LEN: ", llen)
		result, err := client.LPop("dbupdate").Result()
		if err != nil {
			log.Println("Error when pop from queue!, sleep 1 second and continue")
			time.Sleep(time.Second)
			continue
		}
		log.Println(result, err)

		var j map[string]interface{}
		json.Unmarshal([]byte(result), &j)

		switch j["Command"].(string) {
		case "inform":
			informUpdate(&j)

		case "update":
			updateValues(&j)

		case "heartbeat":
			x, _ := json.MarshalIndent(&j, "", "    ")
			log.Println("##### heartbeat ####", string(x))
			updatetime := j["time"].(float64)
			exesql := fmt.Sprintf(`
				UPDATE devices 
				   SET LastConnection = FROM_UNIXTIME(%1.1f)
				 WHERE devices.SerialNumber = '%s'`,
				updatetime,
				j["SerialNumber"].(string),
			)
			log.Println("SQL:", exesql)
			task_dbconn.Exec(exesql)

			exesql = fmt.Sprintf(`
				UPDATE devices 
				   SET status = 1
				 WHERE devices.SerialNumber = '%s'`,
				j["SerialNumber"].(string),
			)
			log.Println("SQL:", exesql)
			RowsAffected, _ := task_dbconn.Exec(exesql)
			if RowsAffected == 1 {
				log.Println("^^^^^^^^^^^^^ Device", j["SerialNumber"].(string), "up")
				task_dbconn.LogDevice(
					j["SerialNumber"].(string),
					"online",
					0,
					fmt.Sprintf("设备 %s(%s) 上线!",
						j["Values"].(string), j["SerialNumber"].(string)),
				)
			}

		case "polling_status_all":
			x, _ := json.MarshalIndent(&j, "", "    ")
			log.Println("##### polling_status_all ####", string(x))
			devs := task_dbconn.OfflineDevicesUpdate(cpe_heartbeat_limit)
			for _, p := range *devs {
				log.Printf("VVVVVVVVVVVV Device %s(%s) Down", p.Ip, p.Sn)
				task_dbconn.LogDevice(
					p.Sn,
					"offline",
					int64(p.OnlineTime),
					fmt.Sprintf("设备 %s(%s) 离线!", p.Ip, p.Sn),
				)
			}
			syncAlarmStatus()
			periodicCleanLog()

		case "setcache":
			SetCache()

		default:
			log.Println("Unkonwm Command", j["Command"])
		}

	} // for read from redis

}

func dbsync_init_all(cfg_file string) error {

	dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	cfg := filepath.Join(dir, cfg_file)
	log.Printf("Load config file: %s\n", cfg)

	config, err := configparser.Read(cfg)
	if err != nil {
		log.Fatal(err.Error())
	}
	// log.Println(config)

	if section, err := config.Section("ACS"); err == nil {
		log.Println(section)
		cpe_heartbeat_limit, _ = strconv.Atoi(section.Options()["CPE_HEARTBEAT_LIMIT"])
		keep_log_days, _ = strconv.Atoi(section.Options()["KEEP_LOG_DAYS"])

		if v, exist := section.Options()["SILENT_MODE"]; exist {
			if v == "yes" {
				log.SetOutput(ioutil.Discard)
			}
		}
	}

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
		task_redis_host = section.Options()["HOST"]
		task_redis_port = section.Options()["PORT"]
	}

	if section, err := config.Section("ACTIVEMQ"); err == nil {
		log.Println(section)
		mqtt_host = section.Options()["MQTT_SERVER"]
		mqtt_port = section.Options()["MQTT_PORT"]
	}

	client = redis.NewTCPClient(&redis.Options{
		Addr:     task_redis_host + ":" + task_redis_port,
		Password: "", // no password set
		DB:       0,  // 0: use default DB
	})
	if pong, err := client.Ping().Result(); err != nil || pong != "PONG" {
		log.Println(err.Error())
	}

	task_dbconn = new(DbInterface)
	task_dbconn.ConnectToRemote(sql_host, sql_port, sql_user, sql_pass, sql_dbname)

	g_mqtt.Connect(fmt.Sprintf("tcp://%s:%s", mqtt_host, mqtt_port), mqtt_msg_callback)
	g_mqtt.Subscribe("nnm/sync_alarm_status")

	return nil
}

func TaskMain(cfg_file string) {
	dbsync_init_all(cfg_file)
	go pollingTimer(client)
	DatabaseSyncLoop()
}
