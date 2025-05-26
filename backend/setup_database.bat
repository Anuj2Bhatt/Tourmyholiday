@echo off
echo Creating database and tables...
mysql -u root -e "source create_database.sql"
echo Done!
pause 