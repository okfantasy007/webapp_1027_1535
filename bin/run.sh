#!/bin/bash
pid=`ps -ef | grep 'webapp' | grep -v grep | awk '{print $2}'`
if [ ${pid} ]; then
   echo "do nothing"
else
   echo "need start"
   pm2 start bin/www 
fi
