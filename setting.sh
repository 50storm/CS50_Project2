#!/bin/bash

echo "--settiing for--flask development [application.py]---"
export FLASK_APP=application.py
export FLASK_DEBUG=0

echo "---printenv---"
echo "environemt valus that flask requires"
printenv FLASK_APP
printenv FLASK_DEBUG



echo "---setttin ends---"

flask run
exit 0
