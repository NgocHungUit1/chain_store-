import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PrintService {
  renderer: Renderer2;
  iframe: HTMLIFrameElement | null = null;
  private messageHandler: (event: MessageEvent) => void;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.messageHandler = this.onReady.bind(this);
  }


  print(content: string): void {
    this.iframe = this.renderer.createElement('iframe');
    this.renderer.setStyle(this.iframe, 'display', 'none');
    window.addEventListener('message', this.messageHandler);
    this.iframe.srcdoc = content;
    this.renderer.appendChild(document.body, this.iframe);
    this.iframe.addEventListener('afterprint', this.onRemove.bind(this));
  }

  onReady(event:{data: {action: string}} ): void {
    if(this.iframe && event.data.action === 'PRINT_READY') {
      const iframeDocument = this.iframe.contentWindow;
      if (iframeDocument) {
        iframeDocument.focus();
        iframeDocument.print();
        window.removeEventListener('message', this.messageHandler);}
    }
  }
  onRemove(): void {
    if (this.iframe) {
      this.renderer.removeChild(document.body, this.iframe);
      this.iframe?.remove();
    }
  }
}
