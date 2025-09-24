import { Injectable } from '@angular/core';

export interface EditorInstance {
  instance: any;
  getData: () => string;
  setData: (data: string) => void;
  on: (event: string, callback: () => void) => void;
  destroy: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class CKEditor4Service {
  initEditor(elementId: string, config: any = {}) {
    try {
      if ((window as any).CKEDITOR) {
        const editorConfig = {
          ...config,
          versionCheck: false  // This disables the security version check
        };

        (window as any).CKEDITOR.replace('ckeditor4-textarea-' + elementId, editorConfig);
        const editorInstance = (window as any).CKEDITOR.instances['ckeditor4-textarea-' + elementId];
        if (editorInstance) {
          return {
            instance: editorInstance,
            getData: () => editorInstance.getData(),
            setData: (data: string) => editorInstance.setData(data),
            on: (event: string, callback: () => void) => editorInstance.on(event, callback),
            destroy: () => editorInstance.destroy()
          };
        }
      } else {
        console.error('CKEditor is not available after loading the script');
        throw new Error('CKEditor not available');
      }
    } catch (error) {
      console.error('Error initializing CKEditor:', error);
      throw error;
    }
  }
}
