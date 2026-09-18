import * as React from "react"
import { cn } from "cn"
import catMascot from "./cat-mascot-data"
import "./cat-backdrop.css"

type CatBackdropProps = React.ComponentProps<"section"> & {
  variant?: "page" | "card"
  imageClassName?: string
}

function CatBackdrop({
  variant = "card",
  className,
  imageClassName,
  children,
  ...props
}: CatBackdropProps) {
  return (
    <section
      data-slot="cat-backdrop"
      data-variant={variant}
      className={cn("cat-backdrop", className)}
      {...props}
    >
      <div className="cat-backdrop__content">{children}</div>
      <img
        className={cn("cat-backdrop__mascot", imageClassName)}
        src={catMascot}
        alt=""
        aria-hidden="true"
      />
    </section>
  )
}

export { CatBackdrop }
export type { CatBackdropProps }
