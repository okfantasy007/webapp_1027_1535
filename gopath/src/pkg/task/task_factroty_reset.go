package task

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type TaskFactoryReset struct {
	TaskCommon
}

func (t *TaskFactoryReset) DoTask(pDevice *DeviceInfo, pTask *Task) {
	log.Printf("Startting 'Task FactoryReset' with device: %s\n", pDevice.SerialNumber)
	restUrl := fmt.Sprintf("http://localhost:%d/rest/cpes/FactoryReset/%s", t.AcsPort, pDevice.SerialNumber)
	payload := fmt.Sprintf(`{"Timeout": 10}`)
	res, err := RestClient("POST", restUrl, payload)
	if err != nil {
		log.Println("Task FactoryReset:", err.Error())
		pDevice.Status = -1
	} else {
		pDevice.Status = 1
	}
	pDevice.Timestamp = time.Now().Unix()
	t.UpdateStatus(pDevice, pTask)

	x, _ := json.MarshalIndent(res, "", "    ")
	log.Printf("'Task FactoryReset' with device: %s finished!\n%s", pDevice.SerialNumber, string(x))
}
