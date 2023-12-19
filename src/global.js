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
  let random = Math.random() * 100000;

  let localAppend = "";
  if (localStorage.getItem("use_prod_servers") != "true" && window.location.hostname.includes("127.0.0.1")) {
    localAppend = "_local";
  }
  
  if (!device_id || !private_key) {
    return null;
  }

  let authObject = {};
  const authStatus = await cookies.get(`auth${localAppend}`);
  if (authStatus) {
    authObject = {
      ...authStatus
    }
  }

  authObject = {
    ...authStatus,
    device_id: device_id,
    privatekey: privatekey,
    type: "elliptic"
  }

  let domain = ".motionfans.com";
  if (window.location.origin.startsWith("https://127.0.0.1") || window.location.origin.startsWith("http://127.0.0.1")) {
    domain = "127.0.0.1";
  }

  let expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 10);

  await localStorage.setItem(`auth${localAppend}`, JSON.stringify(authObject));
}

export { get_auth_url, get_api_url, generatePublicPrivateKey, handle_new }