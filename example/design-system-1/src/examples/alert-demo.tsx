import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>更改已保存</AlertTitle>
        <AlertDescription>
          这是一条包含图标、标题和说明的提示。
        </AlertDescription>
      </Alert>
      <Alert>
        <PopcornIcon />
        <AlertTitle>
          这条提示包含标题和图标。
        </AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>无法处理付款</AlertTitle>
        <AlertDescription>
          <p>请核对账单信息后重试。</p>
          <ul className="list-inside list-disc text-sm">
            <li>检查银行卡信息</li>
            <li>确认余额充足</li>
            <li>核对账单地址</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
