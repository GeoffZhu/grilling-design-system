import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FileText, Check } from 'lucide-react'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DirectionProvider } from '@/components/ui/direction'
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription } from '@/components/ui/attachment'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageContent, MessageHeader, MessageFooter } from '@/components/ui/message'
import { text } from '@/review-copy'
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from '@/components/ui/message-scroller'

export function FormDemo(){
  const form=useForm({defaultValues:{name:''}})
  const [saved,setSaved]=useState(false)
  return <Form {...form}><form className="space-y-4" onSubmit={form.handleSubmit(()=>setSaved(true))}><FormField control={form.control} name="name" rules={{required:text['Enter a name']}} render={({field})=><FormItem><FormLabel>{text['Name']}</FormLabel><FormControl><Input placeholder={text['Your name']} {...field}/></FormControl><FormMessage/></FormItem>}/><Button type="submit">{saved?text['Saved']:text['Save']}</Button></form></Form>
}
export function DirectionDemo(){return <DirectionProvider dir="rtl"><div dir="rtl" className="flex gap-3"><Button>البداية</Button><Button variant="outline">التالي</Button></div></DirectionProvider>}
export function AttachmentDemo(){return <Attachment><AttachmentMedia><FileText/></AttachmentMedia><AttachmentContent><AttachmentTitle>{text['Design reference.pdf']}</AttachmentTitle><AttachmentDescription>{text['2.4 MB · Ready']}</AttachmentDescription></AttachmentContent></Attachment>}
export function BubbleDemo(){return <div className="space-y-3"><Bubble><BubbleContent>{text['A small step forward.']}</BubbleContent></Bubble><Bubble align="end" variant="secondary"><BubbleContent>{text["Let's make it happen."]}</BubbleContent></Bubble></div>}
export function MarkerDemo(){return <Marker><MarkerIcon><Check/></MarkerIcon><MarkerContent>{text['Completed']}</MarkerContent></Marker>}
export function MessageDemo(){return <Message><MessageContent><MessageHeader>{text['Alex · 9:41']}</MessageHeader><Bubble><BubbleContent>{text['Everything is ready for review.']}</BubbleContent></Bubble><MessageFooter>{text['Delivered']}</MessageFooter></MessageContent></Message>}
export function MessageScrollerDemo(){return <div style={{height:240,minWidth:280}}><MessageScrollerProvider><MessageScroller><MessageScrollerViewport><MessageScrollerContent>{Array.from({length:12},(_,i)=><MessageScrollerItem key={i}><Bubble><BubbleContent>{text['Progress update {n}'].replace('{n}',String(i+1))}</BubbleContent></Bubble></MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton/></MessageScroller></MessageScrollerProvider></div>}
