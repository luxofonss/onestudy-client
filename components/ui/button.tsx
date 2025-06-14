import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative bg-gradient-to-br from-teal-500 to-blue-600 text-white hover:shadow-md hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        primary:
          "relative bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "relative bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] active:shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  showGlow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, showGlow = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Check if we're using a gradient variant that should have the glow effect
    const hasGradient =
      variant === "primary" ||
      variant === "gradient" ||
      (!variant && !props.disabled);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {hasGradient && showGlow && (
          <span className="absolute inset-0 rounded-md bg-gradient-to-br from-pink-400/40 to-purple-500/40 blur-sm -z-10"></span>
        )}
        {props.children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
