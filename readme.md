# node-transfer
Message and file transfer application  

Minimalist user interface with command language

Login with json file

Work in progress...

## Usage

### Server
Run app.js in terminal
```
node bin/app.js
```
Follow prompt

### Client
Point URL to server  

Steps to connect

1. Drag and drap login json file(json file must contain name property) in main window or enter command --setuser [username]  
2. Enter command --connect

## Client commands

#### --setuser [username]
Set username

#### --connect
Connect to server

#### --createroom [room-name]
Create room

#### --setroom [room-name]
Join room

#### --rmroom [room-name]
Remove room

#### --listuser [username]
Get information about a user

#### --listsend
List hosted files

#### --rmsend [filename]
Remove hosted file

#### --accept [filename]
Download hosted file

## Test
In browser point URL to: path-to-server/test

## Install
```
npm install egul/node-transfer
```

## License
MIT
