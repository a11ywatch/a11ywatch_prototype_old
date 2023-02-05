#!/bin/sh

REMOTE=$1

if [ "$REMOTE" == "web" ]; then
	git subtree push --prefix web web master
else if [ "$REMOTE" == "api" ]; then
	git subtree push --prefix api api master
else if [ "$REMOTE" == "mav" ]; then
	git subtree push --prefix mav mav master
else if [ "$REMOTE" == "cdn-server" ]; then
	git subtree push --prefix cdn-server cdn-server master
else if [ "$REMOTE" == "watcher" ]; then
	git subtree push --prefix watcher watcher master
else if [ "$REMOTE" == "iframe-server" ]; then
	git subtree push --prefix iframe-server iframe-server master
else if [ "$REMOTE" == "example-site" ]; then
	git subtree push --prefix example-site example-site master
else
	echo "No remote specified or set. Use 'git remote add alias path' for more info look up adding git remotes."
fi
