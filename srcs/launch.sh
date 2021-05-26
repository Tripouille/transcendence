su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf
rm -rf /www/tmp/pids/server.pid
/usr/bin/rails db:migrate
/usr/bin/rails s -b '0.0.0.0' -p 80
tail -f