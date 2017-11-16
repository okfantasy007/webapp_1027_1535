mysqldump -h 172.16.75.98 -uroot -pasd\`12 db_msp > db_msp.sql
svn commit db_msp.sql -m "backup database"
