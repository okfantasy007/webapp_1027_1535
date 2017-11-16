package daemon

import (
	"encoding/json"
	// "fmt"
	// "io/ioutil"
	// "log"
	"net/http"
)

func TaskSyncAllHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	g_task_manager.SyncAllTask()

	p := map[string]interface{}{
		"err_code": 0,
		"err_msg":  "",
		"command":  "TaskSyncAllHandler",
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	json.NewEncoder(w).Encode(&p)
}
