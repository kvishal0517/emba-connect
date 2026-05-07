"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  // Filter out Figma inspector props
  const filteredProps = Object.keys(props).reduce((acc, key) => {
    if (!key.startsWith('_fg')) {
      acc[key] = props[key];
    }
    return acc;
  }, {} as any);

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...filteredProps}
    />
  );
}

export { Label };