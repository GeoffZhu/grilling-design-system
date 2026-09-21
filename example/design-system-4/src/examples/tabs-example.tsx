
import { AppWindowIcon, CodeIcon, HomeIcon, SearchIcon, SettingsIcon, MoreHorizontalIcon } from "lucide-react"
import {
  Example,
  ExampleWrapper,
} from "@/components/example"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
export default function TabsExample() {
  return (
    <ExampleWrapper>
      <TabsBasic />
      <TabsLine />
      <TabsVariantsComparison />
      <TabsDisabled />
      <TabsWithIcons />
      <TabsIconOnly />
      <TabsMultiple />
      <TabsWithContent />
      <TabsLineWithContent />
      <TabsLineDisabled />
      <TabsWithDropdown />
      <TabsVertical />
      <TabsWithInputAndButton />
    </ExampleWrapper>
  )
}

function TabsBasic() {
  return (
    <Example title="Basic">
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsLine() {
  return (
    <Example title="Line">
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsVariantsComparison() {
  return (
    <Example title="Variants Alignment">
      <div className="flex gap-4">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </Example>
  )
}

function TabsDisabled() {
  return (
    <Example title="Disabled">
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="settings" disabled>
            Disabled
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsWithIcons() {
  return (
    <Example title="With Icons">
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">
            <AppWindowIcon />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code">
            <CodeIcon />
            Code
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsIconOnly() {
  return (
    <Example title="Icon Only">
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">
            <HomeIcon />
          </TabsTrigger>
          <TabsTrigger value="search">
            <SearchIcon />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsMultiple() {
  return (
    <Example title="Multiple">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsWithContent() {
  return (
    <Example title="With Content">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <div className="border              ">
          <TabsContent value="account">
            Manage your account preferences and profile information.
          </TabsContent>
          <TabsContent value="password">
            Update your password to keep your account secure.
          </TabsContent>
          <TabsContent value="notifications">
            Configure how you receive notifications and alerts.
          </TabsContent>
        </div>
      </Tabs>
    </Example>
  )
}

function TabsLineWithContent() {
  return (
    <Example title="Line With Content">
      <Tabs defaultValue="account">
        <TabsList variant="line">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <div className="border              ">
          <TabsContent value="account">
            Manage your account preferences and profile information.
          </TabsContent>
          <TabsContent value="password">
            Update your password to keep your account secure.
          </TabsContent>
          <TabsContent value="notifications">
            Configure how you receive notifications and alerts.
          </TabsContent>
        </div>
      </Tabs>
    </Example>
  )
}

function TabsLineDisabled() {
  return (
    <Example title="Line Disabled">
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Example>
  )
}

function TabsWithDropdown() {
  return (
    <Example title="With Dropdown">
      <Tabs defaultValue="overview">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="size-8" />}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border              ">
          <TabsContent value="overview">
            View your dashboard metrics and key performance indicators.
          </TabsContent>
          <TabsContent value="analytics">
            Detailed analytics and insights about your data.
          </TabsContent>
          <TabsContent value="reports">
            Generate and view custom reports.
          </TabsContent>
        </div>
      </Tabs>
    </Example>
  )
}

function TabsVertical() {
  return (
    <Example title="Vertical">
      <Tabs defaultValue="account" orientation="vertical">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <div className="border              ">
          <TabsContent value="account">
            Manage your account preferences and profile information.
          </TabsContent>
          <TabsContent value="password">
            Update your password to keep your account secure. Use a strong
            password with a mix of letters, numbers, and symbols.
          </TabsContent>
          <TabsContent value="notifications">
            Configure how you receive notifications and alerts. Choose which
            types of notifications you want to receive and how you want to
            receive them.
          </TabsContent>
        </div>
      </Tabs>
    </Example>
  )
}

function TabsWithInputAndButton() {
  return (
    <Example title="With Input and Button" containerClassName="col-span-full">
      <Tabs defaultValue="overview" className="mx-auto w-full max-w-lg">
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Input placeholder="Search..." className="w-44" />
            <Button>Action</Button>
          </div>
        </div>
        <div className="border              ">
          <TabsContent value="overview">
            View your dashboard metrics and key performance indicators.
          </TabsContent>
          <TabsContent value="analytics">
            Detailed analytics and insights about your data.
          </TabsContent>
          <TabsContent value="reports">
            Generate and view custom reports.
          </TabsContent>
        </div>
      </Tabs>
    </Example>
  )
}
