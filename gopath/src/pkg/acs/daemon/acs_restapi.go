package daemon

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
)

func AcsFuncsHandler(w http.ResponseWriter, r *http.Request) {

	defer r.Body.Close()
	funcname := mux.Vars(r)["funcname"]
	p := map[string]interface{}{
		"err_code": 0,
		"err_msg":  "",
		"funcname": funcname,
	}

	switch funcname {
	case "get_acs_host":
		p["acs_host"] = acs_host
	default:
		p["err_code"] = 1001
		p["err_msg"] = "no support function type"
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	json.NewEncoder(w).Encode(&p)
}
