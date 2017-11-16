package task

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"
)

type TaskConfigDownload struct {
	TaskCommon
	HttpPort int
	Filename string
	Filesize string
	Username string
	Password string
	Session  string
}

func (t *TaskConfigDownload) DoTask(pDevice *DeviceInfo, pTask *Task) {

	log.Printf("Startting 'Task Config Download' with device: %s\n", pDevice.SerialNumber)

	params := make(map[string]interface{})
	err := json.Unmarshal([]byte(pTask.Json), &params)
	if err == nil {
		if v, exist := params["filename"]; exist {
			t.Filename = v.(string)
		}
		if v, exist := params["filesize"]; exist {
			t.Filesize = v.(string)
		}
	}

	var dealySecond int = 0
	for i, dev := range pTask.Devices {
		if dev.Id == pDevice.Id {
			dealySecond = i
			break
		}
	}

	payloadObj := map[string]interface{}{
		// download 参数部分，全部为字符串变量
		"FileType": "3 Vendor Configuration File",
		"URL": fmt.Sprintf("http://%s:%d/static/share/batch/config/%s",
			strings.Split(pDevice.ServerAddrPort, ":")[0],
			t.HttpPort,
			t.Filename,
		),
		"Username":       t.Username,
		"Password":       t.Password,
		"FileSize":       t.Filesize,
		"TargetFileName": "config.tar.gz",
		"DelaySeconds":   fmt.Sprintf("%d", dealySecond),

		"Timeout": 10,
	}
	restUrl := fmt.Sprintf("http://localhost:%d/rest/cpes/Download/%s", t.AcsPort, pDevice.SerialNumber)
	payloadBytes, _ := json.MarshalIndent(payloadObj, "", "    ")
	log.Printf("%s\n%s", restUrl, string(payloadBytes))
	res, err := RestClient(
		"POST",
		restUrl,
		string(payloadBytes),
	)
	if err != nil {
		log.Println("Task Config Download:", err.Error())
		pDevice.Status = -1
	} else {
		if res["Status"].(string) == "success" && res["Response"] != nil {
			reslv1 := res["Response"].(map[string]interface{})
			pDevice.Session = reslv1["session"].(string)
			// log.Println(pDevice.Session)
		}
	}
	pDevice.Timestamp = time.Now().Unix()
	t.UpdateStatus(pDevice, pTask)

	x, _ := json.MarshalIndent(res, "", "    ")
	log.Printf("'Task Config Download'' with device: %s finished!\n%s", pDevice.SerialNumber, string(x))
}
