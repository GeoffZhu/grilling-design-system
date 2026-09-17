import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function ButtonLoading() {
  return (
    <Button size="sm" variant="outline" disabled>
      <Spinner />
      Submit
    </Button>
  )
}
