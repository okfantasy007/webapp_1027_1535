package task

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"pkg/api"
)

const (
	TASK_DEVICE_CONFIG_DOWNLOAD = 2
	TASK_DEVICE_UPGRADE         = 3
	TASK_DEVICE_REBOOT          = 4
	TASK_CONTENT_DISTRIBUTION   = 5
	TASK_DEVICE_FACTORY_RESET   = 6
)

type TaskManager struct {
	TaskPool map[string]*Task
	lock     sync.Mutex

	AcsPort     int
	AcsUser     string
	AcsPassword string
	HttpPort    int
}

func (t *TaskManager) Init() {
	if r, err := api.QuerySql(`SELECT value FROM sys_parameters WHERE name='http_server_listen_port'`); err == nil {
		t.HttpPort, _ = strconv.Atoi(r[0]["value"])
	}
	// log.Println(t.HttpPort)

	t.TaskPool = make(map[string]*Task)
	t.SyncAllTask()
}

func (t *TaskManager) Add(pTask *Task) {
	hashkey := fmt.Sprintf("%d", pTask.Id)

	switch pTask.TypeId {
	case TASK_CONTENT_DISTRIBUTION:
		pTask.Func = &TaskDistribute{}
	case TASK_DEVICE_REBOOT:
		pTask.Func = &TaskReboot{}
	case TASK_DEVICE_UPGRADE:
		pTask.Func = &TaskUpgrade{
			HttpPort: t.HttpPort,
			Username: t.AcsUser,
			Password: t.AcsPassword,
		}
	case TASK_DEVICE_CONFIG_DOWNLOAD:
		pTask.Func = &TaskConfigDownload{
			HttpPort: t.HttpPort,
			Username: t.AcsUser,
			Password: t.AcsPassword,
		}
	case TASK_DEVICE_FACTORY_RESET:
		pTask.Func = &TaskFactoryReset{}
	default:
		log.Printf("No support task type %d\n", pTask.TypeId)
	}
	pTask.Func.SetPort(t.AcsPort)
	pTask.Start()
	t.TaskPool[hashkey] = pTask

	fmt.Println("add task:", hashkey)
}

func (t *TaskManager) Delete(pTask *Task) {
	hashkey := fmt.Sprintf("%d", pTask.Id)
	log.Printf("deleting task %s...\n", hashkey)

	if task, exist := t.TaskPool[hashkey]; exist {
		if task.Status < TASK_STATUS_FINISHED {
			task.Stop()
		}
		delete(t.TaskPool, hashkey)
		log.Printf("task: %s deleted\n", hashkey)
	} else {
		log.Printf("task: %s not exist\n", hashkey)
	}
}

func (t *TaskManager) Update(pTask *Task) {
	t.Delete(pTask)
	t.Add(pTask)
}

func (t *TaskManager) UpdatePercentAll() {
	for _, v := range t.TaskPool {
		v.UpdatePercent()
	}
	fmt.Println("UpdatePercentAll")
}

func (t *TaskManager) SyncAllTask() {
	t.lock.Lock()

	dbconn := new(api.DbInterface)
	dbconn.ConnectToLocal()
	sql := fmt.Sprintf(`
		SELECT sys_task.id, 
			   sys_task.name as task_name,
			   sys_task_type.name as type_name,
			   sys_task.type_id as type_id,
			   unix_timestamp(sys_task.start_date_time) as start_unixtime,
			   sys_task.status, 
			   sys_task.repeat,
			   sys_task.repeat_interval,
			   unix_timestamp(sys_task.update_time) as update_unixtime,
			   sys_task.json
	      FROM sys_task,sys_task_type
		 WHERE sys_task.active=1
		   AND sys_task.status <> 3
		   AND sys_task_type.id = sys_task.type_id
	`)
	log.Println(sql)
	rows, err := dbconn.Query(sql)
	if err != nil {
		log.Println("SELECT", err.Error())
	}

	dbTask := map[string]*Task{}

	for rows.Next() {
		tinfo := Task{}

		if err := rows.Scan(
			&tinfo.Id,
			&tinfo.Name,
			&tinfo.TypeName,
			&tinfo.TypeId,
			&tinfo.StartDateTime,
			&tinfo.Status,
			&tinfo.Repeat,
			&tinfo.RepeatInterval,
			&tinfo.UpdateTime,
			&tinfo.Json,
		); err != nil {
			log.Println("######## SCAN #######", err.Error())
		}

		var deviceJson string
		sql2 := fmt.Sprintf(`
			SELECT devices.SerialNumber,
				   devices.id,
				   devices.json
		      FROM devices, sys_task_devices
			 WHERE sys_task_devices.device_id = devices.id
			   AND sys_task_devices.task_id = %d
			`, tinfo.Id)
		rows2, err := dbconn.Query(sql2)
		if err != nil {
			log.Println("SELECT", err.Error())
		}
		for rows2.Next() {
			devInfo := DeviceInfo{}
			rows2.Scan(
				&devInfo.SerialNumber,
				&devInfo.Id,
				&deviceJson,
			)
			params := make(map[string]interface{})
			err = json.Unmarshal([]byte(deviceJson), &params)
			if err == nil {
				if v, exist := params["ServerAddrPort"]; exist {
					devInfo.ServerAddrPort = v.(string)
				}
			}
			// fmt.Println(devInfo)
			tinfo.Devices = append(tinfo.Devices, &devInfo)
		}
		rows2.Close()

		dbTask[fmt.Sprintf("%d", tinfo.Id)] = &tinfo
		fmt.Println(tinfo.Name, tinfo.Id, tinfo.Status)
	}
	rows.Close()

	dbconn.Close()

	// delete finished task
	// for _, v := range t.TaskPool {
	// 	if v.Status == TASK_STATUS_FINISHED {
	// 		t.Delete(v)
	// 		delete(t.TaskPool, hashkey)
	// 	}
	// }

	// find changed task
	for k, v := range dbTask {
		if v2, exist := t.TaskPool[k]; exist {
			if v.UpdateTime != v2.UpdateTime || len(v.Devices) != len(v2.Devices) {
				t.Update(v)
			}
		}
	}

	// find new add task
	for k, v := range dbTask {
		if _, exist := t.TaskPool[k]; !exist {
			t.Add(v)
		}
	}

	// find deleted task
	for k, v := range t.TaskPool {
		if _, exist := dbTask[k]; !exist {
			t.Delete(v)
		}
	}

	t.lock.Unlock()
}

func (t *TaskManager) TransferComplete(session string, faultCode int, faultString string) {

	t.lock.Lock()
	var found bool = false
	for _, task := range t.TaskPool {
		for _, device := range task.Devices {
			if device.Session == session {
				if faultCode == 0 {
					device.Status = 1
					log.Printf("Device %s TransferComplete, session %s closed.\n",
						device.SerialNumber, device.Session)
				} else {
					device.Status = -1
					log.Printf("Device %s TransferComplete fault (%s), session %s closed.\n",
						device.SerialNumber, faultString, device.Session)
				}
				device.Timestamp = time.Now().Unix()
				task.Func.UpdateStatus(device, task)
				api.PublishLocalOnce("nnm/dbupdate", "sys_task_devices")
				break
			}
		}
		if found {
			break
		}
	}
	t.lock.Unlock()
}

func test() {

	for {
		// fmt.Println(task)
		time.Sleep(time.Second)
	}
}
