package task

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"pkg/api"
)

func FormatTime(datetime string) time.Time {
	if the_time, err := time.ParseInLocation("2006-01-02 15:04:05", datetime, time.Local); err == nil {
		return the_time
	} else {
		return time.Now()
	}
}

func RestClient(method string, url string, payload string) (map[string]interface{}, error) {
	client := &http.Client{}
	r, err := http.NewRequest(method, url, bytes.NewReader([]byte(payload)))
	if err != nil {
		return nil, err
	}
	r.Header.Set("Content-Type", "application/json; charset=UTF-8")
	resp, err := client.Do(r)
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return nil, err
	}
	params := make(map[string]interface{})

	if err := json.Unmarshal(body, &params); err != nil {
		return nil, err
	}

	status := params["Status"].(string)
	if status != "success" {
		return params, fmt.Errorf("(Error) %s: %s, return status: %s", method, url, status)
	}

	return params, nil
}

func ParseRepeatTime(str string) (int, string, error) {
	reg := regexp.MustCompile("^\\d+[smhdwMy]$")
	data := reg.Find([]byte(str))
	if len(data) == 0 {
		return 1, "d", fmt.Errorf("Time repeat token '%s' format error!", str)
	}

	regNum := regexp.MustCompile("^\\d+")
	strNum := regNum.Find([]byte(str))
	intNum, _ := strconv.Atoi(string(strNum))
	if intNum == 0 {
		return 1, "d", fmt.Errorf("Time repeat interval cannot be zero!")
	}

	regTok := regexp.MustCompile("[smhdwMy]$")
	tok := regTok.Find([]byte(str))

	return intNum, string(tok), nil
}

type TaskCommon struct {
	percent float32
	cancel  bool
	AcsPort int
}

func (t *TaskCommon) CancelTask() {
	t.cancel = true
}

func (t *TaskCommon) GetPercent() float32 {
	return t.percent
}

func (t *TaskCommon) SetPort(port int) {
	t.AcsPort = port
}

func (t *TaskCommon) UpdateStatus(pDevice *DeviceInfo, pTask *Task) {

	sql := fmt.Sprintf(`
		UPDATE sys_task_devices
		   SET status = %d, 
		       finish_time = from_unixtime(%d)
         WHERE task_id = %d
           AND device_id = %d
         `, pDevice.Status, pDevice.Timestamp, pTask.Id, pDevice.Id)
	log.Println(sql)
	if _, err := api.ExecSql(sql); err != nil {
		log.Println(err.Error())
	}
}
