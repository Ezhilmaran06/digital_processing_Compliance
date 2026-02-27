@echo off
echo Starting diagnostics... > diag_output.txt
echo Node version: >> diag_output.txt
node -v >> diag_output.txt 2>&1
echo NPM version: >> diag_output.txt
npm -v >> diag_output.txt 2>&1
echo Directory listing: >> diag_output.txt
dir >> diag_output.txt
echo Running db_probe.js: >> diag_output.txt
node db_probe.js >> diag_output.txt 2>&1
echo Done. >> diag_output.txt
