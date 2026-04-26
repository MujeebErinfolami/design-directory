// Next.js middleware entry point.
// Auth logic lives in proxy.ts (edge-safe, no Prisma) so it can also be
// unit-tested independently. This file simply wires it in.
export { proxy as default, config } from "./proxy";
