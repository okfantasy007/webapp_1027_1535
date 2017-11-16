package consumer

import (
	"github.com/gorilla/mux"
	// "net/http"
)

func InitUrlRoute() *mux.Router {

	r := mux.NewRouter()

	r.HandleFunc("/cpe/{number}", CwmpConnectionRequestHandle).Methods("GET")
	r.HandleFunc("/reboot", CwmpRebootAllHandle).Methods("GET")
	r.HandleFunc("/bootstrap", CwmpBootstrapAllHandle).Methods("GET")
	r.HandleFunc("/health", GetHealthHandle).Methods("GET")

	// r.HandleFunc("/devoops", IndexDevoopsHandle)
	// r.HandleFunc("/demo", DemoHandle)
	// r.HandleFunc("/admin", GetNamesHandle)
	// r.HandleFunc("/cpes", GetCpeListHandle)
	// r.HandleFunc("/cpe", CpeDetailHandle)
	// r.HandleFunc("/tree", TreeViewHandle)

	// r.HandleFunc("/cpelist", CpeListHandle)

	return r
}
