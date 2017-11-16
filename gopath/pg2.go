package main

import (
	"fmt"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/tatsushid/go-fastping"
)

func FastPing(hostname string, timeout float64) (rtt time.Duration, errno int) {

	if timeout < 1 {
		timeout = 1
	}

	type response struct {
		addr *net.IPAddr
		rtt  time.Duration
	}

	if len(hostname) == 0 {
		errno = 1
		return
	}
	source := ""

	p := fastping.NewPinger()

	netProto := "ip4:icmp"
	if strings.Index(hostname, ":") != -1 {
		netProto = "ip6:ipv6-icmp"
	}
	ra, err := net.ResolveIPAddr(netProto, hostname)
	if err != nil {
		fmt.Println(err)
		errno = 2
		return
	}

	if source != "" {
		p.Source(source)
	}

	results := make(map[string]*response)
	results[ra.String()] = nil
	p.AddIPAddr(ra)

	onRecv, onIdle := make(chan *response), make(chan bool)
	p.OnRecv = func(addr *net.IPAddr, t time.Duration) {
		onRecv <- &response{addr: addr, rtt: t}
	}
	p.OnIdle = func() {
		onIdle <- true
	}

	p.MaxRTT = time.Duration(timeout) * time.Second
	p.RunLoop()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, syscall.SIGTERM)

	select {
	case <-c:
		fmt.Println("get interrupted")
	case res := <-onRecv:
		if _, ok := results[res.addr.String()]; ok {
			results[res.addr.String()] = res
			errno = 0
			rtt = res.rtt
		}
	case <-onIdle:
		for host, r := range results {
			if r == nil {
				//              fmt.Printf("%s : unreachable %v\n", host, time.Now())
				errno = -1
			} else {
				//              fmt.Printf("%s : %v %v\n", host, r.rtt, time.Now())
				errno = -2
			}
			results[host] = nil
		}
	case <-p.Done():
		if err = p.Err(); err != nil {
			fmt.Println("Ping failed:", err)
		}
		errno = -3
	}

	signal.Stop(c)
	p.Stop()

	return
}

func main() {
	for {
		rtt, err := FastPing("baidu.com", 5)
		fmt.Println("Ping: ", int64(rtt/time.Millisecond), err)
		// rtt, err = FastPing("172.16.75.101", 5)
		// fmt.Println("Ping: ", int64(rtt), err)
		time.Sleep(time.Second)
	}
}
