
## Database Setup
#### Install system dependencies
`brew install gdal --with-postgresql`

#### Install PostGIS db 
Follow directions [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.html#Appendix.PostgreSQL.CommonDBATasks.PostGIS) to install and configure PostGIS on Amazon RDS.  

#### Configure db connection
Edit ~/.pgpass, adding the following:
`<hostname>:5432:*:<master_username>:<master_password>`
     
#### Test connection
`psql -h <hostname> -p 5432 -U <master_username> <dbname> `

#### Download data
Download page: https://data.sfgov.org/City-Infrastructure/Street-Sweeper-Scheduled-Routes-Zipped-Shapefile-F/wwci-6uqu
Direct link: http://apps.sfgov.org/datafiles/view.php?file=PublicWorks/sfsweeproutes.zip

#### Import data into db
`ogr2ogr -f "PostgreSQL" -a_srs "EPSG:2227" PG:"host=<db_hostname> user=<db_username> dbname=<dbname>" /path/to/sfsweeproutes.shp`
I wasn't able to get ogr2ogr to work with the remote, RDS db instance. I ended up importing to a local db, then restored to RDS instance with the following commands:
`pg_dump  -t sfsweeproutes --no-owner sam > sfsweeproutes.dump.sql`
`psql -h <remote_hostname> -p 5432 -U <master_username> <dbname> -f sfsweeproutes.dump.sql`

I also had to run the following in psql to quiet warning messages:
`ALTER DATABASE <dbname> SET client_min_messages TO WARNING;`
