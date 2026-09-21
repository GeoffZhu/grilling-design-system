"use client"


import { ChevronDownIcon, VolumeX, CheckIcon, AlertTriangleIcon, UserRoundXIcon, ShareIcon, CopyIcon, TrashIcon, ArrowRightIcon, FlipHorizontalIcon, FlipVerticalIcon, RotateCwIcon, SearchIcon, MinusIcon, PlusIcon, HeartIcon, AudioLinesIcon, ArrowLeftIcon } from "lucide-react"
import {
  Example,
  ExampleWrapper,
} from "@/components/example"
import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
export default function ButtonGroupExample() {
  return (
    <ExampleWrapper>
      <ButtonGroupBasic />
      <ButtonGroupWithInput />
      <ButtonGroupWithText />
      <ButtonGroupWithDropdown />
      <ButtonGroupWithSelect />
      <ButtonGroupWithIcons />
      <ButtonGroupWithInputGroup />
      <ButtonGroupWithFields />
      <ButtonGroupWithLike />
      <ButtonGroupWithSelectAndInput />
      <ButtonGroupNested />
      <ButtonGroupPagination />
      <ButtonGroupPaginationSplit />
      <ButtonGroupNavigation />
      <ButtonGroupTextAlignment />
      <ButtonGroupVertical />
      <ButtonGroupVerticalNested />
    </ExampleWrapper>
  )
}

function ButtonGroupBasic() {
  return (
    <Example title="Basic">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Another Button</Button>
        </ButtonGroup>
      </div>
    </Example>
  )
}

function ButtonGroupWithInput() {
  return (
    <Example title="With Input">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">Button</Button>
          <Input placeholder="Type something here..." />
        </ButtonGroup>
        <ButtonGroup>
          <Input placeholder="Type something here..." />
          <Button variant="outline">Button</Button>
        </ButtonGroup>
      </div>
    </Example>
  )
}

function ButtonGroupWithText() {
  return (
    <Example title="With Text">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <ButtonGroupText>Text</ButtonGroupText>
          <Button variant="outline">Another Button</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText render={<Label htmlFor="input-text" />}>
            GPU Size
          </ButtonGroupText>
          <Input
            id="input-text"
            placeholder="Type something here..."
            className=""
          />
        </ButtonGroup>
      </div>
    </Example>
  )
}

function ButtonGroupWithDropdown() {
  return (
    <Example title="With Dropdown">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">Update</Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" />}
            >
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Disable</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Uninstall
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">Follow</Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" />}
            >
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <VolumeX />
                  Mute Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckIcon />
                  Mark as Read
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangleIcon />
                  Report Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserRoundXIcon />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon />
                  Share Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  Copy Conversation
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <TrashIcon />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    </Example>
  )
}

const currencyItems = [
  { label: "$", value: "$" },
  { label: "€", value: "€" },
  { label: "£", value: "£" },
]

function ButtonGroupWithSelect() {
  return (
    <Example title="With Select">
      <Field>
        <Label htmlFor="amount">Amount</Label>
        <ButtonGroup>
          <Select items={currencyItems} defaultValue={currencyItems[0]}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currencyItems.map((item) => (
                  <SelectItem key={item.value} value={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input placeholder="Enter amount to send" />
          <Button variant="outline">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </Field>
    </Example>
  )
}

function ButtonGroupWithIcons() {
  return (
    <Example title="With Icons">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">
            <FlipHorizontalIcon />
          </Button>
          <Button variant="outline">
            <FlipVerticalIcon />
          </Button>
          <Button variant="outline">
            <RotateCwIcon />
          </Button>
        </ButtonGroup>
      </div>
    </Example>
  )
}

function ButtonGroupWithInputGroup() {
  return (
    <Example title="With Input Group">
      <div className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupInput placeholder="Type to search..." />
          <InputGroupAddon
            align="inline-start"
            className="text-muted-foreground"
          >
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Example>
  )
}

function ButtonGroupWithFields() {
  return (
    <Example title="With Fields">
      <FieldGroup className="grid grid-cols-3 gap-4">
        <Field className="col-span-2">
          <Label htmlFor="width">Width</Label>
          <ButtonGroup>
            <InputGroup>
              <InputGroupInput id="width" />
              <InputGroupAddon className="text-muted-foreground">
                W
              </InputGroupAddon>
              <InputGroupAddon
                align="inline-end"
                className="text-muted-foreground"
              >
                px
              </InputGroupAddon>
            </InputGroup>
            <Button variant="outline" size="icon">
              <MinusIcon />
            </Button>
            <Button variant="outline" size="icon">
              <PlusIcon />
            </Button>
          </ButtonGroup>
        </Field>
      </FieldGroup>
    </Example>
  )
}

function ButtonGroupWithLike() {
  return (
    <Example title="With Like">
      <ButtonGroup>
        <Button variant="outline">
          <HeartIcon data-icon="inline-start" />{" "}
          Like
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12"
          render={<span />}
          nativeButton={false}
        >
          1.2K
        </Button>
      </ButtonGroup>
    </Example>
  )
}

const durationItems = [
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
  { label: "Weeks", value: "weeks" },
]

function ButtonGroupWithSelectAndInput() {
  return (
    <Example title="With Select and Input">
      <ButtonGroup>
        <Select items={durationItems} defaultValue={durationItems[0]}>
          <SelectTrigger id="duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {durationItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input />
      </ButtonGroup>
    </Example>
  )
}

function ButtonGroupNested() {
  return (
    <Example title="Nested">
      <ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <PlusIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <InputGroup>
            <InputGroupInput placeholder="Send a message..." />
            <Tooltip>
              <TooltipTrigger render={<InputGroupAddon align="inline-end" />}>
                <AudioLinesIcon />
              </TooltipTrigger>
              <TooltipContent>Voice Mode</TooltipContent>
            </Tooltip>
          </InputGroup>
        </ButtonGroup>
      </ButtonGroup>
    </Example>
  )
}

function ButtonGroupPagination() {
  return (
    <Example title="Pagination">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          <ArrowLeftIcon data-icon="inline-start" />
          Previous
        </Button>
        <Button variant="outline" size="sm">
          1
        </Button>
        <Button variant="outline" size="sm">
          2
        </Button>
        <Button variant="outline" size="sm">
          3
        </Button>
        <Button variant="outline" size="sm">
          4
        </Button>
        <Button variant="outline" size="sm">
          5
        </Button>
        <Button variant="outline" size="sm">
          Next
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </ButtonGroup>
    </Example>
  )
}

function ButtonGroupPaginationSplit() {
  return (
    <Example title="Pagination Split">
      <ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            4
          </Button>
          <Button variant="outline" size="sm">
            5
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon-xs">
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" size="icon-xs">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </Example>
  )
}

function ButtonGroupNavigation() {
  return (
    <Example title="Navigation">
      <ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Single navigation button">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </Example>
  )
}

function ButtonGroupTextAlignment() {
  return (
    <Example title="Text Alignment">
      <Field>
        <Label id="alignment-label">Text Alignment</Label>
        <ButtonGroup aria-labelledby="alignment-label">
          <Button variant="outline" size="sm">
            Left
          </Button>
          <Button variant="outline" size="sm">
            Center
          </Button>
          <Button variant="outline" size="sm">
            Right
          </Button>
          <Button variant="outline" size="sm">
            Justify
          </Button>
        </ButtonGroup>
      </Field>
    </Example>
  )
}

function ButtonGroupVertical() {
  return (
    <Example title="Vertical">
      <div className="flex gap-6">
        <ButtonGroup
          orientation="vertical"
          aria-label="Media controls"
          className="h-fit"
        >
          <Button variant="outline" size="icon">
            <PlusIcon />
          </Button>
          <Button variant="outline" size="icon">
            <MinusIcon />
          </Button>
        </ButtonGroup>
      </div>
    </Example>
  )
}

function ButtonGroupVerticalNested() {
  return (
    <Example title="Vertical Nested">
      <ButtonGroup orientation="vertical" aria-label="Design tools palette">
        <ButtonGroup orientation="vertical">
          <Button variant="outline" size="icon">
            <SearchIcon />
          </Button>
          <Button variant="outline" size="icon">
            <CopyIcon />
          </Button>
          <Button variant="outline" size="icon">
            <ShareIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline" size="icon">
            <FlipHorizontalIcon />
          </Button>
          <Button variant="outline" size="icon">
            <FlipVerticalIcon />
          </Button>
          <Button variant="outline" size="icon">
            <RotateCwIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <TrashIcon />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </Example>
  )
}
