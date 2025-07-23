import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CKEditor4Service, EditorInstance } from '../editor.service';
import { PreviewService } from '../preview.service';
import { Subject } from 'rxjs';
import { InvoiceData } from '../preview.service';
export interface EditorConfig {
  elementId: string;
  height?: number;
  readOnly?: boolean;
  showToolbar?: boolean;
  initialContent?: string;
}

@Component({
  selector: 'app-shared-editor',
  templateUrl: './shared-editor.component.html',
  styleUrls: ['./shared-editor.component.css']
})
export class SharedEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() config: EditorConfig = { elementId: 'default' };
  @Input() templateData: Partial<InvoiceData> = {};
  @Output() editorReady = new EventEmitter<EditorInstance>();
  @Output() contentChanged = new EventEmitter<string>();
  @Output() dataChanged = new EventEmitter<Partial<InvoiceData>>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  editorInstance: EditorInstance | null = null;
  editorLoaded = false;

  constructor(
    private ckeditor4Service: CKEditor4Service,
    private previewService: PreviewService
  ) {
    console.log('config', this.config);
  }

  ngOnInit(): void {

    console.log('config init', this.config);

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeEditor();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
  }

  private async initializeEditor(): Promise<void> {
    try {
      const editorConfig = {
        height: this.config.height || 400,
        readOnly: this.config.readOnly || false,
        allowedContent: true,
        extraPlugins: ['quicktable']
      };

      // Chỉ override toolbar config khi cần hide toolbar hoàn toàn
      if (this.config.showToolbar === false) {
        editorConfig['toolbar'] = [];
        editorConfig['toolbarGroups'] = [];
      }
      // Nếu showToolbar = true hoặc undefined, để CKEditor sử dụng config từ config.js

      this.editorInstance = await this.ckeditor4Service.initEditor(
        this.config.elementId,
        editorConfig
      );

      // Set initial content
      if (this.config.initialContent) {
        this.editorInstance.setData(this.config.initialContent);
      }

      this.editorLoaded = true;

      // Hide toolbar if needed (chỉ khi showToolbar = false)
      if (this.config.showToolbar === false) {
        setTimeout(() => this.hideToolbar(), 100);
      }

      // Setup preview integration
      this.setupPreviewIntegration(this.config.elementId);

      // Emit editor ready event
      this.editorReady.emit(this.editorInstance);

    } catch (error) {
      console.error('Failed to initialize CKEditor:', error);
    }
  }

  private setupPreviewIntegration(id: string): void {
    if (!this.editorInstance) return;
    if (this.previewService) {
      // Setup editor sync
      this.previewService.setupEditorSync(id, this.editorInstance);

    }
  }

  // Public methods để control từ parent component
  public setContent(content: string): void {
    if (this.editorInstance) {
      this.editorInstance.setData(content);
    }
  }

  public getContent(): string {
    return this.editorInstance ? this.editorInstance.getData() : '';
  }




  private hideToolbar(): void {
    if (this.editorInstance) {
      try {
        const editorContainer = this.editorInstance.instance.container.$;
        if (editorContainer) {
          const toolbar = editorContainer.querySelector('.cke_top');
          if (toolbar) {
            toolbar.style.display = 'none';
            toolbar.style.height = '0px';
            toolbar.style.padding = '0px';
            toolbar.style.margin = '0px';
            toolbar.style.border = 'none';
            toolbar.style.background = 'none';
          }

          const toolbarElements = editorContainer.querySelectorAll('.cke_toolbar, .cke_toolgroup');
          toolbarElements.forEach((element: any) => {
            element.style.display = 'none';
          });

          const contents = editorContainer.querySelector('.cke_contents');
          if (contents) {
            contents.style.borderTop = 'none';
          }
        }
      } catch (error) {
        console.error('Error hiding toolbar:', error);
      }
    }
  }
}
