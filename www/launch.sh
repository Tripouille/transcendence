#su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
cd /www
rm -rf /www/tmp/pids/server.pid
/usr/bin/rails s -b '0.0.0.0' -p 80