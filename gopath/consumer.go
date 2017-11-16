package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"nms/polling/consumer"
)

const (
	logfile  = "polling.log"
	textlogo = `
		######
		#     #   ####   #       #          #    #    #   ####
		#     #  #    #  #       #          #    ##   #  #    #
		######   #    #  #       #          #    # #  #  #
		#        #    #  #       #          #    #  # #  #  ###
		#        #    #  #       #          #    #   ##  #    #
		#         ####   ######  ######     #    #    #   ####
	`
)

func main() {
	flPort := flag.Int("p", 60010, "Rest API listen port")
	flCfgFile := flag.String("cfgfile", "/usr/local/msp/conf/global_config.json", "Config file path name")
	flHelp := flag.Bool("h", false, "Help")
	flDaemon := flag.Bool("d", false, fmt.Sprintf("Daemon Mode, syslog will output to file %s", logfile))
	flSilent := flag.Bool("s", false, "Silent Mode, no print information")
	flTest := flag.Bool("t", false, "Just for test")
	flag.Parse()

	fmt.Println(textlogo)

	if *flDaemon {
		fmt.Printf("Running on daemon mode!\n")
		fmt.Printf("System output see file '%s'\n", logfile)
		if f, err := os.OpenFile(logfile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666); err == nil {
			log.SetOutput(f)
		}
	}

	if *flSilent {
		fmt.Printf("Running on silent mode!\n")
		log.SetOutput(ioutil.Discard)
	}

	if *flTest {
		consumer.Test()
		os.Exit(0)
	}

	if *flHelp {
		flag.Usage()
		os.Exit(0)
	}

	log.Printf("Rest API listen on %d\n", *flPort)
	consumer.ListenAndServeBatch(flPort, flCfgFile)
}
