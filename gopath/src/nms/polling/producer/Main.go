package producer

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

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

	GLB_sql   *api.DbInterface
	GLB_redis *redis.Client
	GLB_task  *Service
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

}

func ListenAndServeBatch(port *int) {

	// 读配置文件
	loadConfig("polling.conf")

	// 设置url路由
	route := InitUrlRoute()
	http.Handle("/", route)

	// go pollingLoop()
	GLB_task = NewService()

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
	// forever := make(chan bool)
	// <-forever
}

func Test() {

	fmt.Println("test...")
}