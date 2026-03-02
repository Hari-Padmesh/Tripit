import * as React from "react";
import { cn } from "../ui/utils";

const inputBase =
  "block w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(inputBase, className)}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };