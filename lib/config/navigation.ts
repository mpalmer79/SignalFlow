import {
  Activity,
  Bell,
  BrainCircuit,
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  Gauge,
  LayoutDashboard,
  LineChart,
  Radar,
  MessageSquare,
  Package,
  PhoneCall,
  PlayCircle,
  Plug,
  PresentationIcon,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Sparkles,
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
    label: "Revenue Command Center",
    href: "/revenue-command-center",
    icon: Radar,
    description: "Signal to revenue, one story",
  },
  {
    label: "Intelligence",
    href: "/intelligence",
    icon: BrainCircuit,
    description: "Customer intelligence graph and scores",
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
    label: "Revenue Engine",
    href: "/revenue-engine",
    icon: LineChart,
    description: "Outcomes, attribution, and missed revenue",
  },
  {
    label: "AI Center",
    href: "/ai-center",
    icon: Sparkles,
    description: "Explainable, governed AI recommendations",
  },
  {
    label: "Review Queue",
    href: "/review-queue",
    icon: ClipboardCheck,
    description: "Human review of AI recommendations",
  },
  {
    label: "Voice Command Center",
    href: "/voice-command-center",
    icon: PhoneCall,
    description: "Simulated voice follow-up operations",
  },
  {
    label: "Provider Management",
    href: "/provider-management",
    icon: Plug,
    description: "Provider registry, feature flags, and readiness",
  },
  {
    label: "Provider Sandbox",
    href: "/provider-sandbox",
    icon: SlidersHorizontal,
    description: "Deterministic provider request simulations",
  },
  {
    label: "Scenarios",
    href: "/scenarios",
    icon: PlayCircle,
    description: "Launch end to end industry scenarios",
  },
  {
    label: "Simulation Center",
    href: "/simulation-center",
    icon: FlaskConical,
    description: "Run large multi-customer simulations",
  },
  {
    label: "Executive Insights",
    href: "/executive-insights",
    icon: Gauge,
    description: "Revenue leaks and performance for leaders",
  },
  {
    label: "Demo Walkthrough",
    href: "/demo",
    icon: PresentationIcon,
    description: "Guided signal to revenue tour",
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
