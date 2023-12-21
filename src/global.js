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
    return null;
  }
  if (authData.type != "elliptic") {
    await localStorage.removeItem(`auth${localAppend}`)
    return null;
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

async function encrypt_data_with_public_key(publicKey, data) {
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(data)
  );

  return encryptedData;
}

function array_buffer_to_base64(buffer) {
  const binary = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...binary));
}

async function import_rsa_publickey(publicKeyString) {
  const keyData = new TextEncoder().encode(publicKeyString);
  const importedKey = await window.crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return importedKey;
}

async function spkiToPem(spkiBuffer) {
  const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(spkiBuffer));
  const exportedAsBase64 = btoa(exportedAsString);

  const pemHeader = "-----BEGIN PUBLIC KEY-----\n";
  const pemFooter = "\n-----END PUBLIC KEY-----\n";

  let pemBody = "";
  for (let i = 0; i < exportedAsBase64.length; i += 64) {
    pemBody += exportedAsBase64.substring(i, i + 64);
  }

  return pemHeader + pemBody + pemFooter;
}

export { get_auth_url, get_api_url, generatePublicPrivateKey, handle_new, credentials_object, logout, encrypt_data_with_public_key, array_buffer_to_base64, import_rsa_publickey, spkiToPem };