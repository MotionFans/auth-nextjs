"use client"
import './../components/login/pages/css/magiclink1.css';
import Base from "@/components/base";
import FormStyle_1 from "@/components/login/forms/form_style1";
import { generatePublicPrivateKey, get_auth_url, handle_new } from '@/global';
import { useEffect, useRef, useState } from 'react';

export default function magiclink() {
    const [error, set_error] = useState(null);

    const shouldSend = useRef(true);

    async function send_magiclink(code, params) {
        const keys = await generatePublicPrivateKey();

        let body = {
            public_key: keys.publicKeyNaked,
            code: code,
            type: params.get("type")
        }

        await fetch(`${get_auth_url()}/magiclink`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            redirect: 'error', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        }).then(response => response.json())
        .then(async data => {
            if (data.invalidOrExpired) {
                alert(data.message);
                return;
            }
            if (data.ok == true) {
                handle_new(data.device_id, keys.privateKeyNaked);
                if (await localStorage.getItem("returnUrl")) {
                    await handleReturnUrl();
                }
            }
            if (data.error == true) {
                set_error(data.message);
            }
        });
    }

    useEffect(() => {
        if (shouldSend.current != true) { return; }
        shouldSend.current = false;

        const params = new URLSearchParams(document.location.search);
        const code = params.get("code");

        send_magiclink(code, params);
    })
    
    return (
        <Base style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100vh" }}>
            {error == null && <FormStyle_1 header={false} className="magiclink_form" style={{ rowGap: 5 }}>
                <img className='magiclink_img' src="/assets/crystalball.png"/>
                <h2 className='magiclink_checkyouremail'>Opening the portal...</h2>
                <p className='magiclink_wesentalink'>Logging you in, just a moment.</p>
            </FormStyle_1>}

            {error && <FormStyle_1 header={false} className="magiclink_form" style={{ rowGap: 5 }}>
                <img className='magiclink_img' src="/assets/warningsign.png"/>
                <h2 className='magiclink_checkyouremail'>Invalid Magiclink</h2>
                <p className='magiclink_wesentalink greyText'>{error}</p>
            </FormStyle_1>}
        </Base>
    )
}