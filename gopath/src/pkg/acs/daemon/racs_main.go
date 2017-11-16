package daemon

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/alyu/configparser"

	"pkg/task"
	"pkg/web/redistore"
)

var (
	global_cpes     CpeMap
	global_sessions SessionMap

	rediscli       *RedisConn
	getNames       *[]string
	store          *redistore.RediStore
	g_task_manager task.TaskManager

	acs_port          = 7547
	acs_host          = fmt.Sprintf("127.0.0.1:%d", acs_port)
	acs_auth_mode     = "None"
	acs_auth_user     = "raisecom"
	acs_auth_password = "raisecom123"
	acs_realm         = "RasecomACS"
	redis_host        = "127.0.0.1"
	redis_port        = "6379"
	rest_max_age      = 86400 * 7
	stun_enable       = false
	stun_port         = 3478

	rest_api_url = ""
)

func GetPollingNamesFromFile(cfg_file string) *[]string {
	var names []string
	dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	cfg := filepath.Join(dir, cfg_file)
	log.Printf("Load config file of polling name: %s\n", cfg)

	lines, err := readLines(cfg)
	if err != nil {
		log.Printf("readLines: %s", err)
		return &names
	}

	for _, line := range lines {
		// fmt.Println(line)
		nl := strings.TrimSpace(line)
		if !strings.HasPrefix(nl, "//") && len(nl) > 0 {
			fmt.Println(nl)
			names = append(names, nl)
		}
	}
	return &names
}

func racs_init_all(cfg_file string) error {
	dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	cfg := filepath.Join(dir, cfg_file)
	log.Printf("Load config file: %s\n", cfg)

	config, err := configparser.Read(cfg)
	if err != nil {
		log.Fatal(err.Error())
	}

	if section, err := config.Section("ACS"); err == nil {
		// log.Println(section)
		if v, exist := section.Options()["ACS_PORT"]; exist {
			acs_port, _ = strconv.Atoi(v)
		}
		if v, exist := section.Options()["AUTH_MODE"]; exist {
			acs_auth_mode = strings.ToUpper(v)
		}
		if v, exist := section.Options()["AUTH_USER"]; exist {
			acs_auth_user = v
		}
		if v, exist := section.Options()["AUTH_PASSWD"]; exist {
			acs_auth_password = v
		}
		if v, exist := section.Options()["STUN_PORT"]; exist {
			stun_port, _ = strconv.Atoi(v)
		}
		if v, exist := section.Options()["STUN_ENABLE"]; exist {
			stun_enable = v == "yes"
		}
		if v, exist := section.Options()["SILENT_MODE"]; exist {
			if v == "yes" {
				log.SetOutput(ioutil.Discard)
			}
		}
	}

	if section, err := config.Section("REST_API"); err == nil {
		// log.Println(section)
		if v, exist := section.Options()["LOGIN_MAX_AGE"]; exist {
			rest_max_age, _ = strconv.Atoi(v)
		}
	}

	if section, err := config.Section("REDIS"); err == nil {
		// log.Println(section)
		if v, exist := section.Options()["HOST"]; exist {
			redis_host = v
		}
		if v, exist := section.Options()["PORT"]; exist {
			redis_port = v
		}
	}

	if section, err := config.Section("SYSTEM"); err == nil {
		// log.Println(section)
		if v, exist := section.Options()["REST_API_URL"]; exist {
			rest_api_url = v
		}
	}
	return nil
}

func RacsMain(port *int, cfg_file string) {
	var err error

	racs_init_all(cfg_file)
	if *port != 0 {
		acs_port = *port
	}
	// store, err = redistore.NewRediStore(10, "tcp", ":6379", "", []byte("secret-key"))
	store, err = redistore.NewRediStore(10, "tcp", redis_host+":"+redis_port, "", []byte("secret-key"))
	if err != nil {
		log.Println("Redis:", err.Error())
	}
	defer store.Close()
	store.SetMaxAge(rest_max_age)

	global_cpes.Init()
	global_sessions.Init()

	rediscli = new(RedisConn)
	rediscli.ConnectToRemote(redis_host, redis_port)

	getNames = GetPollingNamesFromFile("pollingNames.js")

	log.Println("Start STUN Server for CWMP...")
	StartCwmpStund()

	log.Printf("HTTP Handler installed at http://0.0.0.0:%d/acs for CPEs to connect\n", acs_port)
	http.HandleFunc("/acs", CwmpHandler)
	http.HandleFunc("/ACS", CwmpHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	http.Handle("/upload/", http.StripPrefix("/upload/", http.FileServer(http.Dir("./static/upload"))))

	r := InitRestRoute()
	http.Handle("/", r)

	time.AfterFunc(time.Second*5, func() {
		g_task_manager = task.TaskManager{
			AcsPort:     acs_port,
			AcsUser:     acs_auth_user,
			AcsPassword: acs_auth_password,
			HttpPort:    1,
		}
		g_task_manager.Init()
	})

	err = http.ListenAndServe(fmt.Sprintf(":%d", acs_port), nil)
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}

func Test() {
	nonce := CalculateNonce(acs_realm)
	domain := "172.16.75.95:7547"
	opaque := GetOpaque(domain, nonce)
	fmt.Println(opaque)

	auth := GenDigestAuthResponseHeader(acs_realm, domain)
	fmt.Println(auth)
}
