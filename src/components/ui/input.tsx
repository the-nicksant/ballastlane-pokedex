import * as React from "react"
import InputMask from "react-input-mask"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-md text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        outlined:
          "border-input dark:bg-input/30 bg-transparent border px-3 py-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        filled:
          "bg-muted border-transparent border px-3 py-1 focus-visible:bg-muted/80 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        invisible:
          "bg-transparent border-0 px-3 py-1 focus-visible:bg-muted/50 focus-visible:ring-0 aria-invalid:bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "prefix">,
    VariantProps<typeof inputVariants> {
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  mask?: string
  maskChar?: string
  formatChars?: Record<string, string>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      type,
      prefixIcon,
      suffixIcon,
      mask,
      maskChar = "_",
      formatChars,
      ...props
    },
    ref
  ) => {
    // If there are icons, wrap in a container
    if (prefixIcon || suffixIcon) {
      return (
        <div className="relative flex items-center w-full">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {prefixIcon}
            </div>
          )}
          {mask ? (
            <InputMask
              mask={mask}
              maskChar={maskChar}
              {...props}
            >
              {/* @ts-ignore - InputMask expects a function child */}
              {(inputProps: any) => (
                <input
                  {...inputProps}
                  ref={ref}
                  type={type}
                  data-slot="input"
                  className={cn(
                    inputVariants({ variant }),
                    prefixIcon && "pl-10",
                    suffixIcon && "pr-10",
                    className
                  )}
                />
              )}
            </InputMask>
          ) : (
            <input
              type={type}
              data-slot="input"
              className={cn(
                inputVariants({ variant }),
                prefixIcon && "pl-10",
                suffixIcon && "pr-10",
                className
              )}
              ref={ref}
              {...props}
            />
          )}
          {suffixIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
              {suffixIcon}
            </div>
          )}
        </div>
      )
    }

    // No icons - render input directly
    if (mask) {
      return (
        <InputMask
          mask={mask}
          maskChar={maskChar}
          {...props}
        >
          {/* @ts-ignore - InputMask expects a function child */}
          {(inputProps: any) => (
            <input
              {...inputProps}
              ref={ref}
              type={type}
              data-slot="input"
              className={cn(inputVariants({ variant }), className)}
            />
          )}
        </InputMask>
      )
    }

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
