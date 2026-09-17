import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"

export default function NativeSelectDemo() {
  return (
    <NativeSelect>
      <NativeSelectOption value="">选择状态</NativeSelectOption>
      <NativeSelectOption value="todo">待处理</NativeSelectOption>
      <NativeSelectOption value="in-progress">进行中</NativeSelectOption>
      <NativeSelectOption value="done">已完成</NativeSelectOption>
      <NativeSelectOption value="cancelled">已取消</NativeSelectOption>
    </NativeSelect>
  )
}
