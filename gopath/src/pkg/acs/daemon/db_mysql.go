package daemon

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"time"
)

func ExecSql(sql string) (int64, error) {
	dbconn := new(DbInterface)
	dbconn.ConnectToLocal()
	RowsAffected, err := dbconn.Exec(sql)
	dbconn.Close()
	return RowsAffected, err
}

func GettAllRows(rows *sql.Rows) []map[string]string {
	if rows == nil {
		return nil
	}

	cols, _ := rows.Columns()
	log.Println(cols)
	ary_result := []map[string]string{}

	for rows.Next() {

		rawResult := make([][]byte, len(cols))
		dest := make([]interface{}, len(cols))
		for i, _ := range rawResult {
			dest[i] = &rawResult[i]
		}

		rows.Scan(dest...)

		map_result := map[string]string{}
		for i, raw := range rawResult {
			if raw == nil {
				map_result[cols[i]] = ""
			} else {
				map_result[cols[i]] = string(raw)
			}
		}
		ary_result = append(ary_result, map_result)
	}
	return ary_result
}

func QuerySql(sql string) ([]map[string]string, error) {
	dbconn := new(DbInterface)
	dbconn.ConnectToLocal()
	defer dbconn.Close()

	ary_result := []map[string]string{}

	rows, err := dbconn.Query(sql)
	if err != nil {
		log.Println(err.Error())
		return ary_result, err
	}
	defer rows.Close()

	cols, _ := rows.Columns()
	for rows.Next() {

		rawResult := make([][]byte, len(cols))
		dest := make([]interface{}, len(cols))
		for i, _ := range rawResult {
			dest[i] = &rawResult[i]
		}

		rows.Scan(dest...)

		map_result := map[string]string{}
		for i, raw := range rawResult {
			if raw == nil {
				map_result[cols[i]] = ""
			} else {
				map_result[cols[i]] = string(raw)
			}
		}
		ary_result = append(ary_result, map_result)
	}

	return ary_result, err
}

type DbInterface struct {
	db *sql.DB
}

func (d *DbInterface) ConnectToRemote(host, port, user, pass, dbname string) error {
	var err error
	// "root:asd`12@tcp(172.16.75.97:3306)/wifiapp?charset=utf8",
	access := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8",
		user, pass, host, port, dbname)
	d.db, err = sql.Open("mysql", access)
	if err != nil {
		log.Println(err.Error(), access)
	}
	return err
}

func (d *DbInterface) ConnectToLocal() error {
	var err error
	d.db, err = sql.Open("mysql", "root:asd`12@/wifiapp?charset=utf8")
	if err != nil {
		log.Println("Connect to Local Database server failed!")
	}
	return err
}

func (d *DbInterface) Query(sql string) (*sql.Rows, error) {
	rows, err := d.db.Query(sql)
	if err != nil {
		log.Println(err.Error(), sql)
	}
	return rows, err
}

func (d *DbInterface) QueryAll(exesql string) string {
	return exesql
}

func (d *DbInterface) Close() {
	d.db.Close()
}

func (d *DbInterface) Exec(exesql string) (int64, error) {
	RowsAffected := int64(0)
	if stmt, err := d.db.Prepare(exesql); err != nil {
		return 0, err
	} else {
		if result, err := stmt.Exec(); err != nil {
			stmt.Close()
			return 0, err
		} else {
			if c, err := result.RowsAffected(); err == nil {
				// log.Println("update count : ", c)
				RowsAffected = c
			}
		}
		stmt.Close()
		return RowsAffected, err
	}
}

func (d *DbInterface) CheckDeviceExist(device_sn string) bool {

	sql := fmt.Sprintf(`SELECT id FROM devices WHERE SerialNumber='%s'`, device_sn)
	rows, err := d.db.Query(sql)
	if err != nil {
		return false
	}
	eof := rows.Next()
	rows.Close()
	return eof
}

func (d *DbInterface) CheckUserPassword(username, md5password string) (bool, string) {

	sql := fmt.Sprintf(`SELECT password FROM portal_cloud_account WHERE username='%s'`, username)
	rows, err := d.db.Query(sql)
	if err != nil {
		return false, err.Error()
	}
	var md5shadow string
	var ret_code bool
	var ret_str string
	if noeof := rows.Next(); noeof {
		err = rows.Scan(&md5shadow)
		if err != nil {
			ret_code = false
			ret_str = err.Error()
		} else if md5shadow == md5password {
			ret_code = true
			ret_str = "success"
		} else {
			ret_code = false
			ret_str = "wrong password!"
		}
	} else {
		ret_code = false
		ret_str = "user no exist!"
	}
	rows.Close()
	return ret_code, ret_str
}

func (d *DbInterface) GetDeviceJson(device_sn string, v *map[string]interface{}) error {
	sql := fmt.Sprintf(`SELECT json FROM devices WHERE SerialNumber='%s'`, device_sn)
	rows, err := d.db.Query(sql)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	var jsonstr string
	if noeof := rows.Next(); noeof {
		err = rows.Scan(&jsonstr)
		if err != nil {
			return err
		}
		err = json.Unmarshal([]byte(jsonstr), v)
		if err != nil {
			return err
		}
	}
	rows.Close()
	return nil
}

func (d *DbInterface) GetDeviceValue(device_sn, name string) string {
	var j = make(map[string]interface{})
	d.GetDeviceJson(device_sn, &j)
	if val, exists := j[name]; exists {
		return val.(string)
	} else {
		return ""
	}
}

func (d *DbInterface) SetDeviceValue(device_sn, name, value string) error {
	j := map[string]interface{}{
		name: value,
	}
	return d.SetDeviceJson(device_sn, &j)
}

func (d *DbInterface) SetDeviceJson(device_sn string, dev_map *map[string]interface{}) error {
	jsonstr, err := json.Marshal(dev_map)
	if err != nil {
		log.Println("##### Marshal error ######", err.Error())
		return err
	}
	exesql := fmt.Sprintf(`
		UPDATE devices 
		   SET json = '%s',
		   	   status = '1',
			   LastConnection = FROM_UNIXTIME(%d)
		 WHERE devices.SerialNumber = '%s'`,
		string(jsonstr),
		time.Now().Unix(),
		device_sn,
	)
	// log.Println("##### SQL #####", exesql)
	_, err = d.Exec(exesql)
	if err != nil {
		return err
	}
	return nil
}

func (d *DbInterface) UpdateDeviceJson(device_sn string, update_map *map[string]interface{}) error {

	if d.CheckDeviceExist(device_sn) == false {
		log.Printf("##### device %s no exist!", device_sn)
		return nil
	}

	dev_map := make(map[string]interface{})
	if err := d.GetDeviceJson(device_sn, &dev_map); err != nil {
		log.Println("GetDeviceJson() error: ", err.Error())
	}

	for k, v := range *update_map {
		// log.Println("k,v: ", k, v)
		dev_map[k] = v
	}

	// if x, err := json.MarshalIndent(dev_map, "", "    "); err == nil {
	// 	log.Println("##### Update json ######", string(x))
	// }

	d.SetDeviceJson(device_sn, &dev_map)
	return nil
}

type Devinfo struct {
	Sn         string
	Ip         string
	OnlineTime float64
}

func (d *DbInterface) OfflineDevicesUpdate(cpe_heartbeat_limit int) *[]Devinfo {

	results := []Devinfo{}

	curtime := time.Now().Unix()
	time_limit := cpe_heartbeat_limit
	sql := fmt.Sprintf(`
		SELECT SerialNumber, 
		       ExternalIPAddress,
		       (%d - UNIX_TIMESTAMP(LastConnection)) AS OnlineTime
		  FROM devices 
		 WHERE (%d - UNIX_TIMESTAMP(LastConnection))>%d
		   AND status<>0
		`, curtime, curtime, time_limit)

	rows, err := d.db.Query(sql)
	if err != nil {
		log.Println("SELECT", err.Error())
	}
	var dev Devinfo
	for rows.Next() {
		rows.Scan(&dev.Sn, &dev.Ip, &dev.OnlineTime)
		log.Println(dev)
		results = append(results, dev)
	}
	rows.Close()

	exesql := fmt.Sprintf(`
        UPDATE devices
           SET status = 0
		 WHERE (%d - UNIX_TIMESTAMP(LastConnection))>%d
		   AND status<>0
		`, curtime, time_limit)
	d.Exec(exesql)

	return &results
}

func (d *DbInterface) LogDevice(device_sn string, action string, online_time int64, msg string) {
	level := 2
	if action == "online" {
		level = 6
	}
	exesql := fmt.Sprintf(`
		INSERT INTO syslog (
			id ,
			date ,
			type ,
			level ,
			device_sn ,
			action ,
			online_time,
			msg
			)
		VALUES (
			NULL,
			NOW(),
			'3',
			'%d',
			'%s',
			'%s',
			%d,
			'%s'
		)`, level, device_sn, action, online_time, msg)

	log.Println("SQL:", exesql)
	d.Exec(exesql)

}
