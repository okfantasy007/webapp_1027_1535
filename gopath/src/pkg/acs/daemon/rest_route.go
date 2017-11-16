package daemon

import (
	"github.com/gorilla/mux"
)

func InitRestRoute() *mux.Router {

	r := mux.NewRouter()

	r.HandleFunc("/rest/cpes", ListCpesHandler).Methods("GET")
	r.HandleFunc("/rest/cpes/{serialnumber}", GetCpeHandler).Methods("GET")
	r.HandleFunc("/rest/cpes/GetParameterNames/{serialnumber}", GetParameterNamesHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/GetParameterValues/{serialnumber}", GetParameterValuesHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/SetParameterValues/{serialnumber}", SetParameterValuesHandler).Methods("PUT")
	r.HandleFunc("/rest/cpes/GetRPCMethods/{serialnumber}", GetRPCMethodsHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/Download/{serialnumber}", DownloadHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/Upload/{serialnumber}", UploadHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/Reboot/{serialnumber}", RebootHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/FactoryReset/{serialnumber}", FactoryResetHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/{serialnumber}", CpeDeleteHandler).Methods("DELETE")
	r.HandleFunc("/rest/cpes/PollingNames/{serialnumber}", CpePollingNamesListHandler).Methods("GET")
	r.HandleFunc("/rest/cpes/PollingNames/remove/all/{serialnumber}", CpePollingNamesListHandler).Methods("DELETE")
	r.HandleFunc("/rest/cpes/PollingNames/remove/{name}/{serialnumber}", CpePollingNamesListHandler).Methods("DELETE")
	r.HandleFunc("/rest/cpes/PollingNames/add/{serialnumber}", CpePollingNamesListHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/PollingValues/{serialnumber}", CpePollingNamesListHandler).Methods("GET")
	r.HandleFunc("/rest/cpes/change_name/{serialnumber}", CpeChangeNameHandler).Methods("POST")
	r.HandleFunc("/rest/cpes/mac2sn/{macaddress}", CpeMac2SnHandler)
	r.HandleFunc("/rest/cpes/connectionstatus/{serialnumber}", CpeConnectionStatusHandler)
	r.HandleFunc("/rest/cpes/sleep/{serialnumber}", CpeSleepHandler)

	r.HandleFunc("/rest/user/regist", UserRegistHandler).Methods("POST")
	r.HandleFunc("/rest/user/login", UserLoginHandler).Methods("POST")
	r.HandleFunc("/rest/user/logout", UserLogoutHandler)
	r.HandleFunc("/rest/user/change_password", UserChangePasswordHandler).Methods("POST")
	r.HandleFunc("/rest/user/binding_list/{username}", UserBindingDeviceListHandler)
	r.HandleFunc("/rest/user/binding/{username}", UserBindingDeviceHandler).Methods("POST")
	r.HandleFunc("/rest/user/debinding/{username}", UserDeBindingDeviceHandler).Methods("POST")
	r.HandleFunc("/rest/user/batch_devices_status/{username}", UserBatchGetDevicesStatusHandler)
	r.HandleFunc("/rest/user/verificationcode/{username}", GetVerificationCodeHandler)

	r.HandleFunc("/rest/acs/{funcname}", AcsFuncsHandler).Methods("POST")
	r.HandleFunc("/rest/task/syncall", TaskSyncAllHandler).Methods("GET")

	r.HandleFunc("/rest/service/status/{servicename}", ServiceStatusHandler).Methods("GET")
	r.HandleFunc("/rest/cpes/batch_devices_delete", CpeBatchDeleteHandler).Methods("POST")
	return r
}
