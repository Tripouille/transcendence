su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
mkdir /var/lib/postgresql/data/pg_tblspc
chown -R postgres:postgres /var/lib/postgresql/data
chmod -R 700 /var/lib/postgresql/data
cd /www
rm -rf /www/tmp/pids/server.pid
/usr/bin/rails s -b '0.0.0.0' -p 80