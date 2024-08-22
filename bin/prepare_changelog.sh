#!/bin/bash

set -e

if [[ $# -ne 1 ]]; then
    echo 'incorrect number of arguments'
    exit 1
fi

# Read arguments
changelog=$(echo "$1" | tr -d \")

clean_up() {
    changelog="${changelog//\`/}"
    changelog="${changelog//\'/}"
    changelog="${changelog//\"/}"
}

replace_for_release() {
    changelog="${changelog//'%'/'%25'}"
    changelog="${changelog//$'\n'/'%0A'}"
    changelog="${changelog//$'\r'/'%0D'}"
}

parse_for_release() {
    changelog=$(awk 'f;/## Changelog/{f=1}' <<< "$changelog")
}

parse_for_release
clean_up
replace_for_release

echo "::set-output name=changelog::${changelog}"
