#! /bin/bash

if ! [[ -d keys ]]; then
    mkdir keys
fi

if ! [[ -d keys/jwt ]]; then
    mkdir keys/jwt
fi

if ! [[ -f keys/jwt/private.key && -f keys/jwt/public.key ]]; then
    echo "Generating ECDSA keys for JWT..."
    openssl ecparam -genkey -name prime256v1 -noout -out keys/jwt/private.key
    openssl ec -in keys/jwt/private.key -pubout -out keys/jwt/public.key
    echo "Complete"
else
    echo "Keys already exist"
fi

if ! [[ -d databases ]]; then
    mkdir databases
fi
