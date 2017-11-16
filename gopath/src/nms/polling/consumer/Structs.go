package consumer

import (
	"encoding/json"
	"fmt"
)

type ResultSet map[string]map[string]string // instance: {logicName: value}

type MibnodeInfo struct {
	Oid		string 
}

type Ability struct {
	Name     string `json:"name"`
	Protocol string `json:"protocol"`
	CallType string `json:"call_type"`
	Mibnodes map[string]MibnodeInfo
	Oids_Str []string
	Type string
}

type TemplateConfig struct {
	Timeout         float64 `json:"timeout"`
	Retries         int     `json:"retries"`
	Port            int     `json:"port"`
	Version         int     `json:"version"`
	CommunityRead   string  `json:"community_read"`
	CommunityWrite  string  `json:"community_write"`
	V3securityName  string  `json:"v3securityName"`
	V3context       string  `json:"v3context"`
	V3securityLevel string  `json:"v3securityLevel"`
	V3authProtocol  string  `json:"v3authProtocol"`
	V3authKey       string  `json:"v3authKey"`
	V3privProtocol  string  `json:"v3privProtocol"`
	V3privKey       string  `json:"v3privKey"`
}

type Template struct {
	Id     int64          `json:"id"`
	Name   string         `json:"name"`
	Type   string         `json:"type"`
	Config TemplateConfig `json:"config"`
}

type PollingTask struct {
	PollType         string      `json:"poll_type"`
	Hostname         string      `json:"hostname"`
	DiscoveryTaskId  int64       `json:"discovery_task_id"`
	DestSubnetId  	 int64       `json:"destnation_subnet"`
	Timestamp		 int64       `json:"timestamp"`
	NeId			 int
	NodeAbilities    []Ability   `json:"node_abilities"`
	PollingTemplates []Template `json:"polling_templates"`
	RestUrl          string      `json:"rest_url"`
	QueueName		 string
}

type PollingResult struct {
	PingOk    bool  `json:"ping_ok"`
	PingRtt   int64 `json:"ping_rtt"`
	PingTries int64 `json:"ping_tries"`

	SnmpOk       bool        `json:"snmp_ok"`
	SnmpVarBinds interface{} `json:"VarBinds"`

	Template Template `json:"Template"`
	ErrMsg   string    `json:"err_msg"`
}

type SysGlobalConfig struct {
	MQ SysRabbitMQConfig `json:"rabbitmq"`
}

type SysRabbitMQConfig struct {
	IP string `json:"ip"`
	Port int64 `json:"port"`
	User string `json:"user"`
	Pwd string `json:"password"`
}

func Convert() {
	var a = `
		{
		  "poll_type": "discovery",
		  "discovery_task_id": 5,
		  "hostname": "172.16.75.99",
		  "node_abilities": [
		    {
		      "name": "icmpPing",
		      "call_type": "static",
		      "protocol": "ICMP"
		    },
		    {
		      "name": "snmpMib2System",
		      "call_type": "static",
		      "protocol": "SNMP"
		    }
		  ],
		  "polling_templates": [
		    {
		      "id": 17,
		      "name": "asda",
		      "type": "ICMP",
		      "config": {
		        "retries": 1,
		        "timeout": 5
		      }
		    },
		    {
		      "id": 5,
		      "name": "snmpv2c",
		      "type": "SNMP",
		      "config": {
		        "port": 161,
		        "retries": 1,
		        "timeout": 5,
		        "version": 2,
		        "v3authKey": "v3authkeydemo",
		        "v3context": "v3contextdemo",
		        "v3privKey": "v3privkeydemo",
		        "community_read": "public",
		        "v3authProtocol": "MD5",
		        "v3privProtocol": "AES",
		        "v3securityName": "v3user",
		        "community_write": "private",
		        "v3securityLevel": "authPriv"
		      }
		    }
		  ],
		  "timestamp": 1496979640
		}`

	obj := PollingTask{}
	json.Unmarshal([]byte(a), &obj)
	fmt.Println(obj)
	// fmt.Println(obj.)
}
