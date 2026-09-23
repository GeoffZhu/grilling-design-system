import fs from 'node:fs';
/** Shared token validation, CSS and contrast reports. */

export const COLOR_KEYS = ["background","foreground","card","card-foreground","popover","popover-foreground","primary","primary-foreground","secondary","secondary-foreground","muted","muted-foreground","accent","accent-foreground","destructive","border","input","ring","chart-1","chart-2","chart-3","chart-4","chart-5","sidebar","sidebar-foreground","sidebar-primary","sidebar-primary-foreground","sidebar-accent","sidebar-accent-foreground","sidebar-border","sidebar-ring"];

export function truthy_data_selector(name) {
  if (typeof name !== "string" || !/^[a-z][a-z0-9-]*$/.test(name)) throw new Error("Invalid data attribute name");
  return `[data-${name}]:not([data-${name}="false"])`;
}

export const ACTIVE_DATA = "[data-active]:not([data-active=\"false\"])";
export const DEFAULT_TAB_ACTIVE = ".cn-tabs-list:not([data-variant=\"line\"]) .cn-tabs-trigger[data-active]:not([data-active=\"false\"])";
export const THEME_SIGNATURE_MATRIX = {"actions":{"depth":".cn-button-variant-default,.cn-button-variant-secondary,.cn-button-variant-outline{box-shadow:var(--actions-shadow);border-width:var(--actions-border-width)}","color":".cn-button-variant-default{background-color:var(--primary);color:var(--primary-foreground)}.cn-button-variant-secondary{background-color:var(--secondary);color:var(--secondary-foreground)}","state":".cn-button-variant-default:active,.cn-button-variant-secondary:active,.cn-button-variant-outline:active,.cn-button[data-pressed=\"true\"]{transform:translateY(var(--actions-pressed-offset));box-shadow:var(--actions-shadow)}"},"inputs":{"depth":".cn-input:not(.cn-input-group-input),.cn-textarea:not(.cn-input-group-textarea),.cn-select-trigger,.cn-native-select,.cn-input-group:not(.cn-command-input-group){border-width:var(--inputs-border-width);box-shadow:var(--inputs-shadow)}","color":".cn-input:not(.cn-input-group-input),.cn-textarea:not(.cn-input-group-textarea),.cn-select-trigger,.cn-native-select,.cn-input-group:not(.cn-command-input-group){background-color:var(--card);color:var(--card-foreground)}","state":".cn-input:not(.cn-input-group-input):focus-visible,.cn-textarea:not(.cn-input-group-textarea):focus-visible,.cn-select-trigger:focus-visible,.cn-native-select:focus-visible,.cn-input-group:not(.cn-command-input-group):focus-within{border-color:var(--ring);box-shadow:var(--inputs-shadow);outline:3px solid color-mix(in srgb,var(--ring) 28%,transparent);outline-offset:2px}"},"selection":{"depth":".cn-checkbox,.cn-radio-group-item{border-width:var(--selection-border-width);box-shadow:var(--selection-shadow)}","color":".cn-checkbox[data-checked=\"true\"],.cn-radio-group-item[data-checked=\"true\"],.cn-switch[data-checked]:not([data-checked=\"false\"]){background-color:var(--primary);border-color:var(--primary);color:var(--primary-foreground)}","state":".cn-checkbox:active,.cn-radio-group-item:active,.cn-switch:active{transform:translateY(var(--selection-pressed-offset));filter:none}"},"navigation":{"depth":".cn-tabs-list:not([data-variant=\"line\"]){border:var(--navigation-border-width) solid var(--border);box-shadow:var(--navigation-shadow)}.cn-tabs-list:not([data-variant=\"line\"]) .cn-tabs-trigger[data-active]:not([data-active=\"false\"]),.cn-toggle[data-pressed=\"true\"]{box-shadow:var(--navigation-shadow)}","color":".cn-tabs-list:not([data-variant=\"line\"]) .cn-tabs-trigger[data-active]:not([data-active=\"false\"]),.cn-toggle[data-pressed=\"true\"]{background-color:var(--accent);color:var(--accent-foreground)}","state":".cn-tabs-trigger:active,.cn-toggle:active{transform:translateY(var(--navigation-pressed-offset))}"},"data-display":{"depth":".cn-card,.cn-attachment{box-shadow:var(--data-display-shadow);border-width:var(--data-display-border-width)}.cn-table-container{box-shadow:var(--data-display-shadow);border-width:var(--data-display-border-width)}.cn-item{box-shadow:none}","color":".cn-table-header{background-color:color-mix(in srgb,var(--secondary) 55%,var(--card))}.cn-table-row:hover{background-color:color-mix(in srgb,var(--accent) 38%,transparent)}","state":".cn-card:focus-within,.cn-table-container:focus-within{border-color:var(--ring)}"},"overlays":{"depth":".cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-hover-card-content,.cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{border-width:var(--overlays-border-width);box-shadow:var(--overlays-shadow)}","color":".cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content{background-color:var(--popover);color:var(--popover-foreground)}","state":".cn-select-item[data-highlighted=\"true\"],.cn-dropdown-menu-item[data-highlighted=\"true\"],.cn-context-menu-item[data-highlighted=\"true\"],.cn-menubar-item[data-highlighted=\"true\"]{background-color:var(--accent);color:var(--accent-foreground)}"},"feedback":{"depth":".cn-alert,.cn-toast{border-width:var(--feedback-border-width);box-shadow:var(--feedback-shadow)}","color":".cn-alert{border-inline-start:var(--feedback-accent-width) solid var(--secondary)}.cn-toast{border-inline-start:var(--feedback-accent-width) solid var(--accent)}.cn-progress-track{background-color:var(--secondary)}.cn-progress-indicator{background-color:var(--primary)}","state":".cn-alert:hover,.cn-toast:hover{border-color:var(--ring)}.cn-progress-indicator{transition-timing-function:var(--motion-easing)}"}};
export const STATE_RULES = {"disabled":["[data-disabled=\"true\"],[data-disabled]:not([data-disabled=\"false\"]),[aria-disabled=\"true\"],:disabled","opacity:.5;pointer-events:none;cursor:not-allowed"],"focus-visible":[":focus-visible,[data-focus-visible=\"true\"],[data-focus-visible]:not([data-focus-visible=\"false\"])","outline:3px solid color-mix(in srgb,var(--ring) 50%,transparent);outline-offset:2px"],"invalid":["[data-invalid=\"true\"],[data-invalid]:not([data-invalid=\"false\"]),[aria-invalid=\"true\"]","border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)"],"open":["[data-open=\"true\"],[data-open]:not([data-open=\"false\"]),[data-state=\"open\"]","opacity:1;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)"],"closed":["[data-closed=\"true\"],[data-closed]:not([data-closed=\"false\"]),[data-state=\"closed\"]","opacity:0;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)"],"starting-style":["[data-starting-style=\"true\"],[data-starting-style]:not([data-starting-style=\"false\"])","opacity:0;transform:scale(.98)"],"ending-style":["[data-ending-style=\"true\"],[data-ending-style]:not([data-ending-style=\"false\"])","opacity:0;transform:scale(.98)"],"selected":["[data-selected=\"true\"],[data-selected]:not([data-selected=\"false\"])","border-color:var(--primary);background-color:var(--accent);color:var(--accent-foreground)"],"checked":["[data-checked=\"true\"],[data-checked]:not([data-checked=\"false\"])","border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)"],"unchecked":["[data-unchecked=\"true\"],[data-unchecked]:not([data-unchecked=\"false\"])","background-color:var(--background);color:var(--foreground)"],"indeterminate":["[data-indeterminate=\"true\"],[data-indeterminate]:not([data-indeterminate=\"false\"])","border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)"],"pressed":["[data-pressed=\"true\"],[data-pressed]:not([data-pressed=\"false\"]),[aria-pressed=\"true\"]","background-color:var(--accent);color:var(--accent-foreground)"],"active":["[data-active]:not([data-active=\"false\"])","background-color:var(--accent);color:var(--accent-foreground)"],"highlighted":["[data-highlighted=\"true\"],[data-highlighted]:not([data-highlighted=\"false\"])","background-color:var(--accent);color:var(--accent-foreground)"],"current":["[aria-current]:not([aria-current=\"false\"])","color:var(--foreground);font-weight:var(--label-weight)"],"expanded":["[data-expanded=\"true\"],[data-expanded]:not([data-expanded=\"false\"]),[aria-expanded=\"true\"]","transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)"],"loading":["[data-loading=\"true\"],[data-loading]:not([data-loading=\"false\"]),[aria-busy=\"true\"]","opacity:.72;cursor:progress"],"horizontal":["[data-horizontal=\"true\"],[data-horizontal]:not([data-horizontal=\"false\"]),[aria-orientation=\"horizontal\"]","flex-direction:row"],"vertical":["[data-vertical=\"true\"],[data-vertical]:not([data-vertical=\"false\"]),[aria-orientation=\"vertical\"]","flex-direction:column"],"side":["[data-side]","transform-origin:var(--transform-origin)"]};
export const STATE_SCOPES = {"invalid":[".cn-button",".cn-input",".cn-textarea",".cn-select-trigger",".cn-native-select",".cn-checkbox",".cn-radio-group-item",".cn-switch",".cn-input-otp-slot",".cn-input-group",".cn-combobox-input",".cn-combobox-chips"],"open":[".cn-dialog-content",".cn-alert-dialog-content",".cn-sheet-content",".cn-drawer-popup",".cn-popover-content",".cn-hover-card-content",".cn-select-content",".cn-combobox-content",".cn-dropdown-menu-content",".cn-context-menu-content",".cn-menubar-content",".cn-tooltip-content"],"closed":[".cn-dialog-content",".cn-alert-dialog-content",".cn-sheet-content",".cn-drawer-popup",".cn-popover-content",".cn-hover-card-content",".cn-select-content",".cn-combobox-content",".cn-dropdown-menu-content",".cn-context-menu-content",".cn-menubar-content",".cn-tooltip-content"],"starting-style":[".cn-dialog-content",".cn-alert-dialog-content",".cn-sheet-content",".cn-drawer-popup",".cn-popover-content",".cn-hover-card-content",".cn-select-content",".cn-combobox-content",".cn-dropdown-menu-content",".cn-context-menu-content",".cn-menubar-content",".cn-tooltip-content"],"ending-style":[".cn-dialog-content",".cn-alert-dialog-content",".cn-sheet-content",".cn-drawer-popup",".cn-popover-content",".cn-hover-card-content",".cn-select-content",".cn-combobox-content",".cn-dropdown-menu-content",".cn-context-menu-content",".cn-menubar-content",".cn-tooltip-content"],"selected":[".cn-command-item",".cn-questionnaire-choice",".cn-calendar-day-button"],"checked":[".cn-checkbox",".cn-radio-group-item",".cn-switch"],"unchecked":[".cn-checkbox",".cn-radio-group-item",".cn-switch"],"indeterminate":[".cn-checkbox"],"pressed":[".cn-toggle",".cn-toggle-group-item",".cn-button"],"active":[".cn-tabs-trigger",".cn-sidebar-menu-button",".cn-pagination-link"],"highlighted":[".cn-select-item",".cn-combobox-item",".cn-dropdown-menu-item",".cn-context-menu-item",".cn-menubar-item"],"current":[".cn-breadcrumb-page",".cn-pagination-link",".cn-navigation-menu-link",".cn-sidebar-menu-button"]};
export const STRUCTURAL_REQUIREMENTS = {"command-item-layout":["cn-command-item",["display:flex","align-items:center","line-height:1.25rem"]],"command-selected-truth":["cn-command-item[data-selected=\"true\"]",["background-color:var(--accent)"]],"otp-slot-geometry":["cn-input-otp-slot",["width:var(--control-height)","height:var(--control-height)","border:1px solid var(--input)"]],"otp-slot-active-truth":["cn-input-otp-slot[data-active=\"true\"]",["z-index:1","border-color:var(--ring)"]],"otp-invalid":["cn-input-otp:has(.cn-input-otp-input[aria-invalid=\"true\"]) .cn-input-otp-slot",["border-color:var(--destructive)"]],"otp-caret":["cn-input-otp-caret-line",["width:1px","height:1.25rem"]],"button-icon-optical-size":["cn-button > :is(svg,[data-icon])",["width:min(var(--icon-size),1.125rem)","height:min(var(--icon-size),1.125rem)","flex:none"]],"button-xs-icon-optical-size":["cn-button-size-xs > :is(svg,[data-icon])",["width:.875rem","height:.875rem"]],"native-select-appearance":["cn-native-select",["appearance:none","padding-inline-end:calc(var(--control-padding) + var(--icon-size))"]],"native-select-icon-position":["cn-native-select-icon",["position:absolute","right:var(--control-padding)","top:50%"]],"native-select-small":["cn-native-select[data-size=\"sm\"]",["height:2rem"]],"sheet-overlay-layer":["cn-sheet-overlay",["position:fixed","inset:0","z-index:80"]],"sheet-content-layer":["cn-sheet-content",["position:fixed","z-index:81"]],"switch-checked-track":["cn-switch[data-checked]:not([data-checked=\"false\"])",["background-color:var(--primary)"]],"switch-checked-thumb":["cn-switch[data-checked]:not([data-checked=\"false\"]) .cn-switch-thumb",["transform:translateX(calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)))"]],"switch-unchecked-thumb":["cn-switch[data-unchecked]:not([data-unchecked=\"false\"]) .cn-switch-thumb",["transform:translateX(0)"]],"input-group-control-frame":["cn-input-group > .cn-input-group-input",["border:0","box-shadow:none","background:transparent"]],"input-group-textarea-frame":["cn-input-group > .cn-input-group-textarea",["border:0","box-shadow:none","background:transparent"]],"input-group-addon-frame":["cn-input-group > .cn-input-group-addon",["border:0","box-shadow:none","background:transparent"]],"checkbox-root-centering":["cn-checkbox",["display:inline-grid","place-items:center","width:1rem","height:1rem","min-width:1rem","min-height:1rem","padding:0","line-height:0"]],"checkbox-indicator-centering":["cn-checkbox-indicator",["position:absolute","inset:0","display:grid","place-items:center","width:100%","height:100%","line-height:0","pointer-events:none"]],"checkbox-icon-centering":["cn-checkbox-indicator > svg",["display:block","width:.75rem","height:.75rem","margin:auto","flex:none"]],"calendar-dropdown-control":["cn-calendar-dropdown-root",["display:inline-flex","align-items:center","min-width:5.5rem","min-height:2.5rem","overflow:hidden"]],"calendar-caption-control":["cn-calendar-caption-label",["width:100%","min-height:2.375rem","justify-content:space-between","padding-inline:.625rem"]],"calendar-single-selection-fill":["cn-calendar-day-button[data-selected-single=\"true\"]",["background-color:var(--primary)","color:var(--primary-foreground)"]],"calendar-range-start-fill":["cn-calendar-day-button[data-range-start=\"true\"]",["background-color:var(--primary)","color:var(--primary-foreground)"]],"calendar-range-end-fill":["cn-calendar-day-button[data-range-end=\"true\"]",["background-color:var(--primary)","color:var(--primary-foreground)"]],"button-group-frame":["cn-button-group",["display:flex","width:fit-content","max-width:100%","align-items:stretch","border:var(--actions-border-width) solid var(--border)","border-radius:var(--control-radius)","box-shadow:var(--design-shadow)","overflow:hidden","isolation:isolate"]],"button-group-child-reset":["cn-button-group > [data-slot]:not([data-slot=\"button-group-separator\"])",["border:0","border-radius:0","box-shadow:none","margin:0"]],"button-group-horizontal-separator":["cn-button-group:not([data-orientation=\"vertical\"]) > [data-slot] + [data-slot]",["border-inline-start:1px solid var(--border)"]],"button-group-vertical-separator":["cn-button-group[data-orientation=\"vertical\"] > [data-slot] + [data-slot]",["border-block-start:1px solid var(--border)"]],"button-group-focus":["cn-button-group > [data-slot]:focus-visible",["position:relative","z-index:2","outline:2px solid var(--ring)","outline-offset:-2px","box-shadow:none!important"]],"button-group-pressed":["cn-button-group .cn-button:active",["transform:none","box-shadow:none!important"]],"input-group-frame-clipping":["cn-input-group",["overflow:hidden"]],"input-group-inline-addon":["cn-input-group:not(.cn-command-input-group) > .cn-input-group-addon[data-align=\"inline-start\"]",["flex:none","min-height:var(--control-height)","padding-inline:.75rem","border-inline-end:1px solid var(--border)"]],"input-group-inline-end-addon":["cn-input-group:not(.cn-command-input-group) > .cn-input-group-addon[data-align=\"inline-end\"]",["flex:none","min-height:var(--control-height)","padding-inline:.75rem","border-inline-start:1px solid var(--border)"]],"input-group-button-reset":["cn-input-group-addon .cn-input-group-button",["border:0","box-shadow:none!important","margin:0"]],"input-group-button-addon":["cn-input-group > .cn-input-group-addon:has(> .cn-input-group-button):not(:has(> :not(.cn-input-group-button)))",["align-self:stretch","padding:0"]],"input-group-button-fill":["cn-input-group > .cn-input-group-addon:has(> .cn-input-group-button):not(:has(> :not(.cn-input-group-button))) > .cn-input-group-button",["height:100%","min-height:var(--control-height)","border-radius:0","padding-inline:.875rem"]],"input-group-block-layout":["cn-input-group:has(> .cn-input-group-addon[data-align=\"block-start\"])",["flex-wrap:wrap","align-items:stretch"]],"input-group-block-addon":["cn-input-group > .cn-input-group-addon[data-align=\"block-start\"]",["flex:0 0 100%","width:100%","min-height:2.5rem","padding:.75rem 1rem","border-bottom:1px solid var(--border)"]],"input-group-block-end-addon":["cn-input-group > .cn-input-group-addon[data-align=\"block-end\"]",["flex:0 0 100%","width:100%","min-height:2.5rem","padding:.75rem 1rem","border-top:1px solid var(--border)"]],"input-group-textarea-wrapper":["cn-input-group:has(> .cn-input-group-textarea)",["flex-direction:column","align-items:stretch","height:auto","min-height:7rem"]],"input-group-textarea-layout":["cn-input-group > .cn-input-group-textarea[data-slot=\"input-group-control\"]",["width:100%","min-height:5.5rem","flex:1 1 auto","padding:1rem"]],"input-group-invalid-frame":["cn-input-group:has(> [aria-invalid=\"true\"])",["border-color:var(--destructive)","box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)"]],"input-group-invalid-control-reset":["cn-input-group > [aria-invalid=\"true\"]",["border:0","box-shadow:none!important","outline:none"]],"invalid-control-ring":["cn-input[aria-invalid=\"true\"]",["border-color:var(--destructive)","box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)"]],"card-field-spacing":["cn-card-content > .cn-field-group",["gap:1.25rem"]],"card-footer-spacing":["cn-card > .cn-card-footer",["gap:.5rem"]],"command-input-boundary":["cn-command-input-wrapper",["border-bottom:1px solid var(--border)","padding:0"]],"command-input-group-layout":["cn-command-input-group",["display:flex","align-items:center","width:100%","min-height:3rem","gap:.75rem","padding-inline:1rem","border:0","box-shadow:none","background:transparent"]],"command-input-addon-layout":["cn-command-input-group > .cn-input-group-addon",["flex:none","min-height:0","padding:0","border:0","background:transparent"]],"command-input-layout":["cn-command-input",["min-width:0","height:3rem","flex:1","border:0","background:transparent","padding-inline:0"]],"command-group-spacing":["cn-command-group",["padding:.5rem"]],"command-group-heading-spacing":["cn-command-group [cmdk-group-heading]",["padding:.375rem .5rem .5rem","line-height:1rem"]],"command-group-items-spacing":["cn-command-group [cmdk-group-items]",["display:flex","flex-direction:column","gap:.25rem"]],"command-item-rhythm":["cn-command-item",["min-height:2.75rem","padding:.5rem .625rem","gap:.625rem"]],"command-item-icon-size":["cn-command-item > svg",["width:1rem","height:1rem","flex:none","align-self:center"]],"select-trigger-icon-frame":["cn-select-trigger-icon",["display:inline-flex","align-items:center","justify-content:center","align-self:center","width:1rem","height:1rem","line-height:0","flex:none"]],"select-trigger-icon-glyph":["cn-select-trigger-icon-glyph",["display:block","width:1rem","height:1rem","flex:none"]],"select-trigger-icon-gap":["cn-select-trigger",["gap:.5rem"]],"navigation-trigger-icon-frame":["cn-navigation-menu-trigger-icon",["display:inline-flex","align-items:center","justify-content:center","align-self:center","width:1rem","height:1rem","line-height:0","flex:none"]],"navigation-trigger-icon-glyph":["cn-navigation-menu-trigger-icon-glyph",["display:block","width:1rem","height:1rem","flex:none"]],"navigation-trigger-icon-gap":["cn-navigation-menu-trigger",["gap:.5rem"]],"navigation-open-state":["cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open=\"false\"])",["background-color:var(--accent)","color:var(--accent-foreground)"]],"navigation-open-icon":["cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open=\"false\"]) .cn-navigation-menu-trigger-icon",["transform:rotate(180deg)"]],"navigation-link-descendant-hover":["cn-navigation-menu-link:hover .text-muted-foreground",["color:var(--accent-foreground)!important"]],"navigation-content-link-box":["cn-navigation-menu-content .cn-navigation-menu-link",["display:block","width:100%"]],"sidebar-dropdown-trigger":["cn-sidebar-inner .cn-sidebar-menu-button[data-popup-open]:not([data-popup-open=\"false\"])",["background-color:var(--sidebar-accent)!important","color:var(--sidebar-accent-foreground)!important"]],"sidebar-dropdown-item-reset":["cn-sidebar-inner .cn-sidebar-menu-button > .cn-item",["border:0!important","background:transparent!important","box-shadow:none!important"]],"sidebar-dropdown-content":["cn-sidebar-dropdown-content",["z-index:75!important","width:var(--anchor-width)","min-width:min(var(--anchor-width),calc(100vw - 2rem))","max-width:calc(100vw - 2rem)"]],"sidebar-dropdown-positioner":["cn-dropdown-menu-positioner:has(> .cn-sidebar-dropdown-content)",["z-index:75!important"]],"sidebar-header-controls-spacing":["cn-sidebar-header",["display:flex","flex-direction:column","gap:.75rem","padding:.75rem"]],"tabs-active-state":["cn-tabs-trigger[data-active]:not([data-active=\"false\"])",["background-color:var(--accent)","color:var(--accent-foreground)","border-color:var(--border)","box-shadow:var(--navigation-shadow)"]],"tabs-inactive-state":["cn-tabs-trigger[data-active=\"false\"]",["background-color:transparent","border-color:transparent","box-shadow:none"]],"tabs-line-active-state":["cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger[data-active]:not([data-active=\"false\"])",["background-color:transparent","border-color:transparent","box-shadow:none"]],"tabs-line-active-color":["cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger[data-active]:not([data-active=\"false\"])",["color:var(--foreground)"]],"tabs-line-list-frame":["cn-tabs-list[data-variant=\"line\"]",["border:0","background:transparent","box-shadow:none"]],"tabs-line-trigger-frame":["cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger",["border:0","box-shadow:none"]],"tabs-line-indicator-inset":["cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger::after",["inset-inline:max(.5rem,calc(var(--control-radius)*.5))","bottom:0","height:2px","border-radius:9999px"]],"tabs-line-indicator-active":["cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger[data-active]:not([data-active=\"false\"])::after",["opacity:1"]],"dialog-close-position":["cn-dialog-close",["position:absolute","top:1rem","right:1rem","z-index:1","display:inline-grid","place-items:center"]],"dialog-close-clearance":["cn-dialog-content:has(> .cn-dialog-close)",["padding-inline-end:3.5rem"]],"alert-layout":["cn-alert",["display:grid","grid-template-columns:minmax(0,1fr) auto","align-items:start"]],"alert-leading-layout":["cn-alert:has(> svg)",["grid-template-columns:auto minmax(0,1fr) auto"]],"alert-leading-icon":["cn-alert > svg",["grid-column:1","grid-row:1 / span 2","align-self:start"]],"avatar-default-size":["cn-avatar[data-size=\"default\"]",["width:2.5rem","height:2.5rem","aspect-ratio:1"]],"avatar-small-size":["cn-avatar[data-size=\"sm\"]",["width:2rem","height:2rem"]],"avatar-large-size":["cn-avatar[data-size=\"lg\"]",["width:3rem","height:3rem"]],"message-scroller-spacing":["cn-message-scroller-content",["gap:.75rem","padding-block:.5rem"]],"collapsible-trigger-hover":["cn-button[data-slot=\"collapsible-trigger\"]:hover",["background-color:var(--muted)!important","color:var(--foreground)!important"]],"collapsible-trigger-focus":["cn-button[data-slot=\"collapsible-trigger\"]:focus-visible",["background-color:var(--muted)!important","color:var(--foreground)!important"]],"collapsible-trigger-open":["cn-button[data-slot=\"collapsible-trigger\"][data-panel-open]:not([data-panel-open=\"false\"])",["background-color:var(--muted)!important","color:var(--foreground)!important"]],"collapsible-trigger-muted-hover":["cn-button[data-slot=\"collapsible-trigger\"]:hover .text-muted-foreground",["color:var(--foreground)!important"]],"collapsible-trigger-icon-hover":["cn-button[data-slot=\"collapsible-trigger\"]:hover svg",["color:var(--foreground)!important","stroke:currentColor"]]};
export const SOURCE_STATE_PATTERNS = {"disabled":["(?<![\\w-])data-(?:disabled|\\[disabled=true\\]):","(?<![\\w-])aria-disabled:"],"focus-visible":["(?<![\\w-])focus-visible:","(?<![\\w-])data-focus-visible:"],"invalid":["(?<![\\w-])data-invalid:","(?<![\\w-])aria-invalid:"],"open":["(?<![\\w-])data-(?:open|\\[state=open\\]):"],"closed":["(?<![\\w-])data-(?:closed|\\[state=closed\\]):"],"starting-style":["(?<![\\w-])data-starting-style:"],"ending-style":["(?<![\\w-])data-ending-style:"],"selected":["(?<![\\w-])data-(?:selected|\\[selected=true\\]):"],"checked":["(?<![\\w-])data-checked:"],"unchecked":["(?<![\\w-])data-unchecked:"],"indeterminate":["(?<![\\w-])data-indeterminate:"],"pressed":["(?<![\\w-])data-pressed:","(?<![\\w-])aria-pressed:"],"active":["(?<![\\w-])data-(?:active|\\[active=true\\]):"],"highlighted":["(?<![\\w-])data-highlighted:"],"current":["(?<![\\w-])aria-current:"],"expanded":["(?<![\\w-])data-expanded:","(?<![\\w-])aria-expanded:"],"loading":["(?<![\\w-])data-loading:","(?<![\\w-])aria-busy:"],"horizontal":["(?<![\\w-])data-horizontal:","(?<![\\w-])aria-\\[orientation=horizontal\\]:"],"vertical":["(?<![\\w-])data-vertical:","(?<![\\w-])aria-\\[orientation=vertical\\]:"],"side":["(?<![\\w-])data-\\[side=(?:top|right|bottom|left)\\]:"]};

const unique = (values) => [...new Set(values)];
const sorted = (values) => [...values].sort();
const py_truthy = (value) => value != null && value !== false && value !== 0 && value !== "" && (!Array.isArray(value) || value.length > 0) && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length > 0);
const regex_escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function visual_contract(file_groups) {
  const content = Array.from(file_groups).flatMap((files) => Array.from(files)).map((file) => file?.content ?? "").join("\n");
  const hooks = sorted(unique([...content.matchAll(/(?<![A-Za-z0-9_-])(cn-[a-z0-9-]+)/g)].map((match) => match[1])));
  const observedStates = sorted(Object.entries(SOURCE_STATE_PATTERNS)
    .filter(([, patterns]) => patterns.some((pattern) => new RegExp(pattern).test(content)))
    .map(([name]) => name));
  return { hooks, requiredStates: STATE_RULES, observedStates };
}

export function semantic_hook_properties(hook) {
  const props = [];
  const words = new Set(hook.replace(/^cn-/, "").split("-"));
  if (["title", "label", "legend"].some((word) => words.has(word))) props.push("font-weight:var(--label-weight)");
  if (["description", "shortcut", "caption"].some((word) => words.has(word))) props.push("color:var(--muted-foreground)");
  if (hook.endsWith("-variant-outline")) props.push("border-color:var(--border)");
  if (hook.endsWith("-variant-border")) props.push("border-color:var(--border)");
  if (hook.endsWith("-variant-default")) props.push("background-color:var(--card)", "color:var(--card-foreground)");
  if (hook.endsWith("-variant-destructive")) props.push("color:var(--destructive)");
  if (["-variant-muted", "-variant-secondary", "-variant-tinted"].some((suffix) => hook.endsWith(suffix))) props.push("background-color:var(--muted)");
  if (hook.endsWith("-variant-ghost")) props.push("background-color:transparent");
  if (hook.endsWith("-avatar")) props.push("border-radius:9999px", "background-color:var(--muted)");
  return unique(props);
}

export function semantic_hook_css(hooks) {
  if (!py_truthy(hooks)) return "";
  const rules = [];
  for (const hook of hooks) {
    const props = semantic_hook_properties(hook);
    if (!props.length) continue;
    rules.push(`.${hook}{${["transition-duration:var(--motion-duration)", "transition-timing-function:var(--motion-easing)", ...props].join(";")};}`);
  }
  return rules.join("\n") + "\n";
}

export function classify_hooks(hooks, explicit_css) {
  const explicit = new Set([...explicit_css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]));
  const inferred = [], structural = [], unclassified = [];
  const structuralTerms = new Set(["root","group","list","wrapper","viewport","portal","positioner","header","footer","actions","content","set","gap","input","item","icon","caret","indicator","arrow","ellipsis","separator","track","rail","progress","trigger","button","action","link","choice","chip","close","cancel","previous","next","skip","submit","clear","media","popup","logical","empty","skeleton","value","text","range","thumb","overlay","scroll","sub","option","size","orientation","variant","align","side","count","reactions","body","cell","head","caption","page","badge","tooltip","chips","subcontent"]);
  const structuralNames = new Set(["cn-accordion","cn-breadcrumb","cn-chart","cn-message","cn-message-scroller","cn-navigation-menu","cn-pagination","cn-scroll-area","cn-slider","cn-table","cn-table-body","cn-tabs","cn-menu-target","cn-menu-translucent","cn-rtl-flip"]);
  for (const hook of hooks) {
    if (explicit.has(hook)) continue;
    if (semantic_hook_properties(hook).length) inferred.push(hook);
    else if (hook.replace(/^cn-/, "").split("-").some((word) => structuralTerms.has(word)) || structuralNames.has(hook)) structural.push(hook);
    else unclassified.push(hook);
  }
  const hookSet = new Set(hooks);
  return {
    explicitHooks: sorted([...hookSet].filter((hook) => explicit.has(hook))),
    inferredHooks: sorted(inferred),
    structuralHooks: sorted(structural),
    unclassifiedHooks: sorted(unclassified),
  };
}

export function state_css(required_states = null) {
  const names = py_truthy(required_states)
    ? (typeof required_states[Symbol.iterator] === "function" ? required_states : Object.keys(required_states))
    : Object.keys(STATE_RULES);
  const rules = [];
  for (const name of names) {
    const [selectors, declarations] = STATE_RULES[name];
    const scopes = STATE_SCOPES[name] ?? ['[class*="cn-"]'];
    const scoped = scopes.flatMap((scope) => selectors.split(",").map((selector) => scope + selector)).join(",");
    rules.push(scoped + "{" + declarations + ";}");
  }
  return rules.join("\n") + "\n";
}

export function state_selectors(name) {
  const selectors = STATE_RULES[name][0].split(",");
  const scopes = STATE_SCOPES[name] ?? ['[class*="cn-"]'];
  return scopes.flatMap((scope) => selectors.map((selector) => scope + selector));
}

export function audit_visual_css(contract, stylesheet, explicit_css) {
  const defined = new Set([...stylesheet.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]));
  const classes = classify_hooks(contract.hooks, explicit_css);
  const visualHooks = new Set([...classes.explicitHooks, ...classes.inferredHooks]);
  const missingHooks = sorted([...visualHooks].filter((hook) => !defined.has(hook)));
  const missingStates = [];
  const stateProperties = {};
  for (const [name, [, declarations]] of Object.entries(contract.requiredStates)) {
    const properties = sorted(unique([...declarations.matchAll(/([a-z-]+)\s*:/g)].map((match) => match[1])));
    stateProperties[name] = properties;
    if (!properties.length || !state_selectors(name).some((selector) => stylesheet.includes(selector))) missingStates.push(name);
  }
  const compact = stylesheet.replace(/\s+/g, "");
  const contractHooks = new Set(contract.hooks);
  const applicable = {};
  for (const [name, [selector, declarations]] of Object.entries(STRUCTURAL_REQUIREMENTS)) {
    const hooks = new Set(selector.match(/cn-[a-z0-9-]+/g) ?? []);
    for (const match of selector.matchAll(/:not\(\.(cn-[a-z0-9-]+)\)/g)) hooks.delete(match[1]);
    if ([...hooks].every((hook) => contractHooks.has(hook))) applicable[name] = [selector, declarations];
  }
  const missingStructures = [];
  for (const [name, [selector, declarations]] of Object.entries(applicable)) {
    const compactSelector = selector.replace(/\s+/g, "");
    const pattern = new RegExp("\\." + regex_escape(compactSelector) + "\\{([^}]*)\\}", "g");
    const blocks = [...compact.matchAll(pattern)].map((match) => match[1]);
    if (!blocks.length || !blocks.some((block) => declarations.every((declaration) => block.includes(declaration.replace(/\s+/g, ""))))) missingStructures.push(name);
  }
  return {
    coveredHooks: sorted([...visualHooks].filter((hook) => defined.has(hook))),
    ...classes,
    missingHooks,
    stateProperties,
    missingStates,
    structuralRequirements: sorted(Object.keys(applicable)),
    missingStructures: sorted(missingStructures),
  };
}

export function geometry(t) {
  const base = t.radius;
  return { controlRadius: base, surfaceRadius: base, overlayRadius: base, bodyLineHeight: 1.5, headingLineHeight: 1.15, headingTracking: -0.035, labelWeight: 500, controlPadding: 16, iconGap: 8, ...(t.craft ?? {}) };
}

/** Optional per-family choices. Missing entries are documented script defaults. */
export function signature(t) {
  const supplied = t.signature ?? {};
  if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('signature must be a family map');
  for (const family of Object.keys(supplied)) {
    if (!Object.hasOwn(THEME_SIGNATURE_MATRIX, family)) throw new Error('Unknown signature family: ' + family);
  }
  return Object.fromEntries(Object.keys(THEME_SIGNATURE_MATRIX).map((family) => {
    const value = supplied[family] ?? {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid signature family: ' + family);
    const defaults = { shadow: ['data-display', 'overlays', 'feedback'].includes(family) ? t.shadow : 'none', borderWidth: 1 };
    if (['actions', 'selection', 'navigation'].includes(family)) defaults.pressedOffset = 0;
    if (family === 'feedback') defaults.accentWidth = 0;
    for (const key of Object.keys(value)) if (!Object.hasOwn(defaults, key)) throw new Error('Unsupported signature property for ' + family + ': ' + key);
    const result = { ...defaults, ...value };
    for (const [key, entry] of Object.entries(result)) {
      if (key === 'shadow') {
        if (typeof entry !== 'string' || !entry.trim() || /[;{}<>\n]/.test(entry) || /url\s*\(/i.test(entry)) throw new Error('Invalid signature shadow');
      } else if (!['borderWidth', 'pressedOffset', 'accentWidth'].includes(key) || typeof entry !== 'number' || !Number.isFinite(entry) || entry < 0 || entry > 16) {
        throw new Error('Invalid signature property: ' + key);
      }
    }
    return [family, result];
  }));
}

function signature_declarations(t) {
  return Object.entries(signature(t)).flatMap(([family, values]) => Object.entries(values).map(([key, value]) =>
    '--' + family + '-' + key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase()) + ':' + value + (key === 'shadow' ? '' : 'px'),
  )).join(';');
}

export function style_provenance(t) {
  return {
    craft: Object.fromEntries(Object.entries(geometry(t)).map(([key, value]) => [key, { value, source: Object.hasOwn(t.craft ?? {}, key) ? 'token' : 'script-default' }])),
    signature: Object.fromEntries(Object.entries(signature(t)).map(([family, values]) => [family, Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value, source: Object.hasOwn(t.signature?.[family] ?? {}, key) ? 'token' : 'script-default' }]))])),
  };
}

export function validate(t) {
  for (const key of ["name","slug","mode","colors","radius","font","spacing","icons","motion","shadow"]) {
    if (!(key in t)) throw new Error("Missing token group: " + key);
  }
  if (typeof t.name !== "string" || !t.name.trim()) throw new Error("name must be a non-empty model-authored design name");
  if (typeof t.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug)) throw new Error("slug must be a model-authored kebab-case name");
  if (!["light", "dark"].includes(t.mode)) throw new Error("mode must be light or dark");
  if (py_truthy(t.alternate) && (!["light", "dark"].includes(t.alternate.mode) || t.alternate.mode === t.mode)) throw new Error("alternate.mode must be the other mode");
  for (const colors of [t.colors, ...(py_truthy(t.alternate) ? [t.alternate.colors] : [])]) {
    for (const key of COLOR_KEYS) if (!(key in colors)) throw new Error("Missing color token: " + key);
    for (const [key, value] of Object.entries(colors)) {
      if (!/^[a-z][a-z0-9-]*$/.test(key)) throw new Error("Invalid color key");
      if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error("Use six-digit hex colors");
    }
  }
  for (const [group, keys] of Object.entries({ font:["family","heading","bodySize","headingWeight"], spacing:["unit","controlHeight"], icons:["family","size","stroke"], motion:["duration","easing"] })) {
    for (const key of keys) if (!(key in t[group])) throw new Error("Missing " + group + "." + key);
  }
  for (const value of [t.font.family,t.font.heading,t.motion.easing,t.shadow]) {
    if ([";", "{", "}", "<", ">", "\n"].some((char) => String(value).includes(char))) throw new Error("Invalid CSS token");
  }
  for (const value of [t.radius,t.font.bodySize,t.font.headingWeight,t.spacing.unit,t.spacing.controlHeight,t.icons.size,t.icons.stroke,t.motion.duration]) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error("Invalid numeric token");
  }
  const limits = { controlRadius:[0,9999], surfaceRadius:[0,9999], overlayRadius:[0,9999], bodyLineHeight:[1,2.5], headingLineHeight:[.9,2], headingTracking:[-.1,.2], labelWeight:[100,1000], controlPadding:[0,64], iconGap:[0,32] };
  for (const [key, value] of Object.entries(t.craft ?? {})) {
    if (!(key in limits) || typeof value !== "number" || !Number.isFinite(value) || value < limits[key][0] || value > limits[key][1]) throw new Error("Invalid craft token: " + key);
  }
  signature(t);
  return t;
}

export function declarations(t) {
  validate(t);
  const colors = Object.entries(t.colors).map(([key, value]) => "--" + key + ":" + value).join(";");
  const craft = geometry(t);
  const details = [["controlRadius","control-radius","px"],["surfaceRadius","surface-radius","px"],["overlayRadius","overlay-radius","px"],["bodyLineHeight","body-leading",""],["headingLineHeight","heading-leading",""],["headingTracking","heading-tracking","em"],["labelWeight","label-weight",""],["controlPadding","control-padding","px"],["iconGap","icon-gap","px"]]
    .map(([key, name, unit]) => "--" + name + ":" + craft[key] + unit).join(";");
  return colors + ";" + details + ";" + signature_declarations(t) + ";" + [
    "--radius-sm:" + t.radius * .6 + "px", "--radius-md:" + t.radius * .8 + "px", "--radius-lg:" + t.radius + "px",
    "--radius-xl:" + t.radius * 1.35 + "px", "--radius-2xl:" + t.radius * 1.6 + "px",
    "--radius:" + t.radius + "px", "--font-sans:" + t.font.family, "--font-heading:" + t.font.heading,
    "--body-size:" + t.font.bodySize + "px", "--heading-weight:" + t.font.headingWeight,
    "--spacing-unit:" + t.spacing.unit + "px", "--control-height:" + t.spacing.controlHeight + "px",
    "--icon-size:" + t.icons.size + "px", "--icon-stroke:" + t.icons.stroke,
    "--motion-duration:" + t.motion.duration + "ms", "--motion-easing:" + t.motion.easing,
    "--design-shadow:" + t.shadow, "color-scheme:" + t.mode,
  ].join(";") + ";";
}

const COMPONENT_BASE = fs.readFileSync(new URL('../assets/components.css', import.meta.url), 'utf8');
const BUTTON_GROUP = "\n.cn-button-group{display:flex;width:fit-content;max-width:100%;align-items:stretch;border:var(--actions-border-width) solid var(--border);border-radius:var(--control-radius);background:var(--background);box-shadow:var(--design-shadow);overflow:hidden;isolation:isolate}\n.cn-button-group[data-orientation=\"vertical\"]{flex-direction:column}\n.cn-button-group:not([data-orientation=\"vertical\"]){flex-direction:row}\n.cn-button-group>.cn-button-group{border:0;border-radius:0;background:transparent;box-shadow:none}\n.cn-button-group>[data-slot]:not([data-slot=\"button-group-separator\"]){margin:0;border:0;border-radius:0;box-shadow:none}\n.cn-button-group:not([data-orientation=\"vertical\"])>[data-slot]+[data-slot]{border-inline-start:1px solid var(--border)}\n.cn-button-group[data-orientation=\"vertical\"]>[data-slot]+[data-slot]{border-block-start:1px solid var(--border)}\n.cn-button-group>[data-slot=\"button-group-separator\"]{align-self:stretch;width:1px;height:auto;margin:0;border:0;background:var(--border)}\n.cn-button-group[data-orientation=\"vertical\"]>[data-slot=\"button-group-separator\"]{width:auto;height:1px}\n.cn-button-group:not([data-orientation=\"vertical\"])>[data-slot]+[data-slot=\"button-group-separator\"]{border-inline-start:0}\n.cn-button-group:not([data-orientation=\"vertical\"])>[data-slot=\"button-group-separator\"]+[data-slot]{border-inline-start:0}\n.cn-button-group[data-orientation=\"vertical\"]>[data-slot]+[data-slot=\"button-group-separator\"]{border-block-start:0}\n.cn-button-group[data-orientation=\"vertical\"]>[data-slot=\"button-group-separator\"]+[data-slot]{border-block-start:0}\n.cn-button-group>[data-slot=\"button-group-text\"]{display:flex;min-height:var(--control-height);align-items:center;padding-inline:var(--control-padding);background:var(--muted);color:var(--muted-foreground)}\n.cn-button-group>[data-slot]:focus-visible{position:relative;z-index:2;outline:2px solid var(--ring);outline-offset:-2px;box-shadow:none!important}\n.cn-button-group .cn-button:active{transform:none;box-shadow:none!important}\n";
const TABS_LINE = "\n.cn-tabs-list[data-variant=\"line\"]{border:0;border-radius:0;background:transparent;box-shadow:none;padding-inline:0}\n.cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger{border:0;border-radius:0;box-shadow:none}\n.cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger::after{content:\"\";position:absolute;inset-inline:max(.5rem,calc(var(--control-radius)*.5));bottom:0;height:2px;border-radius:9999px;background:var(--foreground);opacity:0}\n.cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger[data-active]:not([data-active=\"false\"])::after{opacity:1}\n.cn-tabs[data-orientation=\"vertical\"] .cn-tabs-list[data-variant=\"line\"] .cn-tabs-trigger::after{inset-inline:auto 0;inset-block:max(.5rem,calc(var(--control-radius)*.5));width:2px;height:auto}\n";
const INPUT_GROUP_COMPOSITION = "\n.cn-input-group{overflow:hidden}\n.cn-input-group:not(.cn-command-input-group)>.cn-input-group-addon[data-align=\"inline-start\"]{flex:none;min-height:var(--control-height);gap:.5rem;padding-inline:.75rem;border-inline-end:1px solid var(--border)}\n.cn-input-group:not(.cn-command-input-group)>.cn-input-group-addon[data-align=\"inline-end\"]{flex:none;min-height:var(--control-height);gap:.5rem;padding-inline:.75rem;border-inline-start:1px solid var(--border)}\n.cn-input-group-addon+.cn-input-group-addon[data-align=\"inline-start\"]{margin-inline-start:-1px}\n.cn-input-group-addon[data-align=\"inline-end\"]+.cn-input-group-addon[data-align=\"inline-end\"]{margin-inline-start:-1px}\n.cn-input-group-addon .cn-input-group-button{min-height:2rem;margin:0;border:0;border-radius:calc(var(--control-radius)*.65);box-shadow:none!important;padding-inline:.625rem}\n.cn-input-group-addon .cn-input-group-button:active{transform:none;box-shadow:none!important}\n.cn-input-group>.cn-input-group-addon:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){align-self:stretch;padding:0}\n.cn-input-group>.cn-input-group-addon[data-align=\"inline-start\"]:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){border-inline-start:0;border-inline-end:1px solid var(--border)}\n.cn-input-group>.cn-input-group-addon[data-align=\"inline-end\"]:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){border-inline-start:1px solid var(--border);border-inline-end:0}\n.cn-input-group>.cn-input-group-addon:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button)))>.cn-input-group-button{height:100%;min-height:var(--control-height);border-radius:0;padding-inline:.875rem}\n.cn-input-group:has(>.cn-input-group-textarea){flex-direction:column;flex-wrap:nowrap;align-items:stretch;height:auto;min-height:7rem}\n.cn-input-group:has(>.cn-input-group-addon[data-align=\"block-start\"]){flex-wrap:wrap;align-items:stretch;height:auto}\n.cn-input-group:has(>.cn-input-group-addon[data-align=\"block-end\"]){flex-wrap:wrap;align-items:stretch;height:auto}\n.cn-input-group>.cn-input-group-addon[data-align=\"block-start\"]{flex:0 0 100%;width:100%;min-height:2.5rem;justify-content:flex-start;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid var(--border)}\n.cn-input-group>.cn-input-group-addon[data-align=\"block-end\"]{flex:0 0 100%;width:100%;min-height:2.5rem;justify-content:flex-start;gap:.5rem;padding:.75rem 1rem;border-top:1px solid var(--border)}\n.cn-input-group:has(>.cn-input-group-textarea):has(>.cn-input-group-addon[data-align^=\"block\"]){flex-wrap:nowrap}\n.cn-input-group:has(>.cn-input-group-textarea)>.cn-input-group-addon[data-align^=\"block\"]{flex:0 0 auto}\n.cn-input-group:has(>.cn-input-group-addon[data-align^=\"block\"])>.cn-input-group-input{width:100%;flex:0 0 100%;padding:.875rem 1rem}\n.cn-input-group>.cn-input-group-textarea[data-slot=\"input-group-control\"]{width:100%;min-height:5.5rem;flex:1 1 auto;padding:1rem;line-height:1.5}\n.cn-card-content>.cn-field-group{gap:1.25rem}\n.cn-card-content>form>.cn-field-group{gap:1.25rem}\n.cn-card-content .cn-field{gap:.5rem}\n.cn-card>.cn-card-footer{gap:.5rem}\n.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin:0;color:var(--destructive)}\n.cn-field[data-invalid]>.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin-top:.25rem}\n.cn-input[aria-invalid=\"true\"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}\n.cn-textarea[aria-invalid=\"true\"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}\n.cn-select-trigger[aria-invalid=\"true\"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}\n.cn-native-select[aria-invalid=\"true\"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}\n.cn-input-group:has(>[aria-invalid=\"true\"]){border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}\n.cn-input-group[data-invalid]:not([data-invalid=\"false\"]){border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}\n.cn-input-group:has(>[aria-invalid=\"true\"]):focus-within,.cn-input-group[data-invalid]:not([data-invalid=\"false\"]):focus-within{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}\n.cn-input-group>[aria-invalid=\"true\"]{border:0;box-shadow:none!important;outline:none}\n";
const SHARED = "\n*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-leading);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}\nh1,h2,h3{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);line-height:var(--heading-leading)}\n:where(button,input,textarea,select){font:inherit}button,a,input,textarea,select{touch-action:manipulation}\n:where([data-slot=\"button\"],button[data-size][data-variant],[role=\"button\"][data-size][data-variant]){font-weight:var(--label-weight);border-radius:var(--control-radius);transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing);gap:var(--icon-gap)}\n:where([data-slot=\"button\"],button[data-size][data-variant],[role=\"button\"][data-size][data-variant]):where([data-size=\"default\"],[data-size=\"lg\"]){min-height:var(--control-height);padding-inline:var(--control-padding)}\n:where([data-slot=\"button\"],button[data-size][data-variant],[role=\"button\"][data-size][data-variant]):where([data-size=\"icon\"],[data-size=\"icon-lg\"]){min-height:var(--control-height);min-width:var(--control-height)}\n:where([data-slot=\"input\"],[data-slot=\"select-trigger\"],[data-slot=\"native-select\"]):not([data-size=\"sm\"]){min-height:var(--control-height);border-radius:var(--control-radius);padding-inline:var(--control-padding)}\n:where([data-slot=\"label\"],[data-slot=\"tabs-trigger\"]){font-weight:var(--label-weight)}\n:where([data-slot=\"card\"]){border-radius:var(--surface-radius);box-shadow:var(--design-shadow)}\n:where([data-slot=\"dialog-content\"],[data-slot=\"alert-dialog-content\"],[data-slot=\"popover-content\"],[data-slot=\"dropdown-menu-content\"]){border-radius:var(--overlay-radius)}\n/* Keep the painted track independent of its transparent 44px hit area. */\n:where([data-slot=\"switch\"]){--switch-width:44px;--switch-height:24px;--switch-thumb-size:18px;--switch-inset:3px;position:relative;display:inline-flex;align-items:center;justify-content:flex-start;flex-shrink:0;width:var(--switch-width);height:var(--switch-height);min-width:0;min-height:0;padding:var(--switch-inset);border:0;border-radius:9999px;background-clip:border-box;box-shadow:none;cursor:pointer;transition-property:background-color;transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)}\n:where([data-slot=\"switch\"])[data-size=\"sm\"]{--switch-width:36px;--switch-height:20px;--switch-thumb-size:14px}\n:where([data-slot=\"switch\"]):disabled{cursor:not-allowed}\n:where([data-slot=\"switch\"])::after{content:\"\";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)}\n:where([data-slot=\"switch-thumb\"]){width:var(--switch-thumb-size);height:var(--switch-thumb-size);flex-shrink:0;translate:0;transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)}\n.lucide{stroke-width:var(--icon-stroke)}\n:focus-visible{outline:3px solid var(--ring);outline-offset:3px}\n@media(pointer:coarse){:is(button,[role=\"button\"],[role=\"tab\"]):not([role=\"switch\"]):not([role=\"checkbox\"]){min-height:44px;min-width:44px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}\n";

export function component_css(hooks = null) {
  return semantic_hook_css(py_truthy(hooks) ? hooks : []) + state_css() + COMPONENT_BASE + theme_signature_css();
}

export function theme_signature_css() {
  const rules = ["/* Theme signature matrix: depth, semantic color and state by component family. */"];
  for (const [family, facets] of Object.entries(THEME_SIGNATURE_MATRIX)) {
    rules.push("/* " + family + " */", facets.depth, facets.color, facets.state);
  }
  return rules.join("\n") + "\n" + button_group_css() + input_group_composition_css() + tabs_line_css();
}

export function button_group_css() { return BUTTON_GROUP; }
export function tabs_line_css() { return TABS_LINE; }
export function input_group_composition_css() { return INPUT_GROUP_COMPOSITION; }

/** Custom products supply their own component styles and states. */
export function foundation_css(t, tailwind = true) {
  let variables = ":root{" + declarations(t) + "}\n";
  if (py_truthy(t.alternate)) variables += "." + t.alternate.mode + "{" + Object.entries(t.alternate.colors).map(([key, value]) => "--" + key + ":" + value).join(";") + ";color-scheme:" + t.alternate.mode + "}\n";
  const base = "*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-leading);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}button,input,select,textarea{font:inherit}";
  const aliases = Object.keys(t.colors).map(key => "--color-" + key + ":var(--" + key + ")").join(";");
  return (tailwind ? '@import "tailwindcss";\n@custom-variant dark (&:is(.dark *));\n@theme inline{' + aliases + ";}\n" : "") + variables + base + "\n";
}

export function css(t, tailwind = true, hooks = null) {
  let variables = ":root{" + declarations(t) + "}\n";
  if (py_truthy(t.alternate)) variables += "." + t.alternate.mode + "{" + Object.entries(t.alternate.colors).map(([key, value]) => "--" + key + ":" + value).join(";") + ";color-scheme:" + t.alternate.mode + "}\n";
  if (!tailwind) return variables + SHARED + component_css(hooks);
  let aliases = Object.keys(t.colors).map((key) => "--color-" + key + ":var(--" + key + ")").join(";");
  aliases += ";--radius-sm:calc(var(--radius)*.6);--radius-md:calc(var(--radius)*.8);--radius-lg:var(--radius);--radius-xl:calc(var(--radius)*1.35);--radius-2xl:calc(var(--radius)*1.6)";
  return '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n@custom-variant dark (&:is(.dark *));\n@theme inline{' + aliases + ';}\n' + variables + '@layer base{*{@apply border-border outline-ring/50;}body{@apply bg-background text-foreground;}}\n' + SHARED + component_css(hooks);
}

export function luminance(hex_color) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex_color.slice(index, index + 2), 16) / 255)
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

function round_two(value) {
  const shifted = value * 100;
  const floor = Math.floor(shifted);
  const fraction = shifted - floor;
  const rounded = Math.abs(fraction - .5) < Number.EPSILON * Math.abs(shifted) ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(shifted);
  return rounded / 100;
}

export function contrast(t) {
  const reports = [];
  const modes = [[t.mode, t.colors], ...(py_truthy(t.alternate) ? [[t.alternate.mode, t.alternate.colors]] : [])];
  const pairs = [["foreground","background"],["card-foreground","card"],["primary-foreground","primary"],["secondary-foreground","secondary"],["muted-foreground","muted"],["accent-foreground","accent"],["popover-foreground","popover"],["destructive","background"],["sidebar-foreground","sidebar"],["sidebar-primary-foreground","sidebar-primary"],["sidebar-accent-foreground","sidebar-accent"],["ring","background"],["input","background"]];
  for (const [mode, colors] of modes) {
    for (const [fg, bg] of pairs) {
      const [a, b] = [luminance(colors[fg]), luminance(colors[bg])].sort((left, right) => left - right);
      const ratio = (b + .05) / (a + .05);
      const minimum = ["ring", "input"].includes(fg) ? 3 : 4.5;
      reports.push({ mode, pair: fg + "/" + bg, ratio: round_two(ratio), minimum, passAA: ratio >= minimum });
    }
  }
  return reports;
}

