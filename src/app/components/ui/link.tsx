import * as React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router";

// Helper to filter out Figma inspector props
const filterFigmaProps = (props: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  for (const key in props) {
    if (!key.startsWith('_fg')) {
      filtered[key] = props[key];
    }
  }
  return filtered;
};

export interface LinkProps extends RouterLinkProps {}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const filteredProps = filterFigmaProps(props as any);
    return <RouterLink ref={ref} {...filteredProps} />;
  }
);

Link.displayName = "Link";
