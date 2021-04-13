su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
chown -R postgres:postgres /var/lib/postgresql/data
chmod 700 -R /var/lib/postgresql/data
cd /www
rm -rf /www/tmp/pids/server.pid
/usr/bin/rails s -b '0.0.0.0' -p 80