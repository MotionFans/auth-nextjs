import Loading from "@/components/navigating/in-progress/loading";
import { useEffect, useRef } from "react";
import { credentials_object } from "@/global";

export default function GetAuth() {
    const shouldSend = useRef(true);

    async function handle_request_for_credentials(url, public_key) {
        const credentials_objectv = await credentials_object();
        if (!credentials_objectv) {
            alert("You aren't logged in.");
            return;
        }
        if (document.referrer) {
            const referrer = new URL(document.referrer);
            if (referrer.hostname != "motionfans.com" && referrer.hostname != "127.0.0.1" && !referrer.hostname.endsWith(".motionfans.com")) {
                alert("A referrer was specified, and it is not a motionfans webpage.");
                return;
            }
        }

        let url_data = null;
        try {
            url_data = new URL(url);
            if (url_data.hostname != "127.0.0.1" && url_data.hostname != "motionfans.com" && !url_data.hostname.endsWith(".motionfans.com")) {
                alert("The return_url is not a motionfans webpage.");
                return;
            }
        } catch (error) {
            alert("Bad URL provided.");
            return;
        }

        // just in the future if MotionFans ever proxies return URLs for some very stupid reason and this gets caught up in there, that would allow credentials to go to bad webpages.
        let url_data_params = new URLSearchParams(url_data.search);
        if (url_data_params.get("return_url")) {
            alert("The specified return_url cannot have a return_url within it.");
            return;
        }
        
        let keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
        
        // Export the public key as PEM base64
        // let publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        // let publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
        let publicKeyPem = public_key;

        // const params = new URLSearchParams({
        //     return_url: "https://motionfans.com",
        //     public_key: publicKeyPem
        // })
        // alert(params.toString());
        
        // Import the public key from PEM base64
        let publicKeyBase64 = publicKeyPem.split("\n")[1];
        let publicKey = atob(publicKeyBase64);
        let publicKeyArray = new Uint8Array(publicKey.length);
        for (let i = 0; i < publicKey.length; i++) {
            publicKeyArray[i] = publicKey.charCodeAt(i);
        }
        let publicKeyImported = await window.crypto.subtle.importKey(
            "spki",
            publicKeyArray,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
        
        let objectString = JSON.stringify(credentials_objectv);
        let objectBuffer = new TextEncoder().encode(objectString);
        let encryptedObject = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKeyImported,
            objectBuffer
        );

        // encryptedObject.byteLength

        // let encryptedObjectBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedObject)));

        url_data.searchParams.set("credentials", new TextEncoder().encode(new Uint8Array(encryptedObject)));

        window.location.href = url_data.href;
    }

    useEffect(() => {
        if (shouldSend.current != true) { return; }
        shouldSend.current = false;

        const params = new URLSearchParams(document.location.search);
        const return_url = params.get("return_url");
        const private_key = params.get("public_key");

        handle_request_for_credentials(return_url, private_key);
    });

    return (
        <Loading/>
    )
}