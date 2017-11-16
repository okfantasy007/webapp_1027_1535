import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import json
import sys
import xmltodict

from hashlib import md5
# import md5
from tornado.escape import utf8

from tornado.options import define, options
define("port", default=7547, help="run on the given port", type=int)

g_cwmp_sessions = {}
g_realm = 'ACSSimTool'
g_username = '1234'
g_password = '5678'

g_auth_response = """<SOAP-ENV:Envelope
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
    xmlns:cwmp="urn:dslforum-org:cwmp-1-0"    
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    
  <SOAP-ENV:Header>
       <cwmp:ID soap:mustUnderstand="1"></cwmp:ID>       
  </SOAP-ENV:Header>  
  <SOAP-ENV:Body>
        <cwmp:InformResponse>
            <MaxEnvelopes>5</MaxEnvelopes>
        </cwmp:InformResponse>

  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>"""


getParameterValues = """<?xml version="1.0" encoding="utf-8"?>

<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:cwmp="urn:dslforum-org:cwmp-1-0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SOAP-ENV:Header>
    <cwmp:ID SOAP-ENV:mustUnderstand="1">ID:intrnl.unset.id.GetParameterValues1465805845868.26156792</cwmp:ID>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
    <cwmp:GetParameterValues>
      <ParameterNames SOAP-ENC:arrayType="xsd:string[4]">
        <string>InternetGatewayDevice.ManagementServer.PeriodicInformInterval</string>
        <string>InternetGatewayDevice.ManagementServer.PeriodicInformEnable</string>
        <string>InternetGatewayDevice.LANDeviceNumberOfEntries</string>
        <string>InternetGatewayDevice.WANDeviceNumberOfEntries</string>
      </ParameterNames>
    </cwmp:GetParameterValues>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>"""


import base64
import hashlib
import time
import random


def calculateNonce():
    fmtDate = time.strftime(r"%Y:%m:%d:%H:%M:%S")
    print fmtDate
    randomStr = ''.join([random.choice('0123456789') for x in range(12)])
    print randomStr
    nonceInput = "%s:raisecomAcs:%s" % (fmtDate, randomStr)
    print nonceInput
    md5hex = hashlib.md5(nonceInput).hexdigest()
    print md5hex
    b64 = base64.b64encode(md5hex)
    return b64


def getOpaque(domain, nonce):
    instr = "%s:%s" % (domain, nonce)
    md5hex = hashlib.md5(instr).hexdigest()
    b64 = base64.b64encode(md5hex)
    return b64


def httpDigestResponse(username, password, realm, request_method, request_path, nonce, nc, cnonce, qop):
    a1 = utf8('%s:%s:%s' % (username, realm, password))
    ha1 = md5(a1).hexdigest()
    a2 = utf8('%s:%s' % (request_method, request_path))
    ha2 = md5(a2).hexdigest()
    a3 = utf8('%s:%s:%s:%s:%s:%s' % (ha1, nonce, nc, cnonce, qop, ha2))
    return md5(a3).hexdigest()


def httpDigestCheck(headers, request_method, request_path):
    auth_header = headers.get('Authorization', None)
    if auth_header is not None:

        print json.dumps(g_cwmp_sessions, indent=4)
        print auth_header
        auth_mode, params = auth_header.split(' ', 1)
        assert auth_mode == 'Digest'
        param_dict = {}
        for pair in params.split(','):
            k, v = pair.strip().split('=', 1)
            if v[0] == '"' and v[-1] == '"':
                v = v[1:-1]
            param_dict[k] = v

        print json.dumps(param_dict, indent=4)

        digest = httpDigestResponse(
            g_username, g_password, g_realm,
            request_method, request_path,
            param_dict['nonce'],
            param_dict['nc'],
            param_dict['cnonce'],
            param_dict['qop']
        )

        print "digest----", digest, param_dict['response']
        if digest == param_dict['response']:
            print "########### ok"


class IndexHandler(tornado.web.RequestHandler):

    def get(self):
        greeting = self.get_argument('greeting', 'Hello')
        self.write(greeting + ', friendly user!')

    def prepare(self):
        print "--------- prepare -------->"

    def on_finish(self):
        print "<--------- on_finish --------"

    def on_connection_close(self):
        print "<--------- on_connection_close --------"

    def post(self):
        # print dir(self)
        # print dir(self.request)
        print "---------ape header-------->"
        # print self.request.headers
        header = self.request.headers.get('Authorization', None)
        print header
        print "<--------"

        print "--------ape body------->"
        print self.request.body

        if self.request.body.strip() != '':
            res = xmltodict.parse(self.request.body)
            # print "###########", json.dumps(res, indent=4)

        # print "###########", json.dumps(res['SOAP-ENV:Envelope'], indent=4)
        # print "###########",
        # json.dumps(res['SOAP-ENV:Envelope']['SOAP-ENV:Header'], indent=4)
        print "<--------"

        # httpDigestCheck(self.request.headers,self.request.method, self.request.path)

        auth_header = self.request.headers.get('Authorization', None)
        if auth_header is not None:

            print json.dumps(g_cwmp_sessions, indent=4)
            print auth_header

            auth_mode, params = auth_header.split(' ', 1)
            assert auth_mode == 'Digest'
            param_dict = {}
            for pair in params.split(','):
                k, v = pair.strip().split('=', 1)
                if v[0] == '"' and v[-1] == '"':
                    v = v[1:-1]
                param_dict[k] = v

            # print json.dumps(param_dict, indent=4)

            digest = httpDigestResponse(
                g_username, g_password, g_realm,
                self.request.method, self.request.path,
                param_dict['nonce'],
                param_dict['nc'],
                param_dict['cnonce'],
                param_dict['qop']
            )

            print "digest----", digest, param_dict['response']
            print g_username, g_password, g_realm, \
                self.request.method, self.request.path, \
                param_dict['nonce'], \
                param_dict['nc'], \
                param_dict['cnonce'], \
                param_dict['qop']
                
            if digest == param_dict['response']:
                if not g_cwmp_sessions.has_key(param_dict['nonce']):

                    result = xmltodict.parse(self.request.body)
                    # print result
                    # print "###########", json.dumps(result, indent=4)
                    # print "###########",
                    # json.dumps(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'],
                    # indent=4)

                    g_cwmp_sessions[param_dict['nonce']] = {
                        "time": time.time(),
                        "status": "connected",
                        "digest": param_dict,
                        "inform": result
                    }
                    self.write(g_auth_response)
                    print "################ new session %s added!" % param_dict['nonce']
                else:
                    digest = g_cwmp_sessions[param_dict['nonce']]['digest']
                    digest['nc'] = param_dict['nc']
                    print "################ session %s phase %s link created!" % (digest['nonce'], digest['nc'])

                    content_length = self.request.headers.get(
                        'Content-Length', -1)
                    print "content_length", content_length
                    if content_length == '0':
                        print "################ session %s phase %s link created!" % (digest['nonce'], digest['nc'])
                        print "----CPE---->", getParameterValues
                        self.write(getParameterValues)
                    else:
                        self.write("")
                        print "################ session %s closed!" % (digest['nonce'])
                        del g_cwmp_sessions[digest['nonce']]

            else:
                self.set_status(401)
                self.set_header('WWW-Authenticate', auth_header)
                self.write("")
        else:
            host = self.request.headers.get('Host', '127.0.0.1')
            print "host:",host
            nonce = calculateNonce()
            opaque = getOpaque(host, nonce)

            self.set_status(401)
            w_header = 'Digest realm="%s", nonce="%s", opaque="%s", qop="auth"' % (
                g_realm, nonce, opaque)
            self.set_header('WWW-Authenticate', w_header)
            print "################## WWW-Authenticate ################\n", w_header
            self.write("")


def delayed_print():
    print "def delayed_print(s):"

if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = tornado.web.Application(handlers=[(r"/acs", IndexHandler)])
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.PeriodicCallback(delayed_print, 2000).start()
    tornado.ioloop.IOLoop.instance().start()
