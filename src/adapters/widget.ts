import {Capacitor,registerPlugin} from '@capacitor/core';
const widget=registerPlugin<{update(options:{snapshot:string|null}):Promise<void>}>('MoroWidget');
export const supportsWidget=Capacitor.getPlatform()==='android';
let publishing=Promise.resolve();
export function publishWidgetSnapshot(snapshot:string|null) {
  if(!supportsWidget)return Promise.resolve();
  // Preserve account/reset clears after any in-flight update.
  publishing=publishing.catch(()=>{}).then(()=>widget.update({snapshot}));
  return publishing;
}
