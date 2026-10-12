"use client"


import { ArrowRightIcon, ArrowLeftCircleIcon } from "lucide-react"
import {
  Example,
  ExampleWrapper,
} from "@/components/example"
import { Button, buttonVariants } from "@/components/ui/button"
export default function ButtonExample() {
  return (
    <ExampleWrapper className="lg:grid-cols-1 2xl:grid-cols-1">
      <ButtonVariantsAndSizes />
      <ButtonIconRight />
      <ButtonIconLeft />
      <ButtonIconOnly />
      <ButtonInvalidStates />
      <ButtonExamples />
    </ExampleWrapper>
  )
}

function ButtonVariantsAndSizes() {
  return (
    <Example title="Variants & Sizes">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">Default</Button>
        <Button size="xs" variant="secondary">
          Secondary
        </Button>
        <Button size="xs" variant="outline">
          Outline
        </Button>
        <Button size="xs" variant="ghost">
          Ghost
        </Button>
        <Button size="xs" variant="destructive">
          Destructive
        </Button>
        <Button size="xs" variant="link">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Default</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          Destructive
        </Button>
        <Button size="sm" variant="link">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg">Default</Button>
        <Button size="lg" variant="secondary">
          Secondary
        </Button>
        <Button size="lg" variant="outline">
          Outline
        </Button>
        <Button size="lg" variant="ghost">
          Ghost
        </Button>
        <Button size="lg" variant="destructive">
          Destructive
        </Button>
        <Button size="lg" variant="link">
          Link
        </Button>
      </div>
    </Example>
  )
}

function ButtonIconRight() {
  return (
    <Example title="Icon Right">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">
          Default{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="xs" variant="secondary">
          Secondary{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="xs" variant="outline">
          Outline{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="xs" variant="ghost">
          Ghost{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="xs" variant="destructive">
          Destructive{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="xs" variant="link">
          Link{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          Default
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="sm" variant="secondary">
          Secondary{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="sm" variant="outline">
          Outline{" "}
          <ArrowRightIcon />
        </Button>
        <Button size="sm" variant="ghost">
          Ghost{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="sm" variant="destructive">
          Destructive{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="sm" variant="link">
          Link{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          Default{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="secondary">
          Secondary{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="outline">
          Outline{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="ghost">
          Ghost{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="destructive">
          Destructive{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="link">
          Link{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg">
          Default{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="secondary">
          Secondary{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="outline">
          Outline{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="ghost">
          Ghost{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="destructive">
          Destructive{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="link">
          Link{" "}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </Example>
  )
}

function ButtonIconLeft() {
  return (
    <Example title="Icon Left">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Default
        </Button>
        <Button size="xs" variant="secondary">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Secondary
        </Button>
        <Button size="xs" variant="outline">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Outline
        </Button>
        <Button size="xs" variant="ghost">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Ghost
        </Button>
        <Button size="xs" variant="destructive">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Destructive
        </Button>
        <Button size="xs" variant="link">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Default
        </Button>
        <Button size="sm" variant="secondary">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Outline
        </Button>
        <Button size="sm" variant="ghost">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Destructive
        </Button>
        <Button size="sm" variant="link">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Default
        </Button>
        <Button variant="secondary">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Secondary
        </Button>
        <Button variant="outline">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Outline
        </Button>
        <Button variant="ghost">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Ghost
        </Button>
        <Button variant="destructive">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Destructive
        </Button>
        <Button variant="link">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Default
        </Button>
        <Button size="lg" variant="secondary">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Secondary
        </Button>
        <Button size="lg" variant="outline">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Outline
        </Button>
        <Button size="lg" variant="ghost">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Ghost
        </Button>
        <Button size="lg" variant="destructive">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Destructive
        </Button>
        <Button size="lg" variant="link">
          <ArrowLeftCircleIcon data-icon="inline-start" />{" "}
          Link
        </Button>
      </div>
    </Example>
  )
}

function ButtonIconOnly() {
  return (
    <Example title="Icon Only">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon-xs">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-xs" variant="secondary">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-xs" variant="outline">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-xs" variant="ghost">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-xs" variant="destructive">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-xs" variant="link">
          <ArrowRightIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon-sm">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-sm" variant="secondary">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-sm" variant="outline">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-sm" variant="ghost">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-sm" variant="destructive">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-sm" variant="link">
          <ArrowRightIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon">
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="secondary">
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="outline">
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="ghost">
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="destructive">
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="link">
          <ArrowRightIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon-lg">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-lg" variant="secondary">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-lg" variant="outline">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-lg" variant="ghost">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-lg" variant="destructive">
          <ArrowRightIcon />
        </Button>
        <Button size="icon-lg" variant="link">
          <ArrowRightIcon />
        </Button>
      </div>
    </Example>
  )
}

function ButtonExamples() {
  return (
    <Example title="Examples">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>
            Submit{" "}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive">Delete</Button>
          <Button size="icon">
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <a href="#" className={buttonVariants()}>
          Link
        </a>
      </div>
    </Example>
  )
}

function ButtonInvalidStates() {
  return (
    <Example title="Invalid States">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" aria-invalid="true">
          Default
        </Button>
        <Button size="xs" variant="secondary" aria-invalid="true">
          Secondary
        </Button>
        <Button size="xs" variant="outline" aria-invalid="true">
          Outline
        </Button>
        <Button size="xs" variant="ghost" aria-invalid="true">
          Ghost
        </Button>
        <Button size="xs" variant="destructive" aria-invalid="true">
          Destructive
        </Button>
        <Button size="xs" variant="link" aria-invalid="true">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" aria-invalid="true">
          Default
        </Button>
        <Button size="sm" variant="secondary" aria-invalid="true">
          Secondary
        </Button>
        <Button size="sm" variant="outline" aria-invalid="true">
          Outline
        </Button>
        <Button size="sm" variant="ghost" aria-invalid="true">
          Ghost
        </Button>
        <Button size="sm" variant="destructive" aria-invalid="true">
          Destructive
        </Button>
        <Button size="sm" variant="link" aria-invalid="true">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button aria-invalid="true">Default</Button>
        <Button variant="secondary" aria-invalid="true">
          Secondary
        </Button>
        <Button variant="outline" aria-invalid="true">
          Outline
        </Button>
        <Button variant="ghost" aria-invalid="true">
          Ghost
        </Button>
        <Button variant="destructive" aria-invalid="true">
          Destructive
        </Button>
        <Button variant="link" aria-invalid="true">
          Link
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg" aria-invalid="true">
          Default
        </Button>
        <Button size="lg" variant="secondary" aria-invalid="true">
          Secondary
        </Button>
        <Button size="lg" variant="outline" aria-invalid="true">
          Outline
        </Button>
        <Button size="lg" variant="ghost" aria-invalid="true">
          Ghost
        </Button>
        <Button size="lg" variant="destructive" aria-invalid="true">
          Destructive
        </Button>
        <Button size="lg" variant="link" aria-invalid="true">
          Link
        </Button>
      </div>
    </Example>
  )
}
