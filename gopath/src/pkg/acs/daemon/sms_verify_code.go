package daemon

import (
    "crypto/sha1"
    "crypto/tls"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/http/cookiejar"
    "strconv"
    "strings"

    "time"
)

type msgCodeInfo struct {
    Code int    `json:"code"`
    Msg  string `json:"msg"`
    Obj  string `json:"obj"`
}

type verifyCode struct {
    Code int `json:"code"`
}

var (
    verifyurl = "https://api.netease.im/sms/sendtemplate.action"
    // appKey    = "31f2abc13170db6f82497a73d87011ed"
    // appSecret = "fc9b800454ff"
    nonce     = "raisecom"
    // templateid = "3057110"
)

func genSHA1(sec, nonce, curtme string) string {
    var sum = sec + nonce + curtme
    h := sha1.New()
    h.Write([]byte(sum))
    bs := h.Sum(nil)
    sha := fmt.Sprintf("%x", bs)
    return sha
}

func VerifyCode(phone string, code string) (int, string) {
    sql := fmt.Sprintf(`SELECT * FROM portal_sms_verify LIMIT 1`)
    users, err := QuerySql(sql)
    if err != nil || len(users) != 1 {
        return 804, "SMS send failure !"
    }
    appKey := users[0]["appkey"]
    appSecret := users[0]["appsecret"]
    templateid :=users[0]["templateid"]
    
    tr := &http.Transport{
        TLSClientConfig:    &tls.Config{InsecureSkipVerify: true},
        DisableCompression: true,
    }
    
    client := http.Client{Transport: tr}
    client.Jar, _ = cookiejar.New(nil)

    req, err := http.NewRequest("POST", verifyurl, strings.NewReader(fmt.Sprintf("templateid=%s&mobiles=[\"%s\"]&params=[\"%s\"]", templateid, phone, code)))
    if err != nil {
        return 804, "SMS send failure !"
    }
    
    var curTime = strconv.Itoa(int(time.Now().Unix()))
    var checkSum = genSHA1(appSecret, nonce, curTime)

    req.Header.Add("AppKey", appKey)
    req.Header.Add("Nonce", nonce)
    req.Header.Add("CurTime", curTime)
    req.Header.Add("CheckSum", checkSum)
    req.Header.Add("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
    
    resp, err := client.Do(req) //发送
    if err != nil {
        return 804, "SMS send failure !"
    }
    
    defer resp.Body.Close() //一定要关闭resp.Body
    data, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return 804, "SMS send failure !"
    }
    
    var ret verifyCode
    err = json.Unmarshal(data, &ret)
    if err != nil {
        return 804, "SMS send failure !"
    }
    
    if ret.Code == 200 {
        return 0, "SMS send success !"
    } else {
        return 804, "SMS send failure !"
    }
}
