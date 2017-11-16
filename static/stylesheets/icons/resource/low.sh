#!/bin/bash
for file in `find . -type f -name "*" | grep '[A-Z]' `
do
	str=`echo $file|tr 'A-Z' 'a-z'`
	echo $file 
	mv $file $str 
done
