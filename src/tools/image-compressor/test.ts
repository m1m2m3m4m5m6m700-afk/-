import { getToolConfig } from "@/config/tools";

export const imageCompressorTestContract = Object.freeze({
  toolId: "image-compressor",
  route: "/tools/image-compressor",
  inputKind: "file",
  outputKind: "download",
  localOnly: true,
});

export const assertImageCompressorRegistration = (): void => {
  const tool = getToolConfig(imageCompressorTestContract.toolId);
  if (!tool) throw new Error("image-compressor is missing from TOOLS_REGISTRY");
  if (tool.path !== imageCompressorTestContract.route) throw new Error("image-compressor route mismatch");
  if (tool.input !== imageCompressorTestContract.inputKind) throw new Error("image-compressor input contract mismatch");
  if (tool.output !== imageCompressorTestContract.outputKind) throw new Error("image-compressor output contract mismatch");
  if (!tool.localOnly || !tool.isReady) throw new Error("image-compressor readiness/security contract mismatch");
};
