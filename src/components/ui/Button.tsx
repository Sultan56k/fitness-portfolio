import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-primary rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300",
  secondary:
    "rounded-full border border-accent-lime/60 px-6 py-3 text-sm font-semibold text-accent-lime transition-all duration-300 hover:bg-accent-lime hover:text-bg-primary",
  ghost:
    "group inline-flex items-center gap-1 text-sm font-medium text-accent-lime transition-colors duration-300 hover:text-white",
};

interface ButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

function GhostArrow() {
  return (
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  href,
  external,
  onClick,
  type = "button",
}: ButtonProps) {
  const classes = cn(variantStyles[variant], className);

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          onClick={onClick}
        >
          {children}
          {variant === "ghost" && <GhostArrow />}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
        {variant === "ghost" && <GhostArrow />}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
      {variant === "ghost" && <GhostArrow />}
    </button>
  );
}
