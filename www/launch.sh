su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
chown -R postgres:postgres /var/lib/postgresql/data
chmod -R 700 /var/lib/postgresql/data
/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf
cd /www
rm -rf /www/tmp/pids/server.pid
/usr/bin/rails s -b '0.0.0.0' -p 80