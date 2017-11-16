package producer

import (
	"github.com/gorilla/mux"
	// "net/http"
)

func InitUrlRoute() *mux.Router {

	r := mux.NewRouter()

	r.HandleFunc("/cpe/{number}", CwmpConnectionRequestHandle).Methods("GET")

	r.HandleFunc("/start", startHandle).Methods("GET")
	r.HandleFunc("/stop", stopHandle).Methods("GET")
	r.HandleFunc("/sync", syncHandle).Methods("GET")

	// r.HandleFunc("/devoops", IndexDevoopsHandle)
	// r.HandleFunc("/demo", DemoHandle)
	// r.HandleFunc("/admin", GetNamesHandle)
	// r.HandleFunc("/cpes", GetCpeListHandle)
	// r.HandleFunc("/cpe", CpeDetailHandle)
	// r.HandleFunc("/tree", TreeViewHandle)

	// r.HandleFunc("/cpelist", CpeListHandle)

	return r
}
