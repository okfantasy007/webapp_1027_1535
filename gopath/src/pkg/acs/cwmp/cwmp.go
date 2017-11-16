package cwmp

import (
	"crypto/rand"
	"encoding/xml"
	"fmt"
	"strings"
)

type SoapEnvelope struct {
	XMLName xml.Name
	Header  SoapHeader
	Body    SoapBody
}

type SoapHeader struct {
	Id string `xml:"ID"`
}
type SoapBody struct {
	CWMPMessage CWMPMessage `xml:",any"`
}

type CWMPMessage struct {
	XMLName xml.Name
}

type EventStruct struct {
	EventCode  string
	CommandKey string
}

type ParameterValueStruct struct {
	Name  string
	Value string
}

type ParameterInfoStruct struct {
	Name     string
	Writable string
}

type SetParameterValues_ struct {
	ParameterList []ParameterValueStruct `xml:"Body>SetParameterValues>ParameterList>ParameterValueStruct"`
	ParameterKey  string                 `xml:"Body>SetParameterValues>ParameterKey>string"`
}

type GetParameterValues_ struct {
	ParameterNames []string `xml:"Body>GetParameterValues>ParameterNames>string"`
}

type GetParameterNames_ struct {
	ParameterPath []string `xml:"Body>GetParameterNames>ParameterPath"`
	NextLevel     string   `xml:"Body>GetParameterNames>NextLevel"`
}

type GetParameterValuesResponse struct {
	ParameterList []ParameterValueStruct `xml:"Body>GetParameterValuesResponse>ParameterList>ParameterValueStruct"`
}

type SetParameterValuesResponse struct {
	Status string `xml:"Body>SetParameterValuesResponse>Status"`
}

type SetParameterValuesRequest struct {
	ParameterList []ParameterValueStruct `xml:"Body>SetParameterValues>ParameterList>ParameterValueStruct"`
}

type GetParameterNamesResponse struct {
	ParameterList []ParameterInfoStruct `xml:"Body>GetParameterNamesResponse>ParameterList>ParameterInfoStruct"`
}

type GetRPCMethodsResponse struct {
	MethodList []string `xml:"Body>GetRPCMethodsResponse>MethodList>string"`
}

type RebootResponse struct {
	RebootResponse string `xml:"Body>RebootResponse"`
}

type DownloadResponse_ struct {
	Status       int
	StartTime    string
	CompleteTime string
}

type DownloadResponse struct {
	DownloadResponse DownloadResponse_ `xml:"Body>DownloadResponse"`
}

type UploadResponse_ struct {
	Status       int
	StartTime    string
	CompleteTime string
}

type UploadResponse struct {
	UploadResponse UploadResponse_ `xml:"Body>UploadResponse"`
}

type FactoryResetResponse_ struct {
}

type FactoryResetResponse struct {
	FactoryResetResponse FactoryResetResponse_ `xml:"Body>FactoryResetResponse"`
}

type FaultDetail struct {
	FaultCode   string
	FaultString string
}

type FaultMessage struct {
	FaultDetail FaultDetail `xml:"Body>Fault>detail>Fault"`
}

type TransferComplete_ struct {
	CommandKey   string
	FaultStruct  FaultDetail
	StartTime    string
	CompleteTime string
}

type TransferComplete struct {
	TransferComplete TransferComplete_ `xml:"Body>TransferComplete"`
}

type CWMPInform struct {
	DeviceId      DeviceID               `xml:"Body>Inform>DeviceId"`
	Events        []EventStruct          `xml:"Body>Inform>Event>EventStruct"`
	ParameterList []ParameterValueStruct `xml:"Body>Inform>ParameterList>ParameterValueStruct"`
}

func (s *SoapEnvelope) KindOf() string {
	return s.Body.CWMPMessage.XMLName.Local
}

func (i *CWMPInform) GetEvents() string {
	res := ""
	for idx := range i.Events {
		res += i.Events[idx].EventCode
	}
	return res
}

func (i *CWMPInform) GetEventCode() string {
	res := ""
	for idx := range i.Events {
		res += i.Events[idx].EventCode
	}
	ary := strings.Split(res, " ")
	return strings.TrimSpace(ary[0])
}

func (i *CWMPInform) GetModelName() string {
	for idx := range i.ParameterList {
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.DeviceInfo.ModelName") {
			return i.ParameterList[idx].Value
		}
	}

	return ""
}

func (i *CWMPInform) GetConnectionRequestURL() string {
	for idx := range i.ParameterList {
		// valid condition for both tr98 and tr181
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.ManagementServer.ConnectionRequestURL") {
			return i.ParameterList[idx].Value
		}
	}

	return ""
}
func (i *CWMPInform) GetConnectionRequestUsername() *string {
	for idx := range i.ParameterList {
		// valid condition for both tr98 and tr181
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.ManagementServer.ConnectionRequestUsername") {
			return &i.ParameterList[idx].Value
		}
	}

	return new(string)
}
func (i *CWMPInform) GetConnectionRequestPassword() *string {
	for idx := range i.ParameterList {
		// valid condition for both tr98 and tr181
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.ManagementServer.ConnectionRequestPassword") {
			return &i.ParameterList[idx].Value
		}
	}

	return new(string)
}

func (i *CWMPInform) GetSoftwareVersion() string {
	for idx := range i.ParameterList {
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.DeviceInfo.SoftwareVersion") {
			return i.ParameterList[idx].Value
		}
	}

	return ""
}

func (i *CWMPInform) GetHardwareVersion() string {
	for idx := range i.ParameterList {
		if strings.HasSuffix(i.ParameterList[idx].Name, "Device.DeviceInfo.HardwareVersion") {
			return i.ParameterList[idx].Value
		}
	}

	return ""
}

func (i *CWMPInform) GetDataModelType() string {
	if strings.HasPrefix(i.ParameterList[0].Name, "InternetGatewayDevice") {
		return "TR098"
	} else if strings.HasPrefix(i.ParameterList[0].Name, "Device") {
		return "TR181"
	}

	return ""
}

type DeviceID struct {
	Manufacturer string
	OUI          string
	SerialNumber string
	ProductClass string
}

func SetHeaderMustUnderstand(soapMsg *string, mustUnderstand string) {
	*soapMsg = strings.Replace(*soapMsg, "{mustUnderstand}", mustUnderstand, -1)
}

func InformResponse(mustUnderstand string) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">%s</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:InformResponse>  
            <MaxEnvelopes>1</MaxEnvelopes>  
        </cwmp:InformResponse>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`, mustUnderstand)
}

func GetParameterValues(leaves []string) string {

	var ary []string
	for idx := range leaves {
		ary = append(ary, fmt.Sprintf(`<string>%s</string>`, leaves[idx]))
	}
	// <?xml version="1.0" encoding="UTF-8"?>
	msg := fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">
    <SOAP-ENV:Header>
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <cwmp:GetParameterValues>
        	<ParameterNames SOAP-ENC:arrayType="xsd:string[%1d]">
            	%s
            </ParameterNames>
        </cwmp:GetParameterValues>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`, len(leaves), strings.Join(ary, "\n            	"))

	return msg
}

func randToken() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

func SetParameterValues(data []map[string]interface{}) string {
	var ary []string
	for _, record := range data {
		for key, value := range record {
			ary = append(ary, fmt.Sprintf(`<ParameterValueStruct>  
                    <Name>%s</Name>  
                    <Value>%s</Value>  
                </ParameterValueStruct>`, key, value.(string)))
		}
	}

	msg := fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:SetParameterValues>  
            <ParameterList SOAP-ENC:arrayType="cwmp:ParameterValueStruct[%1d]">  
                %s
            </ParameterList>  
            <ParameterKey>%s</ParameterKey>  
        </cwmp:SetParameterValues>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`, len(data), strings.Join(ary, "\n                "), randToken())

	return msg
}

func GetParameterNames(root string, nextlevel string) string {
	return fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:GetParameterNames>  
            <ParameterPath>%s</ParameterPath>  
            <NextLevel>%s</NextLevel>  
        </cwmp:GetParameterNames>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`, root, nextlevel)
}

func GetRcpMethod() string {
	return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:GetRPCMethods></cwmp:GetRPCMethods>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`
}

func Reboot() string {
	return fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:Reboot>  
            <CommandKey>%s</CommandKey>  
        </cwmp:Reboot>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`, randToken())
}

func FactoryReset() string {
	return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:FactoryReset></cwmp:FactoryReset> 
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`
}

func Download(FileType, URL, Username, Password, FileSize, TargetFileName, DelaySeconds string) string {
	// 3 Vendor Configuration File
	// 1 Firmware Upgrade Image
	return fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
        <cwmp:Download>  
            <CommandKey>%s</CommandKey>  
            <FileType>%s</FileType>  
            <URL>%s</URL>  
            <Username>%s</Username>  
            <Password>%s</Password>
            <FileSize>%s</FileSize>  
            <TargetFileName>%s</TargetFileName>  
            <DelaySeconds>%s</DelaySeconds>  
            <SuccessURL></SuccessURL>
            <FailureURL></FailureURL>
        </cwmp:Download>  
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`,
		randToken(), FileType, URL, Username, Password, FileSize, TargetFileName, DelaySeconds)
}

func Upload(FileType, URL, Username, Password, DelaySeconds string) string {
	return fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
	xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
	<SOAP-ENV:Header>  
		<cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
	</SOAP-ENV:Header>  
	<SOAP-ENV:Body>
		<cwmp:Upload>
			<CommandKey>%s</CommandKey>
			<FileType>%s</FileType>
			<URL>%s</URL>
			<Username>%s</Username>
			<Password>%s</Password>
			<DelaySeconds>%s</DelaySeconds>
		</cwmp:Upload>
	</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`,
		randToken(), FileType, URL, Username, Password, DelaySeconds)
}

func CancelTransfer() string {
	return fmt.Sprintf(`<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"  
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsd="http://www.w3.org/2001/XMLSchema"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cwmp="urn:dslforum-org:cwmp-1-0">  
    <SOAP-ENV:Header>  
        <cwmp:ID SOAP-ENV:mustUnderstand="1">{mustUnderstand}</cwmp:ID>  
    </SOAP-ENV:Header>  
    <SOAP-ENV:Body>  
	    <cwmp:CancelTransfer>
	      <CommandKey>%s</CommandKey>
	    <cwmp:CancelTransfer/>
    </SOAP-ENV:Body>  
</SOAP-ENV:Envelope>`, randToken())
}
