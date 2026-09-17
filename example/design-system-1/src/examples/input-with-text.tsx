import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputWithText() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="email-2">邮箱</Label>
      <Input type="email" id="email-2" placeholder="请输入邮箱" />
      <p className="text-sm text-muted-foreground">请输入你的邮箱地址。</p>
    </div>
  )
}
