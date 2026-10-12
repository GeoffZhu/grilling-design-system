import { Suspense, lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { text } from "./review-copy";
const P0=lazy(()=>import("@/components/custom/button.preview"));
const P1=lazy(()=>import("@/components/custom/header.preview"));
const P2=lazy(()=>import("@/components/custom/hero.preview"));
const P3=lazy(()=>import("@/components/custom/section.preview"));
const P4=lazy(()=>import("@/components/custom/card.preview"));
const P5=lazy(()=>import("@/components/custom/footer.preview"));
const P6=lazy(()=>import("@/components/custom/input-form.preview"));
const P7=lazy(()=>import("@/components/custom/select.preview"));
const P8=lazy(()=>import("@/components/custom/icon.preview"));
export const componentEntries: {name:string;title:string;category:string;description:string}[] = [{"name":"button","title":"Button","category":"Custom components","description":"Primary, secondary, ghost, compact, icon, loading, and unavailable actions."},{"name":"header","title":"Header / Navbar","category":"Custom components","description":"Brand mark, desktop navigation, primary action, and expandable Mobile menu."},{"name":"hero","title":"Hero","category":"Custom components","description":"Central orbital focus, flanking telemetry, headline hierarchy, and primary action."},{"name":"section","title":"Section","category":"Custom components","description":"Consistent content width, vertical rhythm, heading relationships, and responsive reflow."},{"name":"card","title":"Card","category":"Custom components","description":"Border-led containers for feature, signal, and telemetry content."},{"name":"footer","title":"Footer","category":"Custom components","description":"Brand summary, essential links, and system status information."},{"name":"input-form","title":"Input / Form","category":"Custom components","description":"Labels, help, errors, read-only fields, textareas, and honest demo feedback."},{"name":"select","title":"Select","category":"Custom components","description":"Themed trigger, keyboard listbox, selected and disabled states, and form value."},{"name":"icon","title":"Icon","category":"Custom components","description":"Geometric line icons, circular actions, and the orbital brand mark."}];
const previews: LazyExoticComponent<ComponentType>[] = [P0,P1,P2,P3,P4,P5,P6,P7,P8];
export function ComponentPreview({entry}:{entry:(typeof componentEntries)[number]}) { const Preview=previews[componentEntries.findIndex(item=>item.name===entry.name)]; return Preview ? <div className="component-previews"><section className="visual-example"><div className="visual-example-canvas"><Suspense fallback={<p>{text["Loading…"]}</p>}><Preview/></Suspense></div></section></div> : <p>{text["Preview unavailable"]}</p>; }