export type QrPayloadOptions = {
  mode: "url" | "text" | "wifi" | "email" | "phone";
  input?: string;
  wifiSsid?: string;
  wifiPass?: string;
  wifiEncryption?: "WPA" | "WEP" | "nopass";
  emailTo?: string;
  emailSubject?: string;
  phoneNumber?: string;
};

export declare function buildQrPayload(options: QrPayloadOptions): string;
export declare function escapeWifiValue(value: string): string;
