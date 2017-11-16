package daemon

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"pkg/acs/cwmp"
)

// waitTimeout waits for the waitgroup for the specified max timeout.
// Returns true if waiting timed out.
func waitTimeout(wg *sync.WaitGroup, timeout time.Duration) bool {
	c := make(chan struct{})
	go func() {
		defer close(c)
		wg.Wait()
	}()
	select {
	case <-c:
		return false // completed normally
	case <-time.After(timeout):
		return true // timed out
	}
}

func parseRestParams(r *http.Request) map[string]interface{} {
	content, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	log.Println("REST payload:", string(content))
	params := make(map[string]interface{})
	if err := json.Unmarshal(content, &params); err != nil {
		log.Println(err.Error())
	}
	log.Println(params)
	return params
}

func requestAndWait(w http.ResponseWriter, params map[string]interface{}, msg string) {
	serialnumber := params["SerialNumber"].(string)
	startingTime := time.Now().UTC()

	if cpe, exists := global_cpes.Get(serialnumber); exists {

		var wg sync.WaitGroup
		req := Request{
			Id:          serialnumber,
			CwmpMessage: msg,
			WaitGroup:   &wg,
		}
		cpe.Queue.Enqueue(&req)

		if cpe.State != "Connected" {
			// issue a connection request
			wg.Add(1)
			go doConnectionRequest(serialnumber)

			if waitTimeout(&wg, time.Duration(params["Timeout"].(float64))*time.Second) {
				log.Println("######## Timed out waiting for wait group")
				params["Status"] = "timeout"
			} else {
				params["Status"] = "success"
				log.Println("######## Wait group finished")
				// res := cpe.ResponseBuffer[req.RequstSerial]
				// log.Println("########>>>>Response: ", req.RequstSerial)
				var v interface{}
				json.Unmarshal([]byte(req.RequstSerial), &v)
				params["Response"] = v
			}
		}

	} else {
		params["Status"] = "noexist"
		params["Response"] = "0"
		log.Println(fmt.Sprintf("CPE with serial %s not found", serialnumber))
	}

	params["TimeDuration"] = time.Now().UTC().Sub(startingTime).Seconds()
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&params); err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func CpePollingNamesListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serialnumber := vars["serialnumber"]
	if cpe, exists := global_cpes.Get(serialnumber); exists {
		var ary []string
		for k, _ := range cpe.PollingValues {
			ary = append(ary, k)
		}
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		json.NewEncoder(w).Encode(&ary)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}

func ListCpesHandler(w http.ResponseWriter, r *http.Request) {
	var ary []CPE
	for _, v := range global_cpes.GetAll() {
		ary = append(ary, v)
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&ary); err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func GetCpeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serialnumber := vars["serialnumber"]
	if cpe, exists := global_cpes.Get(serialnumber); exists {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		json.NewEncoder(w).Encode(&cpe)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}

func GetParameterValuesHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	var paramSlice []string
	for _, param := range params["Names"].([]interface{}) {
		paramSlice = append(paramSlice, param.(string))
	}
	cwmpMsg := cwmp.GetParameterValues(paramSlice)
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func GetParameterNamesHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.GetParameterNames(
		params["ParameterPath"].(string),
		params["NextLevel"].(string),
	)
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func SetParameterValuesHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	var paramSlice []map[string]interface{}
	for _, param := range params["Names"].([]interface{}) {
		paramSlice = append(paramSlice, param.(map[string]interface{}))
	}
	cwmpMsg := cwmp.SetParameterValues(paramSlice)
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func GetRPCMethodsHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.GetRcpMethod()
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func RebootHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.Reboot()
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.Download(
		params["FileType"].(string),
		params["URL"].(string),
		params["Username"].(string),
		params["Password"].(string),
		params["FileSize"].(string),
		params["TargetFileName"].(string),
		params["DelaySeconds"].(string),
	)
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.Upload(
		params["FileType"].(string),
		params["URL"].(string),
		params["Username"].(string),
		params["Password"].(string),
		params["DelaySeconds"].(string),
	)
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func CpeDeleteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serialnumber := vars["serialnumber"]

	params := make(map[string]interface{})
	params["command"] = "Delete CPE:" + serialnumber
	params["Status"] = "success"
	global_cpes.Delete(serialnumber)
	log.Println(fmt.Sprintf("Delete CPE with serial %s!", serialnumber))

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&params); err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func CpeBatchDeleteHandler(w http.ResponseWriter, r *http.Request) {
	p, _ := UnmarshalPayload(r)

	params := make(map[string]interface{})
	params["command"] = "Batch delete CPEs"
	params["Status"] = "success"

	sns := strings.Split(p["SerialNumbers"].(string), ",")
	log.Println(fmt.Sprintf("Batch delete devices len %s!", len(sns)))
	for _, v := range sns {
		global_cpes.Delete(v)
	}
	// log.Println(fmt.Sprintf("Batch delete %s!", sns))

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&params); err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func FactoryResetHandler(w http.ResponseWriter, r *http.Request) {
	// 解析rest json参数
	params := parseRestParams(r)
	// 从url中获取设备序列号
	params["SerialNumber"] = mux.Vars(r)["serialnumber"]
	// 构造cwmp报文
	cwmpMsg := cwmp.FactoryReset()
	// 发送请求到cpe并等待结果返回
	requestAndWait(w, params, cwmpMsg)
}

func CpeSleepHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serialnumber := vars["serialnumber"]
	startingTime := time.Now().UTC()

	content, _ := ioutil.ReadAll(r.Body)
	params := make(map[string]interface{})
	if err := json.Unmarshal(content, &params); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	tm := time.Duration(params["Timeout"].(float64)) * time.Second
	time.Sleep(tm)

	params["SerialNumber"] = serialnumber
	params["TimeDuration"] = time.Now().UTC().Sub(startingTime).Seconds()
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&params); err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}
}

func UserBatchGetDevicesStatusHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}
	p, _ := UnmarshalPayload(r)
	vars := mux.Vars(r)

	p["username"] = vars["username"]
	p["err_code"], p["err_msg"], p["devices"] = getUserDevicesStatus(vars["username"])

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func getValFromMapSafe(mapval *map[string]interface{}, key string) interface{} {
	if v, exist := (*mapval)[key]; exist {
		return v
	} else {
		return ""
	}
}

func getUserDevicesStatus(username string) (int, string, *[]map[string]interface{}) {
	dbconn := new(DbInterface)
	dbconn.ConnectToLocal()
	sql := fmt.Sprintf(`
		SELECT devices.SerialNumber,
			   devices.DeviceName,
			   devices.status,
			   devices.json
		  FROM devices,portal_cloud_account,portal_account_binding
		 WHERE portal_account_binding.user_id = portal_cloud_account.id
		   AND portal_account_binding.serial_number = devices.SerialNumber
		   AND portal_cloud_account.username = '%s'`, username)
	log.Println(sql)

	rows, err := dbconn.Query(sql)
	if err != nil {
		log.Println("SELECT", err.Error())
	}

	var SerialNumber, DeviceName, content string
	var ConnectionStatus int
	results := []map[string]interface{}{}
	for rows.Next() {
		rows.Scan(&SerialNumber, &DeviceName, &ConnectionStatus, &content)
		// log.Println(SerialNumber, ExternalIPAddress)
		params := make(map[string]interface{})
		if jerr := json.Unmarshal([]byte(content), &params); jerr != nil {
			log.Println("json.Unmarshal", jerr.Error())
			return 1, "json Unmarshal error", &results
		}

		item := map[string]interface{}{
			"SerialNumber":                                SerialNumber,
			"DeviceName":                                  DeviceName,
			"ConnectionStatus":                            ConnectionStatus,
			"InternetGatewayDevice.DeviceInfo.WANStatus":  getValFromMapSafe(&params, "InternetGatewayDevice.DeviceInfo.WANStatus"),
			"InternetGatewayDevice.DeviceInfo.WWANStatus": getValFromMapSafe(&params, "InternetGatewayDevice.DeviceInfo.WWANStatus"),
			"InternetGatewayDevice.LANDevice.1.Status":    getValFromMapSafe(&params, "InternetGatewayDevice.LANDevice.1.Status"),
			"InternetGatewayDevice.LANDevice.2.Status":    getValFromMapSafe(&params, "InternetGatewayDevice.LANDevice.2.Status"),
		}

		results = append(results, item)

		// results = append(results, map[string]interface{}{
		// 	"SerialNumber":                                SerialNumber,
		// 	"DeviceName":                                  DeviceName,
		// 	"ConnectionStatus":                            ConnectionStatus,
		// 	"InternetGatewayDevice.DeviceInfo.WANStatus":  params["InternetGatewayDevice.DeviceInfo.WANStatus"].(string),
		// 	"InternetGatewayDevice.DeviceInfo.WWANStatus": params["InternetGatewayDevice.DeviceInfo.WWANStatus"].(string),
		// 	"InternetGatewayDevice.LANDevice.1.Status":    params["InternetGatewayDevice.LANDevice.1.Status"].(string),
		// 	"InternetGatewayDevice.LANDevice.2.Status":    params["InternetGatewayDevice.LANDevice.2.Status"].(string),
		// })
	}
	rows.Close()
	dbconn.Close()
	return 0, "", &results
}
