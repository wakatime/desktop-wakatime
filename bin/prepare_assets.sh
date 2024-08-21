#!/bin/bash

set -e

# ensure existence of release folder
if ! [ -d "./release" ]; then
    mkdir ./release
fi

# ensure zip is installed
if [ "$(which zip)" = "" ]; then
    apt-get update && apt-get install -y zip
fi

# add execution permission
chmod 750 ./release/wakatime-linux-x86_64.AppImage
chmod 750 ./release/wakatime-linux-arm64.AppImage
chmod 750 ./release/wakatime-windows-x64.exe
chmod 750 ./release/wakatime-windows-arm64.exe

# create archives
zip -j ./release/wakatime-linux-x86_64.zip ./release/wakatime-linux-x86_64.AppImage
zip -j ./release/wakatime-linux-arm64.zip ./release/wakatime-linux-arm64.AppImage
zip -j ./release/wakatime-windows-x64.zip ./release/wakatime-windows-x64.exe
zip -j ./release/wakatime-windows-arm64.zip ./release/wakatime-windows-arm64.exe

# remove executables
rm ./release/wakatime-linux-x86_64.AppImage
rm ./release/wakatime-linux-arm64.AppImage
rm ./release/wakatime-windows-x64.exe
rm ./release/wakatime-windows-arm64.exe

# calculate checksums
for file in  ./release/*; do
	checksum=$(sha256sum "${file}" | cut -d' ' -f1)
	filename=$(echo "${file}" | rev | cut -d/ -f1 | rev)
	echo "${checksum} ${filename}" >> ./release/checksums_sha256.txt
done
