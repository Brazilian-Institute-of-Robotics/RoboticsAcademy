#!/bin/bash

usage="$(basename "$0") [-h] [--debug] [--logs] [--no-server] [--server] [--bt-studio] \n\n

optional arguments:\n
\t  -h  show this help message and exit\n
\t  --debug run bash inside RADI\n
\t  --logs record logs and run RADI\n
\t  --no-server run RADI without webserver
\t  --server run RADI with webserver
\t  --bt-studio run BT Studio"

debug=false
log=false
webserver=true
btstudio=false

while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -h | --help )
    echo -e $usage
    exit
    ;;
  -d | --debug )
    shift; debug=true
    ;;
  -l | --logs )
    shift; log=true
    ;;
  -ns | --no-server )
    webserver=false
    btstudio=false
    ;;
  -s | --server )
    webserver=true
    btstudio=false
    ;;
  -bt | --bt-studio )
    btstudio=true
    webserver=false
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi

# # If DRI_NAME is empty, run set_dri_name to try and set it automatically
if [ -z "${DRI_NAME}" ]; then
    source set_dri_name.sh
fi

cd /

# Create new django's migrations when necessary
python3 /RoboticsAcademy/manage.py makemigrations

# Execute django's migrations
python3 /RoboticsAcademy/manage.py migrate

# Execute db's seeds
bash /RoboticsAcademy/scripts/Seed/run_seeds.sh

cd /RoboticsAcademy

# Execute collectstatic
python3 /RoboticsAcademy/manage.py collectstatic --noinput --verbosity 0 > /dev/null

cd /

# Start Redis in second plane
redis-server &

if [ $btstudio == true ]; then
    runserver="python3 /BtStudio/manage.py runserver 0.0.0.0:7164"
else
    runserver=""
fi

if [ $webserver == true ]; then
    runserver="python3 /RoboticsAcademy/manage.py runserver 0.0.0.0:7164"
fi

# TEST LOGS
if [ $log == true ]; then
    DATE_TIME=$(date +%F-%H-%M) # FORMAT year-month-date-hours-mins
    mkdir -p /root/.roboticsacademy/log/$DATE_TIME/
    script -q -c "$runserver & \
                  celery -A academy worker --loglevel=info & \
                  celery -A academy beat --loglevel=info" \
          /root/.roboticsacademy/log/$DATE_TIME/manager.log
    cp -r /root/.ros/log/* /root/.roboticsacademy/log/$DATE_TIME/
else
    if [ $debug == true ]; then
      { bash ; }
    else
      cd /RoboticsAcademy
      if [ "$runserver" != "" ]; then
        $runserver &
        # $runserver > /var/log/django.log 2>&1 &
      fi
      
      celery -A academy worker --loglevel=info &
      celery -A academy beat --loglevel=info
    fi
fi
