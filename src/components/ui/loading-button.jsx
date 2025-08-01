import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingButton = ({ 
  children, 
  loading = false, 
  loadingText = "Loading...", 
  disabled,
  className,
  variant = "default",
  size = "default",
  ...props 
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn("relative", className)}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading ? loadingText : children}
    </Button>
  );
};

export { LoadingButton }; 