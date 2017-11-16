package producer

import (
	"log"
	"sync"
	"time"
)

// An uninteresting service.
type Service struct {
	ch        chan bool
	waitGroup *sync.WaitGroup
	status    int
}

// Make a new Service.
func NewService() *Service {
	return &Service{
		ch:        make(chan bool),
		waitGroup: &sync.WaitGroup{},
		status:    0,
	}
}

// Accept connections and spawn a goroutine to serve each one.  Stop listening
// if anything is received on the service's channel.
func (s *Service) Start() {
	if s.status == 0 {
		s.status = 1
		go s.serve()
	} else {
		log.Printf("Service already started!\n")
	}
}

// Stop the service by closing the service's channel.  Block until the service
// is really stopped.
func (s *Service) Stop() {
	if s.status == 1 {
		// close(s.ch)
		s.ch <- true
		s.waitGroup.Wait()
		s.status = 0
	} else {
		log.Printf("Service not running!\n")
	}
}

func (s *Service) Sync() {
	s.Stop()
	s.Start()
}

// Serve a connection by reading and writing what was read.  That's right, this
// is an echo service.  Stop reading and writing if anything is received on the
// service's channel but only after writing what was read.
func (s *Service) serve() {
	s.waitGroup.Add(1)
	defer s.waitGroup.Done()
	log.Println("Start polling")
	task := PollingTask{}
	task.Load()
	for {
		select {
		case <-s.ch:
			log.Println("End polling")
			return
		default:
			log.Println("Polling...............")
			task.PollingTick()
			time.Sleep(time.Second)
		}
	}
}
