"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("课程已创建", {
          description: "12 月 3 日，周日 09:00",
          action: {
            label: "撤销",
            onClick: () => console.log("撤销"),
          },
        })
      }
    >
      显示通知
    </Button>
  )
}
