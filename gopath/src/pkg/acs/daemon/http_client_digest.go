package daemon

import (
	"crypto/md5"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type myjar struct {
	jar map[string][]*http.Cookie
}

func (p *myjar) SetCookies(u *url.URL, cookies []*http.Cookie) {
	p.jar[u.Host] = cookies
}

func (p *myjar) Cookies(u *url.URL) []*http.Cookie {
	return p.jar[u.Host]
}

func HttpBasicAuth(username string, password string, uri string) (bool, error) {
	var req *http.Request
	var resp *http.Response
	var err error
	client := &http.Client{}

	req, err = http.NewRequest("GET", uri, nil)
	if err != nil {
		log.Println(err.Error())
		return false, err
	}

	// 设置http基本认证header
	k := fmt.Sprintf("%s:%s", username, password)
	AuthHeader := fmt.Sprintf("Basic %s", base64.StdEncoding.EncodeToString([]byte(k)))
	req.Header.Set("Authorization", AuthHeader)
	log.Println(req.Header)

	resp, err = client.Do(req)
	if err != nil {
		log.Println(err.Error())
		return false, err
	}
	resp.Body.Close()

	if resp.StatusCode == 401 {
		log.Printf("get %s authorization faild\n", uri)
	}

	return resp.StatusCode == 200, err
}

func HttpDigestAuth(username string, password string, uri string) (bool, error) {
	client := &http.Client{}
	jar := &myjar{}
	jar.jar = make(map[string][]*http.Cookie)
	client.Jar = jar
	var req *http.Request
	var resp *http.Response
	var err error
	req, err = http.NewRequest("GET", uri, nil)
	resp, err = client.Do(req)
	if err != nil {
		return false, err
	}
	if resp.StatusCode == 401 {
		var authorization map[string]string = DigestAuthParams(resp)
		realmHeader := authorization["realm"]
		qopHeader := authorization["qop"]
		nonceHeader := authorization["nonce"]
		opaqueHeader := authorization["opaque"]
		realm := realmHeader
		// A1
		h := md5.New()
		A1 := fmt.Sprintf("%s:%s:%s", username, realm, password)
		io.WriteString(h, A1)
		HA1 := fmt.Sprintf("%x", h.Sum(nil))

		// A2
		h = md5.New()
		A2 := fmt.Sprintf("GET:%s", "/auth")
		io.WriteString(h, A2)
		HA2 := fmt.Sprintf("%x", h.Sum(nil))

		// response
		cnonce := RandomKey()
		response := H(strings.Join([]string{HA1, nonceHeader, "00000001", cnonce, qopHeader, HA2}, ":"))

		// now make header
		AuthHeader := fmt.Sprintf(`Digest username="%s", realm="%s", nonce="%s", uri="%s", cnonce="%s", nc=00000001, qop=%s, response="%s", opaque="%s", algorithm=MD5`,
			username, realmHeader, nonceHeader, "/auth", cnonce, qopHeader, response, opaqueHeader)
		req.Header.Set("Authorization", AuthHeader)
		resp, err = client.Do(req)
	} else {
		return false, fmt.Errorf("response status code should have been 401, it was %v", resp.StatusCode)
	}
	return resp.StatusCode == 200, err
}

/*
 Parse Authorization header from the http.Request. Returns a map of
 auth parameters or nil if the header is not a valid parsable Digest
 auth header.
*/
func DigestAuthParams(r *http.Response) map[string]string {
	s := strings.SplitN(r.Header.Get("Www-Authenticate"), " ", 2)
	if len(s) != 2 || s[0] != "Digest" {
		return nil
	}

	result := map[string]string{}
	for _, kv := range strings.Split(s[1], ",") {
		parts := strings.SplitN(kv, "=", 2)
		if len(parts) != 2 {
			continue
		}
		result[strings.Trim(parts[0], "\" ")] = strings.Trim(parts[1], "\" ")
	}
	return result
}
func RandomKey() string {
	k := make([]byte, 12)
	for bytes := 0; bytes < len(k); {
		n, err := crand.Read(k[bytes:])
		if err != nil {
			panic("rand.Read() failed")
		}
		bytes += n
	}
	return base64.StdEncoding.EncodeToString(k)
}

/*
 H function for MD5 algorithm (returns a lower-case hex MD5 digest)
*/
func H(data string) string {
	digest := md5.New()
	digest.Write([]byte(data))
	return fmt.Sprintf("%x", digest.Sum(nil))
}

func Md5HexString(data string) string {
	digest := md5.New()
	digest.Write([]byte(data))
	return hex.EncodeToString(digest.Sum(nil))
}

//=================================== for ACS http digest auth ====================================

func CalculateNonce(realm string) string {
	fmtDate := time.Now().Format("2006:01:02:15:04:05")
	// log.Println(fmtDate)

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	randomStr := ""
	for i := 0; i < 12; i++ {
		randomStr = fmt.Sprintf("%s%d", randomStr, r.Intn(10))
	}
	// log.Println(randomStr)

	nonceInput := fmt.Sprintf("%s:%s:%s", fmtDate, realm, randomStr)
	// log.Println(nonceInput)

	md5hex := Md5HexString(nonceInput)
	// log.Println(md5hex)

	b64 := base64.StdEncoding.EncodeToString([]byte(md5hex))
	// log.Println(b64)
	return b64
}

func GetOpaque(domain string, nonce string) string {
	instr := fmt.Sprintf("%s:%s", domain, nonce)
	// log.Println(instr)
	md5hex := Md5HexString(instr)
	// log.Println(md5hex)
	b64 := base64.StdEncoding.EncodeToString([]byte(md5hex))
	// log.Println(b64)
	return b64
}

func GenDigestAuthResponseHeader(realm string, domain string) string {
	nonce := CalculateNonce(realm)
	opaque := GetOpaque(domain, nonce)

	return fmt.Sprintf("Digest realm=\"%s\", nonce=\"%s\", opaque=\"%s\", qop=\"auth\"",
		realm,
		nonce,
		opaque,
	)
}

func GenHttpDigestResponse(username, password, realm, request_method, request_path, nonce, nc, cnonce, qop string) string {
	a1 := fmt.Sprintf("%s:%s:%s", username, realm, password)
	// log.Println(a1)
	ha1 := Md5HexString(a1)
	// log.Println(ha1)
	a2 := fmt.Sprintf("%s:%s", request_method, request_path)
	// log.Println(a2)
	ha2 := Md5HexString(a2)
	// log.Println(ha2)
	a3 := fmt.Sprintf("%s:%s:%s:%s:%s:%s",
		ha1,
		nonce,
		nc,
		cnonce,
		qop,
		ha2,
	)
	// log.Println(a3)
	response := Md5HexString(a3)
	// log.Println("response=", response)
	return response
}
