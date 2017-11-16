pid=`ps -ef | grep 'sb_snmp' | grep -v grep | awk '{print $2}'`
if [ ${pid} ]; then
   echo "do nothing"
else
   echo "need start"
   pm2 start sb_snmp
fi
