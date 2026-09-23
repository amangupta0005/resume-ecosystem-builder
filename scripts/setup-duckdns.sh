#!/bin/bash
(crontab -l 2>/dev/null | grep -v "duckdns"; echo "*/5 * * * * curl -s 'https://www.duckdns.org/update?domains=aman-resumes&token=700eec5c-37f1-483d-9656-4d5534ad81f4&ip=' >/dev/null 2>&1") | crontab -
echo "Active crontab:"
crontab -l
