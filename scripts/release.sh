#! /bin/bash

if ! [[ -d keys ]]; then
    mkdir keys
fi

if ! [[ -d keys/jwt ]]; then
    mkdir keys/jswt
fi

if ! [[ -f keys/jwt/private.key && -f keys/jwt/public.key ]]; then
    openssl ecparam -genkey -name prime256v1 -noout -out keys/jwt/private.key
    openssl ec -in keys/jwt/private.key -pubout -out keys/jwt/public.key
fi

if ! [[ -d databases ]]; then
    mkdir databases
fi
