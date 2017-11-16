package task

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type TaskDistribute struct {
	TaskCommon
}

func (t *TaskDistribute) DoTask(pDevice *DeviceInfo, pTask *Task) {

	log.Printf("Startting 'TaskDistribute' with device: %s\n", pDevice.SerialNumber)
	restUrl := fmt.Sprintf("http://localhost:%d/rest/cpes/SetParameterValues/%s", t.AcsPort, pDevice.SerialNumber)

	payload := fmt.Sprintf(`{"Timeout": 10,"Names": %s}`, pTask.Json)
	res, err := RestClient("PUT", restUrl, payload)
	if err != nil {
		log.Println("Task Distribute:", err.Error())
		pDevice.Status = -1
	} else {
		pDevice.Status = 1
	}
	pDevice.Timestamp = time.Now().Unix()
	t.UpdateStatus(pDevice, pTask)

	x, _ := json.MarshalIndent(res, "", "    ")
	log.Printf("'TaskDistribute' with device: %s finished!\n%s", pDevice.SerialNumber, string(x))
}
