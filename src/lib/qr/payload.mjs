/** @typedef {"url"|"text"|"wifi"|"email"|"phone"} QrMode */

/**
 * Escape a value according to the Wi-Fi QR payload grammar.
 * @param {string} value
 */
export function escapeWifiValue(value) {
  return value.replace(/[\\;,:]/g, (character) => `\\${character}`).replaceAll('"', String.fromCharCode(92, 34));
}

/**
 * Build the canonical payload used by the QR generator.
 * @param {{mode: QrMode, input?: string, wifiSsid?: string, wifiPass?: string, wifiEncryption?: "WPA"|"WEP"|"nopass", emailTo?: string, emailSubject?: string, phoneNumber?: string}} options
 */
export function buildQrPayload(options) {
  const {
    mode,
    input = "",
    wifiSsid = "",
    wifiPass = "",
    wifiEncryption = "WPA",
    emailTo = "",
    emailSubject = "",
    phoneNumber = "",
  } = options;

  switch (mode) {
    case "wifi":
      return `WIFI:T:${wifiEncryption};S:${escapeWifiValue(wifiSsid)};P:${escapeWifiValue(wifiPass)};;`;
    case "email":
      return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
    case "phone":
      return `tel:${phoneNumber}`;
    default:
      return input;
  }
}
