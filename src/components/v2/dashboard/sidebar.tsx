import { memo } from "react";
import {
  BookOpen,
  Clock,
  House,
  MessagesSquare,
  PanelLeftOpen,
  Settings,
  User,
  Utensils,
} from "lucide-react";
import { Logo } from "../logo";

const NAV_ITEMS = [
  { label: "Dashboard", icon: House, active: true },
  { label: "Daily Briefs", icon: Clock },
  { label: "AI Chat", icon: MessagesSquare },
  { label: "Knowledge Base", icon: BookOpen },
  { label: "Meals", icon: Utensils },
  { label: "Settings", icon: Settings },
];

// Drawn, not a control: plain elements with no links or buttons, so nothing here
// can take focus. The arbitrary variants size the shared logo to the mockup's 26×24
// and drop its wordmark on the icon rail.
export const Sidebar = memo(function Sidebar() {
  return (
    <div
      aria-hidden="true"
      className="hidden w-14 flex-none flex-col border-r border-[#2C333C] bg-lm-app-sidebar px-2 py-3.5 tablet:flex desktop:w-[210px]"
    >
      <div className="mb-2.5 flex justify-center border-b border-[#2C333C] pt-0.5 pb-3.5 desktop:justify-start desktop:px-2 [&_svg:first-child]:h-6 [&_svg:first-child]:w-[26px] [&_svg:last-child]:hidden desktop:[&_svg:last-child]:block">
        <Logo size="footer" />
      </div>

      {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
        <div
          key={label}
          className={`mb-0.5 flex items-center justify-center gap-2.5 rounded-md px-3 py-[9px] text-[13px] desktop:justify-start ${
            active
              ? "bg-lm-app-sidebar-active text-lm-app-text shadow-[inset_3px_0_0_var(--color-lm-app-primary)]"
              : "text-lm-app-text-muted"
          }`}
        >
          <Icon size={16} className="flex-none" />
          <span className="hidden desktop:inline">{label}</span>
        </div>
      ))}

      <div className="flex justify-center px-3 py-2.5 text-lm-app-text-muted desktop:justify-start">
        <PanelLeftOpen size={16} />
      </div>

      <div className="mt-auto flex items-center justify-center gap-2 border-t border-[#2C333C] pt-3 pb-0.5 text-[12px] desktop:justify-start desktop:px-2">
        <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-lm-app-primary">
          <User size={13} className="text-white" />
        </span>
        <span className="hidden desktop:inline">demo@lumose.local</span>
      </div>
    </div>
  );
});
