package task

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"pkg/api"
)

const (
	TASK_STATUS_NOSCHEDULED = 0
	TASK_STATUS_SCHEDULED   = 1
	TASK_STATUS_RUNNING     = 2
	TASK_STATUS_FINISHED    = 3
	TASK_STATUS_CANCLLED    = 4
)

type TaskExec interface {
	// public part define in Taskcommon
	GetPercent() float32
	CancelTask()
	SetPort(int)

	UpdateStatus(*DeviceInfo, *Task)
	// private part
	DoTask(*DeviceInfo, *Task)
}

type DeviceInfo struct {
	Id             int64
	SerialNumber   string
	ServerAddrPort string
	Ip             string
	Status         int
	Timestamp      int64
	Session        string
}

type Task struct {
	stop            bool
	start_timestamp int64
	sync_chan       chan int

	Id             int64
	Name           string
	Status         int
	TypeName       string
	TypeId         int
	StartDateTime  int64
	Repeat         bool
	RepeatInterval string
	RepeatTimes    int64
	Percent        float32
	UpdateTime     int64

	Json    string
	Devices []*DeviceInfo
	Func    TaskExec
}

func (t *Task) startRoutine(ch chan int, pDevice *DeviceInfo) {

	// 任务随机延时启动
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	td := time.Duration(r.Intn(1000)) * time.Millisecond
	time.Sleep(td)
	log.Println("Wating...", td)

	t.Func.DoTask(pDevice, t)
	ch <- 0
}

// 计算周期性任务的下次开始时间
func (t *Task) nextTimestamp() int64 {
	tm := time.Unix(t.start_timestamp, 0)
	num, tok, _ := ParseRepeatTime(t.RepeatInterval)
	switch tok {
	case "s":
		tm = tm.Add(time.Second * time.Duration(num))
	case "m":
		tm = tm.Add(time.Minute * time.Duration(num))
	case "h":
		tm = tm.Add(time.Hour * time.Duration(num))
	case "d":
		tm = tm.AddDate(0, 0, num)
	case "w":
		tm = tm.AddDate(0, 0, num*7)
	case "M":
		tm = tm.AddDate(0, num, 0)
	case "y":
		tm = tm.AddDate(num, 0, 0)
	}
	return tm.Unix()
}

func (t *Task) updateTaskStatus(status int) {
	t.Status = status
	sql := fmt.Sprintf(`UPDATE sys_task SET status=%d WHERE sys_task.id = %d`, t.Status, t.Id)
	if _, err := api.ExecSql(sql); err != nil {
		log.Println(err.Error())
	}
	api.PublishLocalOnce("nnm/dbupdate", "sys_task")
}

func (t *Task) updateTaskRepeatTimes(RepeatTimes int64) {
	sql := fmt.Sprintf(`UPDATE sys_task SET repeat_times=%d WHERE sys_task.id = %d`, RepeatTimes, t.Id)
	if _, err := api.ExecSql(sql); err != nil {
		log.Println(err.Error())
	}
}

func (t *Task) DoTaskLoop() {

	if t.Status == TASK_STATUS_FINISHED && !t.Repeat {
		// 一次性定时任务如果已经执行过就不再执行
		fmt.Printf("Task %s:%d\n", t.Name, t.Id)
		fmt.Println(`
			░▀█▀░█▀█░█▀▀░█░█░░░█▀▀░▀█▀░█▀█░▀█▀░█▀▀░█░█░█▀▀░█▀▄
			░░█░░█▀█░▀▀█░█▀▄░░░█▀▀░░█░░█░█░░█░░▀▀█░█▀█░█▀▀░█░█
			░░▀░░▀░▀░▀▀▀░▀░▀░░░▀░░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀░
		`)
		return
	}

	t.updateTaskStatus(TASK_STATUS_SCHEDULED)
	t.sync_chan = make(chan int)
	t.start_timestamp = t.StartDateTime

	for !t.stop {
		now := time.Now().Unix()
		if now < t.start_timestamp {
			time.Sleep(time.Second)
			remain := t.start_timestamp - now

			tm := time.Unix(t.start_timestamp, 0)
			log.Printf("Task %s:%d will start at %s, remain %ds, repeat %d times\n",
				t.Name, t.Id, tm.String(), remain, t.RepeatTimes)
			for i, v := range t.Devices {
				log.Println(i, v.SerialNumber, v.Status)
			}
			continue
		}

		fmt.Printf("Task %s:%d\n", t.Name, t.Id)
		fmt.Println(`
			░█▀▄░█▀▀░█▀▀░▀█▀░█▀█
			░█▀▄░█▀▀░█░█░░█░░█░█
			░▀▀░░▀▀▀░▀▀▀░▀▀▀░▀░▀
		`)

		t.start_timestamp = time.Now().Unix()
		t.updateTaskStatus(TASK_STATUS_RUNNING)

		if len(t.Devices) > 0 {
			t.Percent = 0
			chs := make([]chan int, len(t.Devices))
			for i, dev := range t.Devices {
				chs[i] = make(chan int)
				go t.startRoutine(chs[i], dev)
			}

			finishCount := 0
			for _, ch := range chs {
				<-ch
				finishCount += 1
				t.Percent = float32(finishCount) / float32(len(t.Devices)) * 100.0
			}
		}

		fmt.Printf("Task %s:%d running %ds\n", t.Name, t.Id,
			time.Now().Unix()-t.start_timestamp)
		fmt.Println(`
			░█▀▀░█▀█░█▀▄
			░█▀▀░█░█░█░█
			░▀▀▀░▀░▀░▀▀░
		`)

		api.PublishLocalOnce("nnm/dbupdate", "sys_task_devices")

		if !t.Repeat {
			fmt.Printf("Task %s:%d\n", t.Name, t.Id)
			fmt.Println(`
				#######  ###  #     #  ###   #####   #     #  
				#         #   ##    #   #   #     #  #     #  
				#         #   # #   #   #   #        #     #  
				#####     #   #  #  #   #    #####   #######  
				#         #   #   # #   #         #  #     #  
				#         #   #    ##   #   #     #  #     #  
				#        ###  #     #  ###   #####   #     #  
			`)
			t.updateTaskStatus(TASK_STATUS_FINISHED)
			break
		}

		t.RepeatTimes += 1
		t.start_timestamp = t.nextTimestamp()
		t.updateTaskRepeatTimes(t.RepeatTimes)
		t.updateTaskStatus(TASK_STATUS_SCHEDULED)
	}

	if t.stop {
		t.updateTaskStatus(TASK_STATUS_CANCLLED)
		fmt.Printf("Task %s:%d\n", t.Name, t.Id)
		fmt.Println(`
			 #####                                                          
			#     #   ##   #    #  ####  ###### #      #      ###### #####  
			#        #  #  ##   # #    # #      #      #      #      #    # 
			#       #    # # #  # #      #####  #      #      #####  #    # 
			#       ###### #  # # #      #      #      #      #      #    # 
			#     # #    # #   ## #    # #      #      #      #      #    # 
			 #####  #    # #    #  ####  ###### ###### ###### ###### #####  
		`)
		// t.sync_chan <- 0
		select {
		case t.sync_chan <- 0:
			log.Printf("task %s:%d cancelled! (%d)", t.Name, t.Id, t.Status)
		case <-time.After(5 * time.Second): //超时5s
			log.Printf("stopping task %s:%d timeout! (%d)", t.Name, t.Id, t.Status)
		}

	}
}

func (t *Task) Start() {
	go t.DoTaskLoop()
}

func (t *Task) Stop() {
	t.stop = true
	t.Func.CancelTask()
	select {
	case <-t.sync_chan:
		log.Printf("task %s:%d stoped! (%d)", t.Name, t.Id, t.Status)
	case <-time.After(5 * time.Second): //超时5s
		log.Printf("waiting task %s:%d timeout! (%d)", t.Name, t.Id, t.Status)
	}
}

func (t *Task) UpdatePercent() {
	t.Percent = t.Func.GetPercent()
}
