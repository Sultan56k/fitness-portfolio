import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "blockquote";
}

export function Card({
  children,
  className,
  hover = true,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={cn(
        "glass-panel p-6",
        hover &&
          "transition-all duration-300 hover:-translate-y-2 hover:border-accent-lime/30 hover:shadow-[0_8px_32px_rgba(255,164,92,0.1)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
