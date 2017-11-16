package daemon

import (
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/oleiade/lane"
	"pkg/acs/cwmp"
)

const (
	CookieName    = "raisecom"
	emptyPostLogo = `
	#######                           ######                      
	#       #    # #####  ##### #   # #     #  ####   ####  ##### 
	#       ##  ## #    #   #    # #  #     # #    # #        #   
	#####   # ## # #    #   #     #   ######  #    #  ####    #   
	#       #    # #####    #     #   #       #    #      #   #   
	#       #    # #        #     #   #       #    # #    #   #   
	####### #    # #        #     #   #        ####   ####    #   
	`
	cpeConnectLogo = `
	    _    ____ ____     __        ____ ____  _____ 
	   / \  / ___/ ___|   / /____   / ___|  _ \| ____|
	  / _ \| |   \___ \  / /_____| | |   | |_) |  _|  
	 / ___ \ |___ ___) | \ \_____| | |___|  __/| |___ 
	/_/   \_\____|____/   \_\       \____|_|   |_____|
	`
	acs2cpeLogo = `
	    _    ____ ____        __     ____ ____  _____ 
	   / \  / ___/ ___|   ____\ \   / ___|  _ \| ____|
	  / _ \| |   \___ \  |_____\ \ | |   | |_) |  _|  
	 / ___ \ |___ ___) | |_____/ / | |___|  __/| |___ 
	/_/   \_\____|____/       /_/   \____|_|   |_____|
	`
	acsbreakLogo = `
	    _    ____ ____                      ____ ____  _____ 
	   / \  / ___/ ___|       __  __       / ___|  _ \| ____|
	  / _ \| |   \___ \   ____\ \/ /____  | |   | |_) |  _|  
	 / ___ \ |___ ___) | |_____>  <_____| | |___|  __/| |___ 
	/_/   \_\____|____/       /_/\_\       \____|_|   |_____|
	`
	transCompLogo = `
	#######                              #####                
	   #    #####    ##   #    #  ####  #     # #    # #####  
	   #    #    #  #  #  ##   # #      #       ##  ## #    # 
	   #    #    # #    # # #  #  ####  #       # ## # #    # 
	   #    #####  ###### #  # #      # #       #    # #####  
	   #    #   #  #    # #   ## #    # #     # #    # #      
	   #    #    # #    # #    #  ####   #####  #    # #     
	`
	informLogo = `
	###                                    
	 #  #    # ######  ####  #####  #    # 
	 #  ##   # #      #    # #    # ##  ## 
	 #  # #  # #####  #    # #    # # ## # 
	 #  #  # # #      #    # #####  #    # 
	 #  #   ## #      #    # #   #  #    # 
	### #    # #       ####  #    # #    #
	`
	faultLogo = `
	#######                            
	#         ##   #    # #      ##### 
	#        #  #  #    # #        #   
	#####   #    # #    # #        #   
	#       ###### #    # #        #   
	#       #    # #    # #        #   
	#       #    #  ####  ######   #   
	`
	doConnectionRequestLogo = `
	  _   _   _   _   _   _   _   _   _   _   _   _   _   _   _   _   _  
	 / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ 
	( C | o | n | n | e | c | t | i | o | n | R | e | q | u | e | s | t )
	 \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ 
	`
	keepConnectionLogo = `
	 _  __                ____                            _   
	| |/ /___  ___ _ __  / ___|___  _ __  _ __   ___  ___| |_ 
	| ' // _ \/ _ \ '_ \| |   / _ \| '_ \| '_ \ / _ \/ __| __|
	| . \  __/  __/ |_) | |__| (_) | | | | | | |  __/ (__| |_ 
	|_|\_\___|\___| .__/ \____\___/|_| |_|_| |_|\___|\___|\__|
	              |_|                                         
    `
)

type Request struct {
	Id           string
	CwmpMessage  string
	WaitGroup    *sync.WaitGroup
	RequstSerial string
}

type CPE struct {
	SerialNumber              string
	Manufacturer              string
	ProductClass              string
	OUI                       string
	EventCode                 string
	ModelName                 string
	ConnectionRequestURL      string
	ConnectionRequestUsername *string
	ConnectionRequestPassword *string
	SoftwareVersion           string
	ExternalIPAddress         string
	State                     string
	Queue                     *lane.Queue
	ReadyToRequest            bool
	Waiting                   *Request
	HardwareVersion           string
	LastConnection            int64
	MustUnderstand            string
	InformValues              map[string]string
	PollingValues             map[string]string
	DataModel                 string
	KeepConnectionOpen        bool
	StunConnection            *StunConn
	ServerAddrPort            string
}

type CpeMap struct {
	cpes map[string]CPE
	lock sync.Mutex
}

func (c *CpeMap) Init() {
	c.cpes = make(map[string]CPE)
	// cwmp_sessions = make(map[string]*CPE)
}

func (c *CpeMap) Get(key string) (CPE, bool) {
	c.lock.Lock()
	cpe, exist := c.cpes[key]
	c.lock.Unlock()
	return cpe, exist
}

func (c *CpeMap) Set(key string, cpe CPE) {
	c.lock.Lock()
	c.cpes[key] = cpe
	c.lock.Unlock()
}

func (c *CpeMap) Delete(key string) {
	c.lock.Lock()
	delete(c.cpes, key)
	c.lock.Unlock()
}

func (c *CpeMap) GetAll() map[string]CPE {
	c.lock.Lock()
	dupMap := c.cpes
	c.lock.Unlock()
	return dupMap
}

type SessionMap struct {
	sessions map[string]*CPE
	lock     sync.Mutex
}

func (c *SessionMap) Init() {
	c.sessions = make(map[string]*CPE)
}

func (c *SessionMap) Get(key string) (*CPE, bool) {
	c.lock.Lock()
	pcpe, exist := c.sessions[key]
	c.lock.Unlock()
	return pcpe, exist
}

func (c *SessionMap) Set(key string, pcpe *CPE) {
	c.lock.Lock()
	c.sessions[key] = pcpe
	c.lock.Unlock()
}

func (c *SessionMap) Delete(key string) {
	c.lock.Lock()
	delete(c.sessions, key)
	c.lock.Unlock()
}

func (c *SessionMap) FindKey(pcpe *CPE) string {
	c.lock.Lock()
	key := ""
	for k, v := range c.sessions {
		if pcpe == v {
			key = k
			break
		}
	}
	c.lock.Unlock()
	return key
}

func (c *SessionMap) Purge() int {
	var count int = 0
	if len(c.sessions) < 10000 {
		return count
	}
	c.lock.Lock()
	for k, v := range c.sessions {
		// 删除超过一个小时的未结束session
		if time.Now().Unix()-v.LastConnection > 3600 {
			delete(c.sessions, k)
			count += 1
		}
	}
	c.lock.Unlock()
	return count
}

func doConnectionRequest(SerialNumber string) {

	log.Println(doConnectionRequestLogo)

	if cpe, exists := global_cpes.Get(SerialNumber); exists {

		if cpe.StunConnection.Enable == false {
			log.Printf("ConnectionRequest via HTTP %s %s (%s:%s)\n",
				SerialNumber,
				cpe.ConnectionRequestURL,
				*cpe.ConnectionRequestUsername,
				*cpe.ConnectionRequestPassword)
			HttpBasicAuth(
				*cpe.ConnectionRequestUsername,
				*cpe.ConnectionRequestPassword,
				cpe.ConnectionRequestURL)
		} else {
			stunRequest := fmt.Sprintf(`GET http://%s/acs?ts=%d&id=%d&un=%s&cn=%d&sig=%s HTTP/1.1`,
				cpe.ServerAddrPort,
				time.Now().Unix(),
				time.Now().UTC().UnixNano(),
				cpe.StunConnection.Username,
				time.Now().UTC().UnixNano(),
				hex.EncodeToString(cpe.StunConnection.RequestId))
			log.Printf("ConnectionRequest via STUN UDP %s %s %s\n",
				SerialNumber,
				cpe.StunConnection.RemoteAddr,
				stunRequest)
			cpe.StunConnection.Connection.WriteTo([]byte(stunRequest), cpe.StunConnection.RemoteAddr)
		}

	} else {
		log.Println("SN:", SerialNumber, "not found!")
	}

}

func CwmpHttpAuth(auth_mode string, w http.ResponseWriter, r *http.Request) bool {
	authorization := r.Header.Get("Authorization")
	switch auth_mode {
	case "BASIC":
		// http基本认证
		if authorization != "" {
			BasicAuthUser, BasicAuthPass, useBasicAuth := r.BasicAuth()
			// log.Println(BasicAuthUser, BasicAuthPass, useBasicAuth)
			if useBasicAuth && BasicAuthUser == acs_auth_user && BasicAuthPass == acs_auth_password {
				log.Printf("##### %s BASIC authorization success #####\n", r.RemoteAddr)
				return true
			}
		}
		log.Printf("##### %s BASIC authorization failed, send response(401) #####\n", r.RemoteAddr)
		w.Header().Set("WWW-Authenticate", fmt.Sprintf("Basic realm=\"%s\"", acs_realm))
		w.WriteHeader(401)
		return false

	case "DIGEST":
		// http摘要认证
		if authorization != "" {
			items := map[string]string{}
			for _, v := range strings.Split(authorization, ",") {
				ary := strings.SplitN(strings.TrimSpace(v), "=", 2)
				items[ary[0]] = strings.Trim(ary[1], "\"")
			}
			// for k, v := range items {
			// 	log.Println(k, "=", v)
			// }
			response := GenHttpDigestResponse(
				items["username"], acs_auth_password, items["Digest realm"],
				"POST", items["uri"],
				items["nonce"], items["nc"], items["cnonce"], items["qop"])
			if response == items["response"] {
				log.Printf("##### %s DIGEST authorization success #####\n", r.RemoteAddr)
				return true
			}

		}
		www_auth_header := GenDigestAuthResponseHeader(acs_realm, r.Host)
		log.Printf("##### %s DIGEST authorization failed, send DIGEST authorization response #####\n", r.RemoteAddr)
		w.Header().Set("WWW-Authenticate", www_auth_header)
		log.Println(w.Header())
		w.WriteHeader(401)
		return false

	default:
		// ACS不需要认证
	}
	return true
}

func handleInform(w http.ResponseWriter, r *http.Request,
	pEnvelope *cwmp.SoapEnvelope, pByteBody *[]byte) {

	log.Println(informLogo)

	//================================= CPE 认证 ==================================
	if !CwmpHttpAuth(acs_auth_mode, w, r) {
		return
	}

	// 解析inform
	var Inform cwmp.CWMPInform
	xml.Unmarshal(*pByteBody, &Inform)
	mustUnderstand := pEnvelope.Header.Id

	// 调试信息，格式化打印解析后的inform
	if x, err := xml.MarshalIndent(Inform, "", "    "); err == nil {
		log.Println(string(x))
	}

	// 获取cpe ip地址
	var addr string
	if r.Header.Get("X-Real-Ip") != "" {
		addr = r.Header.Get("X-Real-Ip")
	} else {
		ary := strings.Split(r.RemoteAddr, ":")
		addr = ary[0]
	}

	if _, exists := global_cpes.Get(Inform.DeviceId.SerialNumber); !exists {

		// 收到一个新的CPE设备的inform

		var envelope cwmp.SoapEnvelope
		xml.Unmarshal(*pByteBody, &envelope)

		newCpe := CPE{
			SerialNumber:              Inform.DeviceId.SerialNumber,
			OUI:                       Inform.DeviceId.OUI,
			Manufacturer:              Inform.DeviceId.Manufacturer,
			ProductClass:              Inform.DeviceId.ProductClass,
			ModelName:                 Inform.GetModelName(),
			SoftwareVersion:           Inform.GetSoftwareVersion(),
			HardwareVersion:           Inform.GetHardwareVersion(),
			DataModel:                 Inform.GetDataModelType(),
			ServerAddrPort:            r.Host,
			ExternalIPAddress:         addr,
			ConnectionRequestURL:      Inform.GetConnectionRequestURL(),
			ConnectionRequestUsername: Inform.GetConnectionRequestUsername(),
			ConnectionRequestPassword: Inform.GetConnectionRequestPassword(),
			KeepConnectionOpen:        false,
			MustUnderstand:            "",
			LastConnection:            time.Now().Unix(),
			Queue:                     lane.NewQueue(),
			InformValues:              make(map[string]string),
			StunConnection:            &StunConn{Enable: false},
			PollingValues: map[string]string{
				// 初始化每次收到inform(2)后需要get的变量
				"InternetGatewayDevice.ManagementServer.ConnectionRequestURL":      "",
				"InternetGatewayDevice.ManagementServer.ConnectionRequestUsername": "",
				"InternetGatewayDevice.ManagementServer.ConnectionRequestPassword": "",
				"InternetGatewayDevice.DeviceInfo.WifiMacList":                     "",
			},
		}
		// 初始化每次收到inform(2)后需要get的变量，从配置文件获取
		for _, value := range *getNames {
			newCpe.PollingValues[value] = ""
		}

		global_cpes.Set(Inform.DeviceId.SerialNumber, newCpe)
	}

	// 为当前的session复制一个CPE实例
	// dupCpe := cpes[Inform.DeviceId.SerialNumber]
	dupCpe, _ := global_cpes.Get(Inform.DeviceId.SerialNumber)
	sessionCpe := &dupCpe
	sessionCpe.MustUnderstand = mustUnderstand

	// 将部分inform报文体中的变量加入到Inform.ParameterList数组中
	Inform.ParameterList = append(Inform.ParameterList,
		cwmp.ParameterValueStruct{Name: "Manufacturer", Value: Inform.DeviceId.Manufacturer})
	Inform.ParameterList = append(Inform.ParameterList,
		cwmp.ParameterValueStruct{Name: "OUI", Value: Inform.DeviceId.OUI})
	Inform.ParameterList = append(Inform.ParameterList,
		cwmp.ParameterValueStruct{Name: "ProductClass", Value: Inform.DeviceId.ProductClass})
	Inform.ParameterList = append(Inform.ParameterList,
		cwmp.ParameterValueStruct{Name: "ExternalIPAddress", Value: addr})
	Inform.ParameterList = append(Inform.ParameterList,
		cwmp.ParameterValueStruct{Name: "ServerAddrPort", Value: sessionCpe.ServerAddrPort})

	// 找到Inform.ParameterList数组中更新的变量
	changed := make(map[string]string)
	for _, r := range Inform.ParameterList {
		changed[r.Name] = r.Value
		if _, exists := sessionCpe.InformValues[r.Name]; !exists || sessionCpe.InformValues[r.Name] != r.Value {
			changed[r.Name] = r.Value
			sessionCpe.InformValues[r.Name] = r.Value
		}
	}

	// Inform更新到数据库
	InformMessage(sessionCpe, &changed)

	// 设备心跳信息
	PushHeartBeatMessage(sessionCpe.SerialNumber, addr)

	// 收到周期上报的inform需要轮询CPE
	if Inform.GetEventCode() == "2" {
		var paramSlice []string
		for k, _ := range sessionCpe.PollingValues {
			paramSlice = append(paramSlice, k)
		}
		req := Request{
			Id:          sessionCpe.SerialNumber,
			CwmpMessage: cwmp.GetParameterValues(paramSlice),
		}
		sessionCpe.Queue.Enqueue(&req)
	}

	// 在InformResponse中加入http cookie建立session
	sessionID := Md5HexString(time.Now().String())
	expiration := time.Now().AddDate(100, 2, 3) // expires in 100 year 2 month 3 day
	cookie := http.Cookie{Name: CookieName, Value: sessionID, Expires: expiration}
	http.SetCookie(w, &cookie)
	// 收到cpe发送的emptyPost之前不能发送请求到cpe
	sessionCpe.ReadyToRequest = false

	// 建立session管理map，保存当前会话的cpe对象实例
	global_sessions.Set(sessionID, sessionCpe)
	// 清除超时会话
	global_sessions.Purge()

	// log.Printf("Received an Inform from %s (%d bytes) with SerialNumber %s and EventCodes %s", addr, bodyLength, Inform.DeviceId.SerialNumber, Inform.GetEvents())
	log.Printf("======== Create session '%s : %s' ========\n", addr, sessionID)

	// 发送inform response到cpe
	fmt.Fprintf(w, cwmp.InformResponse(mustUnderstand))

	log.Println("=======================( InformResponse )======================\n",
		"Header:", w.Header(), "\n",
		"Body:", cwmp.InformResponse(mustUnderstand),
	)
	return
}

func handleTransferComplete(w http.ResponseWriter, r *http.Request,
	pEnvelope *cwmp.SoapEnvelope, pByteBody *[]byte) {

	log.Println(transCompLogo)

	var msg cwmp.TransferComplete
	xml.Unmarshal(*pByteBody, &msg)

	if x, err := xml.MarshalIndent(&msg.TransferComplete, "", "    "); err == nil {
		log.Println(string(x))
	}
	// msg.TransferComplete.FaultStruct.FaultCode

	if cookie, err := r.Cookie(CookieName); err == nil {
		sessionKey := cookie.Value
		if v, exists := global_sessions.Get(sessionKey); exists {
			log.Printf("========== CPE '%s' TransferComplete =========\n", v.SerialNumber)
			global_sessions.Delete(sessionKey)
			log.Printf("========== Delete session '%s' from session map =========\n", sessionKey)
			log.Println(acsbreakLogo)
			w.WriteHeader(204)
			log.Printf("####### close session connection, WriteHeader(204)'%s' #######\n", sessionKey)

			var FaultCode int = 0
			if code, err := strconv.Atoi(msg.TransferComplete.FaultStruct.FaultCode); err == nil {
				FaultCode = code
			}
			g_task_manager.TransferComplete(sessionKey, FaultCode,
				msg.TransferComplete.FaultStruct.FaultString)
			return
		}
	}

	// may be need write TransferCompleteResponse
	log.Println(acsbreakLogo)
	w.WriteHeader(204)
}

func handleFault(w http.ResponseWriter, r *http.Request,
	pEnvelope *cwmp.SoapEnvelope, pByteBody *[]byte) {

	log.Println(faultLogo)

	var envelope cwmp.FaultMessage
	xml.Unmarshal(*pByteBody, &envelope)
	if x, err := json.Marshal(&envelope.FaultDetail); err == nil {
		log.Println(string(x))
	}
	log.Println(acsbreakLogo)
	w.WriteHeader(204)
}

func handleResponse(r *http.Request, pEnvelope *cwmp.SoapEnvelope, pByteBody *[]byte, cpe *CPE) {

	if cpe.Waiting == nil {
		// 当前cpe没有等候的Response消息
		return
	}

	messageType := pEnvelope.Body.CWMPMessage.XMLName.Local
	switch messageType {
	case "GetParameterNamesResponse":
		var envelope cwmp.GetParameterNamesResponse
		xml.Unmarshal(*pByteBody, &envelope)

		if cpe.Waiting.WaitGroup != nil {
			if x, err := json.MarshalIndent(&envelope.ParameterList, "", "    "); err == nil {
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	case "GetParameterValuesResponse":
		var envelope cwmp.GetParameterValuesResponse
		xml.Unmarshal(*pByteBody, &envelope)

		if x, err := xml.MarshalIndent(&envelope.ParameterList, "", "    "); err == nil {
			log.Println(string(x))
		}

		changed := make(map[string]string)
		if cpe.Waiting.WaitGroup != nil {
			for _, r := range envelope.ParameterList {
				changed[r.Name] = r.Value
			}
			x, _ := json.MarshalIndent(&changed, "", "    ")
			log.Println("====push to ResponseBuffer====>", cpe.Waiting.RequstSerial)
			cpe.Waiting.RequstSerial = string(x)
		} else {
			for _, r := range envelope.ParameterList {
				if _, exists := cpe.PollingValues[r.Name]; !exists || cpe.PollingValues[r.Name] != r.Value {
					changed[r.Name] = r.Value
					cpe.PollingValues[r.Name] = r.Value
				}

				if r.Name == "InternetGatewayDevice.ManagementServer.ConnectionRequestUsername" {
					*cpe.ConnectionRequestUsername = r.Value
				}
				if r.Name == "InternetGatewayDevice.ManagementServer.ConnectionRequestPassword" {
					*cpe.ConnectionRequestPassword = r.Value
				}
			}
		}
		log.Printf("##### %d Value changed!", len(changed))
		PushUpdateMessage(cpe.SerialNumber, &changed)

	case "SetParameterValuesResponse":
		var envelope cwmp.SetParameterValuesResponse
		xml.Unmarshal(*pByteBody, &envelope)
		if cpe.Waiting.WaitGroup != nil {
			if x, err := json.MarshalIndent(&envelope.Status, "", "    "); err == nil {
				log.Println("Status =", string(x))
				cpe.Waiting.RequstSerial = string(x)
				// set success, update database
				if cpe.Waiting.RequstSerial == `"1"` || cpe.Waiting.RequstSerial == `"0"` {
					var env cwmp.SetParameterValuesRequest
					xml.Unmarshal([]byte(cpe.Waiting.CwmpMessage), &env)
					changed := make(map[string]string)
					for _, r := range env.ParameterList {
						changed[r.Name] = r.Value
					}
					PushUpdateMessage(cpe.SerialNumber, &changed)
				}
			}
		}

	case "GetRPCMethodsResponse":
		var envelope cwmp.GetRPCMethodsResponse
		xml.Unmarshal(*pByteBody, &envelope)
		if cpe.Waiting.WaitGroup != nil {
			if x, err := json.MarshalIndent(&envelope.MethodList, "", "    "); err == nil {
				log.Println("MethodList: ", string(x))
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	case "RebootResponse":
		var envelope cwmp.RebootResponse
		xml.Unmarshal(*pByteBody, &envelope)
		if cpe.Waiting.WaitGroup != nil {
			if x, err := xml.Marshal(&envelope); err == nil {
				log.Println("RebootResponse: ", string(x))
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	case "DownloadResponse":
		var envelope cwmp.DownloadResponse
		xml.Unmarshal(*pByteBody, &envelope)
		cpe.KeepConnectionOpen = true
		if cpe.Waiting.WaitGroup != nil {

			sessionKey := ""
			if cookie, err := r.Cookie(CookieName); err == nil {
				sessionKey = cookie.Value
			}
			res := map[string]interface{}{
				"session":          sessionKey,
				"DownloadResponse": envelope.DownloadResponse,
			}
			if x, err := json.Marshal(res); err == nil {
				log.Println("DownloadResponse: ", string(x))
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	case "UploadResponse":
		var envelope cwmp.UploadResponse
		xml.Unmarshal(*pByteBody, &envelope)
		cpe.KeepConnectionOpen = true
		if cpe.Waiting.WaitGroup != nil {
			if x, err := json.Marshal(&envelope.UploadResponse); err == nil {
				log.Println("UploadResponse: ", string(x))
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	case "FactoryResetResponse":
		var envelope cwmp.FactoryResetResponse
		xml.Unmarshal(*pByteBody, &envelope)
		if cpe.Waiting.WaitGroup != nil {
			if x, err := json.Marshal(&envelope.FactoryResetResponse); err == nil {
				log.Println("FactoryResetResponse: ", string(x))
				cpe.Waiting.RequstSerial = string(x)
			}
		}

	default:
		log.Println("####### WARNING ####### No support Response TYPE:", messageType)
	}

	if cpe.Waiting.WaitGroup != nil {
		cpe.Waiting.WaitGroup.Done()
		log.Printf("################# %s:%s WaitGroup.Done() #################\n",
			cpe.ExternalIPAddress, cpe.SerialNumber)
	}

	cpe.Waiting = nil
}

func CwmpHandler(w http.ResponseWriter, r *http.Request) {

	//=============================== 初步解析报文 ================================
	log.Println(cpeConnectLogo, r.RemoteAddr)
	log.Println("Header: #########(", r.Header, ")#########")
	byteBody, _ := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	bodyLength := len(string(byteBody))
	log.Println("Body: #########(", string(byteBody), ")#########")
	var envelope cwmp.SoapEnvelope
	xml.Unmarshal(byteBody, &envelope)
	messageType := envelope.Body.CWMPMessage.XMLName.Local
	log.Println("========================( " + messageType + " )=======================")
	acs_host = r.Host

	// ======================= 处理inform等非Response报文 ==========================

	var cpe *CPE
	var sessionKey string
	switch messageType {
	case "Inform":
		handleInform(w, r, &envelope, &byteBody)
		return
	case "TransferComplete":
		handleTransferComplete(w, r, &envelope, &byteBody)
		return
	case "Fault":
		handleFault(w, r, &envelope, &byteBody)
		return
	default:
		if cookie, err := r.Cookie(CookieName); err != nil {
			// session ID 不存在
			log.Println(err.Error())
			log.Printf("######## Cookie '%s' missing! drop packet.########\n", CookieName)
			w.WriteHeader(401)
			return
		} else {
			sessionKey = cookie.Value
			if _, exists := global_sessions.Get(sessionKey); !exists {
				// session ID 已不在hash表中
				log.Printf("######### Session '%s' was terminated! ########\n", sessionKey)
				w.WriteHeader(401)
				return
			}
			// 找到hash中的session ID，继续session处理
			cpe, _ = global_sessions.Get(sessionKey)
			log.Println("sessionKey:", sessionKey)
			cpe.LastConnection = time.Now().Unix()

			// 收到一个当前session的空报文，表示可以向CPE发送请求
			if bodyLength == 0 {
				// empty post
				log.Println(emptyPostLogo)
				cpe.ReadyToRequest = true
			}
		}
	}

	// ============================= 接收 CPE response ===========================
	handleResponse(r, &envelope, &byteBody, cpe)

	// ========================= 从队列中取出指令向CPE发送 =======================
	// Got Empty Post or a Response. Now check for any event to send, otherwise 204
	if cpe.Queue.Size() > 0 {

		if cpe.ReadyToRequest {
			// inform后已经收到CPE的空post，从请求队列取出一个要发送到CPE的请求
			req := cpe.Queue.Dequeue().(*Request)
			cwmp.SetHeaderMustUnderstand(&req.CwmpMessage, cpe.MustUnderstand)
			log.Println(acs2cpeLogo)
			log.Println(req.CwmpMessage)
			// 向CPE发送Request
			fmt.Fprintf(w, req.CwmpMessage)
			// 设置等待Response标记
			cpe.Waiting = req
		}

	} else {

		// 已经没有需要发送到cpe的请求报文，结束当前session，如果需要等待TransferComplete等后续报文，
		// 则暂时保持连接，保留session ID在map中暂时不删除
		// sessionKey := global_sessions.FindKey(cpe)
		if !cpe.KeepConnectionOpen {
			global_sessions.Delete(sessionKey)
			log.Printf("###### Delete session '%s' from session map #######\n", sessionKey)
			log.Println(acsbreakLogo)
			w.WriteHeader(204)
			log.Printf("####### close session connection, WriteHeader(204)'%s' #######\n", sessionKey)
		} else {
			log.Println(keepConnectionLogo)
			log.Printf("####### current session %s will keep connection, waiting some long time operation #######\n", sessionKey)
		}
	}

}
