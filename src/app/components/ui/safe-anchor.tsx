import * as React from "react";

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

export const SafeAnchor = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  const filteredProps = filterFigmaProps(props);
  return <a ref={ref} {...filteredProps} />;
});

SafeAnchor.displayName = "SafeAnchor";
