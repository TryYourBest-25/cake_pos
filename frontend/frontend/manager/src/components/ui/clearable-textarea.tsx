import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClearableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onClear?: () => void;
  showClear?: boolean;
}

const ClearableTextarea = React.forwardRef<HTMLTextAreaElement, ClearableTextareaProps>(
  ({ className, onClear, showClear = true, ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== null && props.value !== "";

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasValue && showClear && onClear ? "pr-8" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {hasValue && showClear && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Xóa</span>
          </button>
        )}
      </div>
    );
  }
);
ClearableTextarea.displayName = "ClearableTextarea";

export { ClearableTextarea }; 