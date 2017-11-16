package daemon

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"
	"math/rand"

	"github.com/gorilla/mux"
)

func Md5Hex(instr string) string {
	h := md5.New()
	h.Write([]byte(instr))
	cipherStr := h.Sum(nil)
	return hex.EncodeToString(cipherStr)
}

func UnmarshalPayload(r *http.Request) (map[string]interface{}, error) {
	params := make(map[string]interface{})
	params["err_code"] = 0
	params["err_msg"] = ""
	params["RemoteAddr"] = strings.Split(r.RemoteAddr, ":")[0]
	params["startingTime"] = time.Now().UTC()
	content, err := ioutil.ReadAll(r.Body)
	if err != nil {
		params["err_code"] = 401
		params["err_msg"] = err.Error()
		return params, err
	}
	err = json.Unmarshal(content, &params)
	if err != nil {
		params["err_code"] = 402
		params["err_msg"] = err.Error()
	}
	return params, err
}

func GetTimeDuration(pp *map[string]interface{}) {
	(*pp)["TimeDuration"] = time.Now().UTC().Sub((*pp)["startingTime"].(time.Time)).Seconds()
	(*pp)["success"] = (*pp)["err_code"] == 0
}

func NotLogin(w http.ResponseWriter, r *http.Request) bool {

	BasicAuthUser, BasicAuthPass, useBasicAuth := r.BasicAuth()
	if useBasicAuth {
		if BasicAuthUser == "raiseAcsAdmin" && BasicAuthPass == "raiseAcsPass" {
			return false
		}
	}

	err_code := 0
	err_msg := ""
	session, err := store.Get(r, "session-name")
	if err != nil {
		// expired
		err_code = 102
		err_msg = err.Error()
	} else if session.IsNew {
		// not login
		err_code = 101
		err_msg = "not login"
	}

	if err_code != 0 {
		jstr, _ := json.Marshal(map[string]interface{}{
			"err_code": err_code,
			"err_msg":  err_msg,
			"success":  false,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write(jstr)
		return true
	} else {
		return false
	}
}

func getUserDeviceBindingList(username string) (int, string, *[]map[string]interface{}) {
	dbconn := new(DbInterface)
	dbconn.ConnectToLocal()
	sql := fmt.Sprintf(`
		SELECT devices.SerialNumber,
			   devices.DeviceName
		  FROM devices,portal_cloud_account,portal_account_binding
		 WHERE portal_account_binding.user_id = portal_cloud_account.id
		   AND portal_account_binding.serial_number = devices.SerialNumber
		   AND portal_cloud_account.username = '%s'`, username)
	log.Println(sql)

	rows, err := dbconn.Query(sql)
	if err != nil {
		log.Println("SELECT", err.Error())
	}

	var SerialNumber, DeviceName string
	results := []map[string]interface{}{}
	for rows.Next() {
		rows.Scan(&SerialNumber, &DeviceName)
		// log.Println(SerialNumber, DeviceName)
		results = append(results, map[string]interface{}{
			"SerialNumber": SerialNumber,
			"DeviceName":   DeviceName,
		})
	}
	rows.Close()
	dbconn.Close()
	return 0, "", &results
}

func UserRegistHandler(w http.ResponseWriter, r *http.Request) {
	p, err := UnmarshalPayload(r)
	if err == nil {
		sql := fmt.Sprintf(`SELECT * FROM portal_account_verification_code WHERE username='%s' and verification_code='%s'`,
			p["UserName"].(string),
			p["verification_code"].(string),
		)
		users, err := QuerySql(sql)
		if err != nil {
			log.Println("Query Sql", err.Error())
			p["err_code"] = 305
			p["err_msg"] = err.Error()
		} else {
			if len(users) == 0 {
				p["err_code"] = 802
				p["err_msg"] = "verification code error !"
			} else {
				now := time.Now().Unix() 
				t2, _ := time.ParseInLocation("2006-01-02 15:04:05", users[0]["generate_time"], time.Local)
				diff := now - t2.Unix()

				if diff > 900 {
					p["err_code"] = 803
					p["err_msg"] = "verification code expired !"
				} else {
					exesql := fmt.Sprintf(`
						INSERT INTO portal_cloud_account (
							id,
							username,
							password,
							regist_ipaddr,
							regist_time	
						)
						VALUES (
							NULL,
							'%s',
							'%s',
							'%s',
							NOW()
						)`,
						p["UserName"].(string),
						Md5Hex(p["Password"].(string)),
						p["RemoteAddr"],
					)
					log.Println("SQL:", exesql)
					p["Password"] = Md5Hex(p["Password"].(string))

					_, err = ExecSql(exesql)
					if err != nil {
						p["err_code"] = 4
						p["err_msg"] = err.Error()
					} 

					exesql = fmt.Sprintf(`
						DELETE FROM portal_account_verification_code WHERE username='%s'`,
						p["UserName"].(string),
					)
					log.Println("SQL:", exesql)
					_, err = ExecSql(exesql)
					if err != nil {
						p["err_code"] = 4
						p["err_msg"] = err.Error()
					}
				}
			}
		}
	}

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserLoginHandler(w http.ResponseWriter, r *http.Request) {
	p, err := UnmarshalPayload(r)
	if err == nil {
		// time.Sleep(time.Millisecond * 100)
		sql := fmt.Sprintf(`SELECT password FROM portal_cloud_account WHERE username='%s' LIMIT 1`,
			p["UserName"].(string))
		users, err := QuerySql(sql)
		if err != nil {
			log.Println("Query Sql", err.Error())
			p["err_code"] = 305
			p["err_msg"] = err.Error()
		}
		if len(users) != 1 {
			p["err_code"] = 301
			p["err_msg"] = "user no exist!"
		} else {
			if users[0]["password"] == Md5Hex(p["Password"].(string)) {

				session, err := store.Get(r, "session-name")
				if err != nil {
					log.Println("Session get fail!", err.Error())
					p["err_code"] = 303
					p["err_msg"] = err.Error()
				}

				session.Values["loginUser"] = p["UserName"].(string)

				err = session.Save(r, w)
				if err != nil {
					log.Println("Session not saved!", err)
					p["err_code"] = 304
					p["err_msg"] = err.Error()
				} else {
					log.Printf("User %s login success!", session.Values["loginUser"])
				}

			} else {
				p["err_code"] = 302
				p["err_msg"] = "wrong password!"
			}
		}
	}

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserLogoutHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}

	p := map[string]interface{}{
		"err_code": 0,
		"err_msg":  "",
	}

	session, err := store.Get(r, "session-name")
	if err == nil {
		session.Options.MaxAge = -1
		err := session.Save(r, w)
		if err != nil {
			log.Println("Session save error!", err)
			p["err_code"] = 304
			p["err_msg"] = err.Error()
		}
	} else {
		log.Println("Session get fail!", err.Error())
		p["err_code"] = 303
		p["err_msg"] = err.Error()
	}

	p["success"] = p["err_code"] == 0
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}
	p, err := UnmarshalPayload(r)
	if p["NewPassword"].(string) == p["OldPassword"].(string) {
		p["err_code"] = 311
		p["err_msg"] = "New password and old password are the same!"
	} else if err == nil {
		exesql := fmt.Sprintf(`
			UPDATE portal_cloud_account
			   SET password = '%s'
			 WHERE username = '%s' 
			   AND password = '%s'`,
			Md5Hex(p["NewPassword"].(string)),
			p["UserName"].(string),
			Md5Hex(p["OldPassword"].(string)),
		)
		log.Println("SQL:", exesql)
		RowsAffected, err := ExecSql(exesql)
		if err != nil {
			p["err_code"] = 309
			p["err_msg"] = err.Error()
		} else if RowsAffected == 0 {
			p["err_code"] = 310
			p["err_msg"] = "User name or old password not match!"
		}
	}
	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserBindingDeviceListHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}
	p, _ := UnmarshalPayload(r)
	vars := mux.Vars(r)

	p["username"] = vars["username"]
	p["err_code"], p["err_msg"], p["devices"] = getUserDeviceBindingList(vars["username"])

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserBindingDeviceHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}
	p, _ := UnmarshalPayload(r)
	vars := mux.Vars(r)

	p["username"] = vars["username"]
	exesql := fmt.Sprintf(`
		INSERT INTO portal_account_binding(user_id, serial_number)
		SELECT * FROM (
			SELECT portal_cloud_account.id AS user_id,
			       devices.SerialNumber AS serial_number
			  FROM devices JOIN portal_cloud_account 
			 WHERE portal_cloud_account.username='%s' 
			   AND devices.SerialNumber='%s' 
			) AS newtab`,
		vars["username"],
		p["device_sn"].(string),
	)
	log.Println("SQL:", exesql)
	_, err := ExecSql(exesql)
	if err != nil {
		p["err_code"] = 4
		p["err_msg"] = err.Error()
	} else {
		exesql = fmt.Sprintf(`
		UPDATE devices SET DeviceName='%s' WHERE devices.SerialNumber='%s'`,
			p["device_name"].(string),
			p["device_sn"].(string),
		)
		log.Println("SQL:", exesql)
		_, err = ExecSql(exesql)
		if err != nil {
			p["err_code"] = 4
			p["err_msg"] = err.Error()
		}
	}

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func UserDeBindingDeviceHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}
	p, _ := UnmarshalPayload(r)
	vars := mux.Vars(r)

	p["username"] = vars["username"]
	exesql := fmt.Sprintf(`
		DELETE FROM portal_account_binding WHERE (user_id, serial_number) in
		(
		SELECT portal_cloud_account.id AS user_id,
					 devices.SerialNumber AS serial_number
			FROM devices JOIN portal_cloud_account
		 WHERE portal_cloud_account.username='%s'
			 AND devices.SerialNumber='%s'
		);`,
		vars["username"],
		p["device_sn"].(string),
	)
	log.Println("SQL:", exesql)
	_, err := ExecSql(exesql)
	if err != nil {
		p["err_code"] = 4
		p["err_msg"] = err.Error()
	}

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func CpeChangeNameHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}

	p, _ := UnmarshalPayload(r)
	vars := mux.Vars(r)

	exesql := fmt.Sprintf(`
		UPDATE devices
		   SET DeviceName = '%s'
		 WHERE SerialNumber='%s'`,
		p["device_name"].(string),
		vars["serialnumber"],
	)
	log.Println("SQL:", exesql)
	_, err := ExecSql(exesql)
	if err != nil {
		p["err_code"] = 4
		p["err_msg"] = err.Error()
	}

	// p["err_code"] = 701
	// p["err_msg"] = "not finish..."

	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func CpeMac2SnHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}

	vars := mux.Vars(r)
	p := map[string]interface{}{
		"err_code": 0,
		"err_msg":  "",
	}

	f := false
	for sn, vals := range global_cpes.GetAll() {
		if v, ok := vals.PollingValues["InternetGatewayDevice.DeviceInfo.WifiMacList"]; ok {
			if strings.Contains(strings.ToUpper(v), strings.ToUpper(vars["macaddress"])) {
				p["SerialNumber"] = sn
				f = true
				break
			}
		}
	}

	if !f {
		p["err_code"] = 701
		p["err_msg"] = "Not find serialnumber!"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}

func CpeConnectionStatusHandler(w http.ResponseWriter, r *http.Request) {
	if NotLogin(w, r) {
		return
	}

	p := map[string]interface{}{
		"err_code": 0,
		"err_msg":  "",
	}

	vars := mux.Vars(r)
	p["serialnumber"] = vars["serialnumber"]

	dbconn := new(DbInterface)
	dbconn.ConnectToLocal()
	sql := fmt.Sprintf(`
		SELECT devices.status
		  FROM devices
		 WHERE devices.SerialNumber = '%s'`, vars["serialnumber"])
	log.Println(sql)

	rows, err := dbconn.Query(sql)
	if err != nil {
		log.Println("SELECT", err.Error())
	}

	var connectionStatus int
	results := make(map[string]interface{})

	for rows.Next() {
		rows.Scan(&connectionStatus)
		results["ConnectionStatus"] = connectionStatus
	}
	rows.Close()
	dbconn.Close()

	p["Response"] = &results

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}


func generate_verification_code() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	rs := ""
	for start := 0; start < 6; start++ {
		rs = fmt.Sprintf("%s%d", rs, r.Intn(10))
	}

	return rs
}

func GetVerificationCodeHandler(w http.ResponseWriter, r *http.Request) {
	p, _ := UnmarshalPayload(r)

	vars := mux.Vars(r)
	p["username"] = vars["username"]
	sql := fmt.Sprintf(`SELECT generate_time FROM portal_account_verification_code WHERE username='%s' LIMIT 1`,
		vars["username"],
	)
	users, err := QuerySql(sql)
	if err != nil {
		log.Println("Query Sql", err.Error())
		p["err_code"] = 305
		p["err_msg"] = err.Error()
	}
	if len(users) != 1 {
		code := generate_verification_code()
		exesql := fmt.Sprintf(`
			INSERT INTO portal_account_verification_code (
				username,
				verification_code,
				generate_time
			)
			VALUES (
				'%s',
				'%s',
				NOW()
			)`,
			vars["username"],
			code,
		)
		log.Println("SQL:", exesql)

		_, err = ExecSql(exesql)
		if err != nil {
			p["err_code"] = 4
			p["err_msg"] = err.Error()
		} else {
			// p["verification_code"] = code
			// 发送手机验证码
			p["err_code"], p["err_msg"] = VerifyCode(vars["username"], code)
		}
	} else {
		now := time.Now().Unix() 
		t2, _ := time.ParseInLocation("2006-01-02 15:04:05", users[0]["generate_time"], time.Local)
		diff := now - t2.Unix()

		if diff < 30 {
			p["err_code"] = 801
			p["err_msg"] = "Get verification code frequently!"
		} else if diff > 900 {
			code := generate_verification_code()
			exesql := fmt.Sprintf(`
			UPDATE portal_account_verification_code SET verification_code='%s', generate_time=NOW() WHERE username='%s'`,
				code,
				vars["username"],
			)
			log.Println("SQL:", exesql)
			_, err = ExecSql(exesql)
			if err != nil {
				p["err_code"] = 4
				p["err_msg"] = err.Error()
			} else {
				// p["verification_code"] = code
				// 发送手机验证码
				p["err_code"], p["err_msg"] = VerifyCode(vars["username"], code)
			}
		} else {
			exesql := fmt.Sprintf(`UPDATE portal_account_verification_code SET generate_time=NOW() WHERE username='%s'`,
				vars["username"],
			)
			log.Println("SQL:", exesql)
			_, err = ExecSql(exesql)
			if err != nil {
				p["err_code"] = 4
				p["err_msg"] = err.Error()
			}

			sql := fmt.Sprintf(`SELECT verification_code FROM portal_account_verification_code WHERE username='%s' LIMIT 1`,
				vars["username"],
			)
			users, err := QuerySql(sql)
			if err != nil {
				log.Println("Query Sql", err.Error())
				p["err_code"] = 305
				p["err_msg"] = err.Error()
			} else {
				// p["verification_code"] = users[0]["verification_code"]
				// 发送手机验证码
				p["err_code"], p["err_msg"] = VerifyCode(vars["username"], users[0]["verification_code"])
			}
		}
	}
	
	GetTimeDuration(&p)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&p)
}
