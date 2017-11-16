gopath = ~/gopath
pkg_path = $(gopath)/pkg/linux_amd64

all : producer consumer 

producer : $(pkg_path)/nms/polling/producer.a producer.go 
	go build producer.go

consumer : $(pkg_path)/nms/polling/consumer.a consumer.go 
	go build consumer.go

$(pkg_path)/nms/polling/producer.a : $(pkg_path)/nms/api.a $(gopath)/src/nms/polling/producer/*.go
	go install nms/polling/producer

$(pkg_path)/nms/polling/consumer.a : $(pkg_path)/nms/api.a $(gopath)/src/nms/polling/consumer/*.go
	go install nms/polling/consumer

$(pkg_path)/nms/api.a : $(gopath)/src/nms/api/*.go
	go install nms/api

clean:
	rm -rf $(pkg_path)/nms/api.a $(pkg_path)/nms/polling/producer.a $(pkg_path)/nms/polling/consumer.a producer consumer
