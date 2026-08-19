const escapeWifiValue = (value) =>
  String(value)
    .replace(/[\\;,:]/g, (character) => `\\${character}`)
    .replaceAll('"', String.fromCharCode(92, 34));

export function buildQrPayload({
  mode,
  input = "",
  wifiSsid = "",
  wifiPass = "",
  wifiEncryption = "WPA",
  emailTo = "",
  emailSubject = "",
  phoneNumber = "",
}) {
  switch (mode) {
    case "wifi":
      return `WIFI:T:${wifiEncryption};S:${escapeWifiValue(wifiSsid)};P:${escapeWifiValue(wifiPass)};;`;
    case "email":
      return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
    case "phone":
      return `tel:${phoneNumber}`;
    case "url":
    case "text":
    default:
      return String(input);
  }
}

export { escapeWifiValue };
