import React, { useId, useState } from "react";

const callAll =
  <Args extends unknown[]>(...fns: Array<((...args: Args) => void) | undefined>) =>
  (...args: Args) =>
    fns.forEach((fn) => fn?.(...args));

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  align?: "center" | "start" | "end";
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children, align = "center" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  const child = React.cloneElement(children, {
    onMouseEnter: callAll(children.props.onMouseEnter, show),
    onMouseLeave: callAll(children.props.onMouseLeave, hide),
    onFocus: callAll(children.props.onFocus, show),
    onBlur: callAll(children.props.onBlur, hide),
    onTouchStart: callAll(children.props.onTouchStart, show),
    onTouchEnd: callAll(children.props.onTouchEnd, hide),
    "aria-describedby": isVisible ? tooltipId : undefined
  });

  return (
    <span className="tooltip" data-align={align}>
      {child}
      <span
        role="tooltip"
        id={tooltipId}
        className="tooltip__bubble"
        data-visible={isVisible}
      >
        {content}
      </span>
    </span>
  );
};
