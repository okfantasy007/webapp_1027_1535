package task

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type TaskReboot struct {
	TaskCommon
}

func (t *TaskReboot) DoTask(pDevice *DeviceInfo, pTask *Task) {
	log.Printf("Startting 'Task Reboot' with device: %s\n", pDevice.SerialNumber)
	restUrl := fmt.Sprintf("http://localhost:%d/rest/cpes/Reboot/%s", t.AcsPort, pDevice.SerialNumber)
	payload := fmt.Sprintf(`{"Timeout": 10}`)
	res, err := RestClient("POST", restUrl, payload)
	if err != nil {
		log.Println("Task Reboot:", err.Error())
		pDevice.Status = -1
	} else {
		pDevice.Status = 1
	}
	pDevice.Timestamp = time.Now().Unix()
	t.UpdateStatus(pDevice, pTask)

	x, _ := json.MarshalIndent(res, "", "    ")
	log.Printf("'Task Reboot' with device: %s finished!\n%s", pDevice.SerialNumber, string(x))
}
