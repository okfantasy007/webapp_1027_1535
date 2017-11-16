package consumer

import (
	"fmt"
	// "github.com/gorilla/mux"
	"net/http"
	// "strconv"
	// "time"
)

func CwmpConnectionRequestHandle(w http.ResponseWriter, r *http.Request) {
	// vars := mux.Vars(r)
	fmt.Fprintf(w, "receive a CONNECTION REQUEST(6) command!")
	r.Body.Close()
}

func CwmpBootstrapAllHandle(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "receive a BOOTSTRAP command!")
	r.Body.Close()
}

func CwmpRebootAllHandle(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "receive a BOOT command!")
	r.Body.Close()
}
