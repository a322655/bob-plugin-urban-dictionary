#!/bin/bash

# Cleanup any previous builds
rm -f release/bob-plugin-urban-dictionary.zip release/bob-plugin-urban-dictionary.bobplugin

# Make sure release directory exists
mkdir -p release

# Package the plugin
echo "Packaging Urban Dictionary plugin..."
cd src || exit 1
zip -r ../release/bob-plugin-urban-dictionary.zip ./*
cd .. || exit 1

# Rename to .bobplugin format
mv release/bob-plugin-urban-dictionary.zip release/bob-plugin-urban-dictionary.bobplugin

echo "Plugin built successfully: release/bob-plugin-urban-dictionary.bobplugin"
echo "You can now install this plugin in Bob by double-clicking the .bobplugin file."

exit 0
