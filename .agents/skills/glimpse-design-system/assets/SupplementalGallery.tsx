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
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from '@/components/ui/message-scroller'

function FormDemo(){
  const form=useForm({defaultValues:{name:''}})
  const [saved,setSaved]=useState(false)
  return <Form {...form}><form className="space-y-4" onSubmit={form.handleSubmit(()=>setSaved(true))}><FormField control={form.control} name="name" rules={{required:'Enter a name'}} render={({field})=><FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your name" {...field}/></FormControl><FormMessage/></FormItem>}/><Button type="submit">{saved?'Saved':'Save'}</Button></form></Form>
}
export default function SupplementalGallery(){return <>
  <section className="gallery-item" id="form-demo"><h3>form</h3><FormDemo/></section>
  <section className="gallery-item" id="direction-demo"><h3>direction</h3><DirectionProvider dir="rtl"><div dir="rtl" className="flex gap-3"><Button>البداية</Button><Button variant="outline">التالي</Button></div></DirectionProvider></section>
  <section className="gallery-item" id="attachment-demo"><h3>attachment</h3><Attachment><AttachmentMedia><FileText/></AttachmentMedia><AttachmentContent><AttachmentTitle>Design reference.pdf</AttachmentTitle><AttachmentDescription>2.4 MB · Ready</AttachmentDescription></AttachmentContent></Attachment></section>
  <section className="gallery-item" id="bubble-demo"><h3>bubble</h3><div className="space-y-3"><Bubble><BubbleContent>A small step forward.</BubbleContent></Bubble><Bubble align="end" variant="secondary"><BubbleContent>Let's make it happen.</BubbleContent></Bubble></div></section>
  <section className="gallery-item" id="marker-demo"><h3>marker</h3><Marker><MarkerIcon><Check/></MarkerIcon><MarkerContent>Completed</MarkerContent></Marker></section>
  <section className="gallery-item" id="message-demo"><h3>message</h3><Message><MessageContent><MessageHeader>Alex · 9:41</MessageHeader><Bubble><BubbleContent>Everything is ready for review.</BubbleContent></Bubble><MessageFooter>Delivered</MessageFooter></MessageContent></Message></section>
  <section className="gallery-item" id="message-scroller-demo"><h3>message scroller</h3><div style={{height:240}}><MessageScrollerProvider><MessageScroller><MessageScrollerViewport><MessageScrollerContent>{Array.from({length:12},(_,i)=><MessageScrollerItem key={i}><Bubble><BubbleContent>Progress update {i+1}</BubbleContent></Bubble></MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton/></MessageScroller></MessageScrollerProvider></div></section>
</>}
