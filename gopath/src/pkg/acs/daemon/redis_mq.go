package daemon

import (
	"bufio"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/adjust/redis"
)

type RedisConn struct {
	redis *redis.Client
}

func (r *RedisConn) ConnectToRemote(host, port string) error {
	log.Printf("Connect to redis server %s:%s\n", host, port)
	r.redis = redis.NewTCPClient(&redis.Options{
		Addr:     host + ":" + port,
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	if pong, err := r.redis.Ping().Result(); err != nil || pong != "PONG" {
		r.redis = nil
		log.Println(err.Error())
		return err
	}
	return nil
}

func (r *RedisConn) ConnectToLocal() error {
	log.Println("Connect to local redis server")
	r.redis = redis.NewTCPClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	if pong, err := r.redis.Ping().Result(); err != nil || pong != "PONG" {
		r.redis = nil
		log.Println(err.Error())
		return err
	}
	return nil
}

func (r *RedisConn) Push(msg string) error {
	if r.redis != nil {
		if err := r.redis.RPush("dbupdate", msg).Err(); err != nil {
			return err
		}
		log.Printf("Push: `%s`\n", msg)
	} else {
		log.Printf("Push() failed, No connect to Redis server!\n")
	}
	return nil
}

func (r *RedisConn) PushRaw(title, msg string) error {
	if r.redis != nil {
		if err := r.redis.RPush(title, msg).Err(); err != nil {
			return err
		}
		log.Printf("Push: `%s`\n", msg)
	} else {
		log.Printf("Push() failed, No connect to Redis server!\n")
	}
	return nil
}

func readLines(path string) ([]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines, scanner.Err()
}

func InformMessage(cpe *CPE, changed *map[string]string) {
	pack := make(map[string]interface{})

	pack["Command"] = "inform"
	pack["time"] = time.Now().Unix()
	pack["Inform"] = cpe
	pack["Values"] = changed

	x, _ := json.MarshalIndent(&pack, "", "    ")
	rediscli.Push(string(x))
}

func PushUpdateMessage(SerialNumber string, changed *map[string]string) {

	if len(*changed) == 0 {
		return
	}

	pack := make(map[string]interface{})

	pack["Command"] = "update"
	pack["SerialNumber"] = SerialNumber
	pack["time"] = time.Now().Unix()
	pack["Values"] = changed

	x, _ := json.MarshalIndent(&pack, "", "    ")
	rediscli.Push(string(x))
}

func PushHeartBeatMessage(cpe_sn, addr string) {
	pack := map[string]interface{}{
		"Command":      "heartbeat",
		"SerialNumber": cpe_sn,
		"time":         time.Now().Unix(),
		"Values":       addr,
	}
	x, _ := json.MarshalIndent(&pack, "", "    ")
	rediscli.Push(string(x))
}

func PushPollingStatusAllMessage() {
	pack := map[string]interface{}{
		"Command": "polling_status_all",
		"time":    time.Now().Unix(),
	}
	x, _ := json.MarshalIndent(&pack, "", "    ")
	rediscli.Push(string(x))
}
