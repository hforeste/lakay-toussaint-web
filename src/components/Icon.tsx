import type { ReactNode, SVGProps } from "react";

type IconName =
  | "arrow_back"
  | "arrow_downward"
  | "arrow_forward"
  | "arrow_outward"
  | "calendar_month"
  | "check_circle"
  | "groups"
  | "location_on"
  | "menu"
  | "close"
  | "verified_user";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

const paths: Record<IconName, ReactNode> = {
  arrow_back: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrow_downward: <path d="M12 5v14m-6-6 6 6 6-6" />,
  arrow_forward: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrow_outward: <path d="M6 18 18 6M9 6h9v9" />,
  calendar_month: <><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
  check_circle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
  groups: <><circle cx="9" cy="8" r="2.5" /><circle cx="16.5" cy="9.5" r="2" /><path d="M4.5 19c.4-3.3 2.1-5 4.5-5s4.1 1.7 4.5 5M14.5 18.5c.2-2.4 1.4-3.7 3.5-3.7 1.1 0 2 .4 2.7 1.2" /></>,
  location_on: <><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.25" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  verified_user: <><path d="M12 3.5 19 6v5.3c0 4.3-2.7 7.5-7 9.2-4.3-1.7-7-4.9-7-9.2V6l7-2.5Z" /><path d="m8.7 12 2.1 2.1 4.5-4.6" /></>,
};

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" className={["uiIcon", className].filter(Boolean).join(" ")} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      {paths[name]}
    </svg>
  );
}
