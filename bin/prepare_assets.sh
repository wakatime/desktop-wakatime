#!/bin/bash

set -e

# ensure existence of release folder
if ! [ -d "./release" ]; then
    mkdir ./release
fi

# add execution permission
chmod 750 ./release/*.AppImage
chmod 750 ./release/*.exe

# calculate checksums
for file in  ./release/*; do
	checksum=$(sha256sum "${file}" | cut -d' ' -f1)
	filename=$(echo "${file}" | rev | cut -d/ -f1 | rev)
	echo "${checksum} ${filename}" >> ./release/checksums_sha256.txt
done
