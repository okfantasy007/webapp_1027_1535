package producer

import (
	"fmt"
	// "github.com/gorilla/mux"
	"log"
	"net/http"
	// "strconv"
	// "time"
)

func CwmpConnectionRequestHandle(w http.ResponseWriter, r *http.Request) {
	// vars := mux.Vars(r)
	defer r.Body.Close()
	fmt.Fprintf(w, "receive a CONNECTION REQUEST(6) command!")
}

func startHandle(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	// go pollingLoop()
	GLB_task.Start()

	fmt.Fprintf(w, "startHandle().....")
}

func stopHandle(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	log.Println("stop...")
	GLB_task.Stop()
	log.Println("stop node")
	fmt.Fprintf(w, "stopHandle().....")
}

func syncHandle(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	GLB_task.Sync()
	fmt.Fprintf(w, "receive a syncHandle command!")
}
