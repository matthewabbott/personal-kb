#!/bin/bash

# Logging
exec 1>> /var/log/github-cache.log 2>&1
echo "$(date): Starting GitHub cache update"

SITE_DIR="/var/www/html/personal-kb"
DATA_DIR="$SITE_DIR/data"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Fetch repository data and sort by pushed_at date
curl -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/users/matthewabbott/repos?per_page=100" \
     | jq 'sort_by(.pushed_at) | reverse' \
     > "$DATA_DIR/repos.json"

echo "$(date): Finished GitHub cache update"

# Add with:
#   crontab -e
#   0 * * * * /root/personal-kb/update-github-cache.sh