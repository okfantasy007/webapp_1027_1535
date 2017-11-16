package producer

import (
	"fmt"
	// "log"
	"encoding/json"
	"time"
)

type Node struct {
	// database record
	Id            int
	Hostname      string
	Poll_enabled  bool
	Poll_interval int64
	Node_type     int

	// division = unix_time / interval
	Poll_div int64
}

type PollingTask struct {
	Nodes []*Node
}

func (p *PollingTask) Load() {
	// start := time.Now().Unix()
	sql := fmt.Sprintf(`
		SELECT id,
		       hostname,
		       type,
		       poll_enabled,
		       poll_interval 
		  FROM res_node`)
	// log.Println(sql)

	// 清空slice
	p.Nodes = p.Nodes[:0]

	if rows, err := GLB_sql.Query(sql); err == nil {
		for rows.Next() {
			node := Node{}
			rows.Scan(
				&node.Id,
				&node.Hostname,
				&node.Node_type,
				&node.Poll_enabled,
				&node.Poll_interval,
			)
			p.Nodes = append(p.Nodes, &node)
			fmt.Printf("\nid=%d, host=%s\n", node.Id, node.Hostname)
		}
		rows.Close()
	}

}

func (p *PollingTask) PollingTick() {

	secs := int64(time.Now().Unix())
	for _, node := range p.Nodes {
		// fmt.Println(index, node)
		fmt.Printf(".")

		div := secs / node.Poll_interval
		mod := secs % node.Poll_interval

		if mod == 0 || div > node.Poll_div {

			jsonObj, _ := json.Marshal(map[string]interface{}{
				"timestamp": secs,
				"node":      node,
			})

			fmt.Println("\nSchedule Task... ", string(jsonObj))

			// push task info to redis list
			pong, err := GLB_redis.Ping().Result()
			fmt.Println(pong, err)
			if err := GLB_redis.RPush("polling_task", string(jsonObj)).Err(); err != nil {
				panic(err)
			}

			node.Poll_div = div
		}

	}

}
