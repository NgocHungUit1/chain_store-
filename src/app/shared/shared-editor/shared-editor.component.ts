import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CKEditor4Service, EditorInstance } from '../editor.service';
import { PreviewService } from '../invoice-handle/preview.service';
import { InvoiceData } from '../invoice-handle/preview.service';
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
export class SharedEditorComponent implements AfterViewInit {
  @Input() config: EditorConfig = { elementId: 'default' };
  @Input() templateData: Partial<InvoiceData> = {};
  @Input() initContent: string = '';
  @Output() editorReady = new EventEmitter<EditorInstance>();
  @Output() contentChanged = new EventEmitter<string>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;


  editorInstance: EditorInstance | null = null;
  editorLoaded = false;

  constructor(
    private ckeditor4Service: CKEditor4Service,
    private previewService: PreviewService
  ) {
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeEditor();
    }, 100);
  }

  onContentChanged(event: any): void {
    if (this.editorInstance) {
      const content = this.editorInstance.getData();
      this.contentChanged.emit(content);
    }
  }

  private initializeEditor() {
    try {
      const editorConfig = {
        height: this.config.height || 400,
        readOnly: this.config.readOnly || false,
        allowedContent: true,
        extraPlugins: ['quicktable']
      };

      // remove the unnecessary plugins when showToolbar is false
      if (this.config.showToolbar === false ) {
        editorConfig['toolbar'] = [];
        editorConfig['toolbarGroups'] = [];
      }

      // Initialize the CKEditor instance
      this.editorInstance = this.ckeditor4Service.initEditor(
        this.config.elementId,
        editorConfig
      );

      // Set initial content
      if (this.initContent) {
        this.editorInstance.setData(this.initContent);
      }

      // Confirm editor is loaded
      this.editorLoaded = true;

      // Hide toolbar if needed (showToolbar = false)
      if (this.config.readOnly) {
         this.hideToolbar();
      }
      // Setup preview integration
      this.setupPreviewIntegration(this.config.elementId);

      // Emit editor ready event
      this.editorReady.emit(this.editorInstance);
      this.editorInstance.on('change', () => {
        this.onContentChanged(null);
      });
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


  public setContent(content: string): void {
    if (this.editorInstance) {
      this.editorInstance.setData(content);
      this.contentChanged.emit(content);
    }
  }

  public getContent(): string {
    return this.editorInstance ? this.editorInstance.getData() : '';
  }

  /**
   * Hides the CKEditor toolbar if it exists.
   * This is useful when the editor is in read-only mode or when you want to hide
   * @private
   */
  private hideToolbar(): void {
      if (this.editorInstance) {
        this.editorInstance.on('instanceReady', () => {
          try {
            const editorContainer = document.querySelector('.cke_top');
            if (editorContainer) {
              (editorContainer as HTMLElement).style.display = 'none';
            } else {
              // If element isn't found, add a style tag to hide it when it appears
              const styleTag = document.createElement('style');
              styleTag.innerHTML = '.cke_top { display: none !important; }';
              document.head.appendChild(styleTag);
            }
          } catch (error) {
            console.error('Error hiding toolbar:', error);
          }
        });
      }
  }
}

