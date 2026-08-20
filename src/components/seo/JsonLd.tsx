import { useRouter } from "@tanstack/react-router";

type JsonLdProps = {
  data: unknown;
};

export function JsonLd({ data }: JsonLdProps) {
  const router = useRouter();
  const nonce =
    router.options.ssr?.nonce ??
    (typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]')?.content
      : undefined);
  const serialized = JSON.stringify(data).replace(/[<>&]/g, (character) => {
    const escapes: Record<string, string> = {
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
    };
    return escapes[character] ?? character;
  });

  return (
    <script type="application/ld+json" nonce={nonce} suppressHydrationWarning>
      {serialized}
    </script>
  );
}
