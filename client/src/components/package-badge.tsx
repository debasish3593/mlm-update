import { Badge } from "@/components/ui/badge";
import { Award, Medal, Gem } from "lucide-react";

interface PackageBadgeProps {
  package: string;
  size?: "sm" | "default" | "lg";
}

export function PackageBadge({ package: pkg, size = "default" }: PackageBadgeProps) {
  const getPackageConfig = (packageName: string) => {
    switch (packageName) {
      case "Silver":
        return {
          icon: Award,
          className: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        };
      case "Gold":
        return {
          icon: Medal,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case "Diamond":
        return {
          icon: Gem,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };
      default:
        return {
          icon: Award,
          className: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        };
    }
  };

  const { icon: Icon, className } = getPackageConfig(pkg);

  return (
    <Badge variant="secondary" className={className} data-testid={`badge-package-${pkg.toLowerCase()}`}>
      <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
      {pkg}
    </Badge>
  );
}
