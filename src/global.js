function get_auth_url() {
  return "https://auth.api.motionfans.com"
}

function get_api_url() {
  return "https://api.motionfans.com"
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function generatePublicPrivateKey() {
  const keyPair = await crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-521",
  },
    true,
    ["sign", "verify"]
  )
  const publicexported = await crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const publicexportedAsString = ab2str(publicexported);
  const publicexportedAsBase64 = btoa(publicexportedAsString);

  const privateexported = await crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const privateexportedAsString = ab2str(privateexported);
  const privateexportedAsBase64 = btoa(privateexportedAsString);
  return { publicKeyNaked: publicexportedAsBase64, privateKeyNaked: privateexportedAsBase64 };
}

async function handle_new(device_id, private_key) {
  let localAppend = "";
  if (localStorage.getItem("use_prod_servers") != "true" && window.location.hostname.includes("127.0.0.1")) {
    localAppend = "_local";
  }
  
  if (!device_id || !private_key) {
    return null;
  }

  let authObject = {
    device_id: device_id,
    private_key: private_key,
    type: "elliptic"
  }

  await localStorage.setItem(`auth${localAppend}`, JSON.stringify(authObject));
}

async function credentials_object() {
  let localAppend = "";
  if (localStorage.getItem("use_prod_servers") != "true" && window.location.origin.includes("127.0.0.1")) { //window.location.origin.includes("127.0.0.1") IS DANGEROUS IF YOU DON'T CHECK FOR A DOT. IF THERE IS A DOT IN THE HOSTNAME THEN IT'S A DOMAIN AND NOT THE REAL LOCALHOST. IT'S FINE IN THIS SPECIFIC CASE THOUGH.
    localAppend = "_local";
  }

  const authData = JSON.parse(await localStorage.getItem(`auth${localAppend}`));

  if (!authData) {
    console.log("No auth data found.");
    return {};
  }
  if (authData.type != "elliptic") {
    await localStorage.removeItem(`auth${localAppend}`)
    return {};
  }

  const deviceId = await authData.device_id;

  return { deviceid: deviceId, privatekey: authData.private_key };
}

async function logout() {
  // TODO: Should be signaling to the backend the credential is no longer valid and await verification it was removed.
  let localAppend = "";
  if (localStorage.getItem("use_prod_servers") != "true" && window.location.origin.includes("127.0.0.1")) { //window.location.origin.includes("127.0.0.1") IS DANGEROUS IF YOU DON'T CHECK FOR A DOT. IF THERE IS A DOT IN THE HOSTNAME THEN IT'S A DOMAIN AND NOT THE REAL LOCALHOST. IT'S FINE IN THIS SPECIFIC CASE THOUGH.
    localAppend = "_local";
  }

  await localStorage.removeItem(`auth${localAppend}`);
}

export { get_auth_url, get_api_url, generatePublicPrivateKey, handle_new, credentials_object, logout }