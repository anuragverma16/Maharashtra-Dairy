import {
  ArrowRight,
  CircleCheck,
  CirclePlus,
  CircleX,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Settings,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  products: Package,
  add: CirclePlus,
  enquiries: MessageCircle,
  content: FileText,
  settings: Settings,
  profile: UserRound,
  logout: LogOut,
  menu: Menu,
  close: X,
  available: CircleCheck,
  unavailable: CircleX,
  new: Plus,
  pending: Clock3,
  email: Mail,
  lock: LockKeyhole,
  eye: Eye,
  eyeOff: EyeOff,
  alert: TriangleAlert,
  arrow: ArrowRight,
};

export default function AdminIcon({ name, size = 20, className = "" }) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon className={className} size={size} strokeWidth={1.7} aria-hidden="true" />;
}
