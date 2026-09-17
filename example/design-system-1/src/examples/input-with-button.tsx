import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder="请输入邮箱" />
      <Button type="submit" variant="outline">
        订阅
      </Button>
    </div>
  )
}
