"use client";

import BUACLoader, {
  type BUACLoaderProps,
} from "./BUACLoader";

export default function ClassicLoader({
  size = "md",
  className,
}: Pick<BUACLoaderProps, "size" | "className">) {
  return <BUACLoader size={size} className={className} />;
}