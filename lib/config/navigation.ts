import {
  Activity,
  Bell,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Package,
  ScrollText,
  Settings,
  Target,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const primaryNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Revenue command center overview",
  },
  {
    label: "Signals",
    href: "/signals",
    icon: Bell,
    description: "Inbound revenue and risk events",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    description: "Customer intelligence records",
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: Target,
    description: "Revenue pipeline by stage",
  },
  {
    label: "Action Graph",
    href: "/action-graph",
    icon: GitBranch,
    description: "How next best action is decided",
  },
  {
    label: "Orchestrator",
    href: "/orchestrator",
    icon: Workflow,
    description: "Simulated multi-channel workflows",
  },
  {
    label: "Communications",
    href: "/communications",
    icon: MessageSquare,
    description: "Simulated communication records",
  },
  {
    label: "Vertical Packs",
    href: "/vertical-packs",
    icon: Package,
    description: "Industry-specific configurations",
  },
  {
    label: "Audit",
    href: "/audit",
    icon: ScrollText,
    description: "Decision and action trail",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Organization and policy configuration",
  },
];

export const platformPillars = [
  {
    label: "Signals",
    icon: Bell,
  },
  {
    label: "Intelligence Graph",
    icon: Users,
  },
  {
    label: "Action Graph",
    icon: GitBranch,
  },
  {
    label: "Orchestration",
    icon: Activity,
  },
];
