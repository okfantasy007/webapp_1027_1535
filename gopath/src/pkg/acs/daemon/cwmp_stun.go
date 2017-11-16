package daemon

import (
	"encoding/hex"
	"fmt"
	"log"
	"net"
	"runtime"
	"strings"
)

const (
	// types for a stun message
	STUN_BINDING_REQUEST            = 0x0001
	STUN_BINDING_RESPONSE           = 0x0101
	STUN_BINDING_ERR_RESPONSE       = 0x0111
	STUN_SHARED_SECRET_REQUEST      = 0x0002
	STUN_SHARED_SECRET_RESPONSE     = 0x0102
	STUN_SHARED_SECRET_ERR_RESPONSE = 0x0112
	STUN_HEADER_SIZE                = 20

	// stun attributes
	ATTR_MAPPED_ADDRESS     = 0x0001
	ATTR_RESPONSE_ADDRESS   = 0x0002
	ATTR_CHANGE_REQUEST     = 0x0003
	ATTR_SOURCE_ADDRESS     = 0x0004
	ATTR_CHANGED_ADDRESS    = 0x0005
	ATTR_USERNAME           = 0x0006
	ATTR_PASSWORD           = 0x0007
	ATTR_MESSAGE_INTEGRITY  = 0x0008
	ATTR_ERROR_CODE         = 0x0009
	ATTR_UNKNOWN_ATTRIBUTES = 0x000a
	ATTR_REFLECTED_FROM     = 0x000b
	STUN_ATTR_HEADER_SIZE   = 4

	PROTOCOL_FAMILY_IPV4 = 0x0001
)

// Binary
type binary struct{}

func (binary) Int16(b []byte) int16 {
	return int16(b[1]) | int16(b[0])<<8
}

func (binary) Uint16(b []byte) uint16 {
	return uint16(b[1]) | uint16(b[0])<<8
}

func (binary) PutInt16(b []byte, v int16) {
	b[0] = byte(v >> 8)
	b[1] = byte(v)
}

func (binary) Int32(b []byte) int32 {
	return int32(b[3]) | int32(b[2])<<8 | int32(b[1])<<16 | int32(b[0])<<24
}

func (binary) PutInt32(b []byte, v int32) {
	b[0] = byte(v >> 24)
	b[1] = byte(v >> 16)
	b[2] = byte(v >> 8)
	b[3] = byte(v)
}

var Binary binary

//ParseAttrs parse attributes
func ParseAttrs(buf []byte) map[string]interface{} {
	var (
		attrType uint16
		length   uint16
		s        uint16 = 0
	)

	bufsize := uint16(len(buf))
	log.Println("buffer bytes:", buf)
	attributes := map[string]interface{}{}

	for s < bufsize {
		attrType = Binary.Uint16(buf[s : s+2])
		length = Binary.Uint16(buf[s+2 : s+4])
		s += 4
		switch attrType {
		case ATTR_USERNAME:
			attributes["USERNAME"] = strings.TrimSpace(string(buf[s : s+length]))
			log.Println("username", string(buf[s:s+length]))

		case ATTR_PASSWORD:
			attributes["PASSWORD"] = strings.TrimSpace(string(buf[s : s+length]))
			log.Println("password", string(buf[s:s+length]))

		default:
			log.Println("No use attrType:", attrType)
		}
		s += length
	}
	return attributes
}

type bindingRequest struct {
	Type   int16
	Length int16
	ID     []byte
	Attrs  map[string]interface{}
}

func (msg *bindingRequest) Decode(buf []byte) {
	bufsize := len(buf)
	fmt.Printf("len%d\n", bufsize)
	msg.Type = Binary.Int16(buf[0:2])
	log.Println("msg.Type", msg.Type)
	msg.Length = Binary.Int16(buf[2:4])
	fmt.Printf("msg length %d\n", msg.Length)
	msg.ID = buf[4:20]
	log.Println("msg id:" + hex.EncodeToString(msg.ID))
	log.Println("msg id bytes:", msg.ID)
	msg.Attrs = ParseAttrs(buf[20:bufsize])
	for k, v := range msg.Attrs {
		log.Println(k, " : ", v)
	}
}

type StunConn struct {
	Enable     bool
	Connection *net.UDPConn
	RemoteAddr *net.UDPAddr
	Username   string
	RequestId  []byte
}

func listen_udp(connection *net.UDPConn) {
	log.Println("listen STUN...")
	buffer := make([]byte, 1024)
	res := make([]byte, 1024)
	mlen := 0
	n, remoteAddr, err := 0, new(net.UDPAddr), error(nil)
	request := new(bindingRequest)
	for err == nil {
		n, remoteAddr, err = connection.ReadFromUDP(buffer)
		log.Println("from", remoteAddr.IP, remoteAddr.Port, remoteAddr.String(), remoteAddr.Network(), "-", buffer[:n])
		request.Decode(buffer[:n])

		// build stun response header
		Binary.PutInt16(res[0:], STUN_BINDING_RESPONSE)
		Binary.PutInt16(res[2:], 36)
		mlen = 4
		copy(res[4:], request.ID)
		mlen += len(request.ID)

		// build attibutes
		Binary.PutInt16(res[mlen:], ATTR_MAPPED_ADDRESS)
		Binary.PutInt16(res[mlen+2:], 8)
		Binary.PutInt16(res[mlen+4:], PROTOCOL_FAMILY_IPV4)
		Binary.PutInt16(res[mlen+6:], int16(remoteAddr.Port))
		copy(res[mlen+8:], remoteAddr.IP.To4())
		mlen += 12

		Binary.PutInt16(res[mlen:], ATTR_SOURCE_ADDRESS)
		Binary.PutInt16(res[mlen+2:], 8)
		Binary.PutInt16(res[mlen+4:], PROTOCOL_FAMILY_IPV4)
		Binary.PutInt16(res[mlen+6:], int16(remoteAddr.Port))
		copy(res[mlen+8:], remoteAddr.IP.To4())
		mlen += 12

		Binary.PutInt16(res[mlen:], ATTR_CHANGED_ADDRESS)
		Binary.PutInt16(res[mlen+2:], 8)
		Binary.PutInt16(res[mlen+4:], PROTOCOL_FAMILY_IPV4)
		Binary.PutInt16(res[mlen+6:], int16(remoteAddr.Port))
		copy(res[mlen+8:], remoteAddr.IP.To4())
		mlen += 12

		log.Println("request:", request)
		log.Println("RESPONSE:", res[0:mlen])
		connection.WriteTo(res[0:mlen], remoteAddr)

		SerialNumber := request.Attrs["PASSWORD"].(string)

		if cpe, exists := global_cpes.Get(SerialNumber); exists {

			cpe.StunConnection.Enable = stun_enable
			cpe.StunConnection.Connection = connection
			cpe.StunConnection.RemoteAddr = remoteAddr
			cpe.StunConnection.Username = request.Attrs["USERNAME"].(string)
			cpe.StunConnection.RequestId = request.ID[:]
			log.Println("Update SN:", SerialNumber, "STUN info!")

			// 设备心跳信息
			PushHeartBeatMessage(cpe.SerialNumber, remoteAddr.String())

			// log.Println("Waiting to send stunRequest.............")
			// time.Sleep(10 * time.Second)
			// stunRequest := fmt.Sprintf(`GET http://%s/acs?ts=%d&id=%d&un=%s&cn=%d&sig=%s HTTP/1.1`,
			// 	cpe.ServerAddrPort,
			// 	time.Now().Unix(),
			// 	time.Now().Unix(),
			// 	request.Attrs["USERNAME"].(string),
			// 	time.Now().Unix(),
			// 	hex.EncodeToString(request.ID),
			// )
			// log.Println("stunRequest:", stunRequest)
			// cpe.StunConnection.Connection.WriteTo([]byte(stunRequest), cpe.StunConnection.RemoteAddr)

		} else {
			log.Println("SN:", SerialNumber, "not found!")
		}

	}
	log.Println("listener failed - ", err)
}

func StartCwmpStund() {

	addr := net.UDPAddr{
		Port: stun_port,
		IP:   net.IP{0, 0, 0, 0},
	}
	connection, err := net.ListenUDP("udp", &addr)
	log.Println("ListenUDP:", addr)
	if err != nil {
		panic(err)
	}
	log.Println("num cpu=", runtime.NumCPU())
	for i := 0; i < runtime.NumCPU(); i++ {
		go listen_udp(connection)
	}
}
