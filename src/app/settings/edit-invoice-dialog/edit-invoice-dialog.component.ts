import { Component, Inject, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedEditorComponent, EditorConfig } from '../../shared/shared-editor/shared-editor.component';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import {InvoiceData} from '../../shared/invoice-handle/preview.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
const sampleFields = require( '../../shared/invoice-handle/invoice-data-sample.json');
const invoiceTemplates = require('../../shared/invoice-handle/invoice-templates.json');

interface SuggestTemplate {
  id: string;
  name: string;
  content: string;
}

@Component({
  selector: 'app-edit-invoice-dialog',
  templateUrl: './edit-invoice-dialog.component.html',
  styleUrls: ['./edit-invoice-dialog.component.css'],
})
export class EditInvoiceDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(SharedEditorComponent) sharedEditor: SharedEditorComponent;

  private destroy$ = new Subject<void>();
  private editorReady$ = new BehaviorSubject<boolean>(false);

  editorConfig: EditorConfig;
  templateData: Partial<InvoiceData> = {};
  templateName: string = ''; // Add templateName property
  template: any = {}; // Changed to any to allow name property

  // Suggest templates properties
  suggestInvoiceTemplates: SuggestTemplate[] = [];
  selectedTemplateId: string = ''; // Default empty value
  editorContent: string = ''; // Content for the editor, can be set from data
  isEditMode: boolean = false; // Flag to check if in edit mode
  header: string = 'Chỉnh sửa mẫu in hóa đơn';
  templateId: string = ''; // Template ID for edit mode
  showVariablesInfo: boolean = false;
  variableFields: { name: string; meaning: string; }[] = [];
  variableRows: Array<{ first: {name: string; meaning: string}, second?: {name: string; meaning: string} }> = [];

  constructor(
    public dialogRef: MatDialogRef<EditInvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog // Inject MatDialog
  ) {
    this.templateData = data['templateData'] || {};
    this.templateName = data['template']?.name || 'New Template'; // Initialize templateName
    this.template = data['template'];
    this.editorContent = data['editorContent'] || ''; // Initialize editor content
    this.templateId = data['templateId'] || '';
    this.isEditMode = !!this.templateId;
    this.header = this.isEditMode ? 'Chỉnh sửa mẫu in hóa đơn' : 'Tạo mới mẫu in hóa đơn';
    // Configure editor for dialog (with toolbar enabled)
    this.editorConfig = {
      elementId: 'popup',
      height: 400,
      readOnly: false,
      showToolbar: true,
      initialContent: data['editorContent'] || ''
    };
  }
  ngAfterViewInit(): void {
    // Monitor when editor becomes ready
    debugger;
    if (this.sharedEditor) {
      // Check if editor is already loaded
      if (this.sharedEditor.editorLoaded && this.sharedEditor.editorInstance) {
        this.editorReady$.next(true);
      }

      // Setup editorReady event listener
      this.sharedEditor.editorReady.subscribe(editor => {
        console.log('Editor is now ready');
        this.editorReady$.next(true);
      });
    }

    // Load templates after editor initialization is monitored
    this.loadSuggestTemplates();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editorReady$.complete();
  }

  ngOnInit(): void {
    // Load suggest templates
    // Load variable info from JSON
    this.variableFields = (sampleFields as Array<{name:string, meaning:string}>)
      .filter(f => f.name !== 'items')
      .map(f => ({ name: f.name, meaning: f.meaning }));

    // Build rows of two columns per row for template
    this.variableRows = [];
    for (let i = 0; i < this.variableFields.length; i += 2) {
      const first = this.variableFields[i];
      const second = this.variableFields[i+1];
      this.variableRows.push({ first, second });
    }

  }

  /**
   * Load suggest templates from the service
   * This function fetches the list of suggest templates and sets the default template.
   * If the template body is empty, it sets the first template as selected.
   */
  loadSuggestTemplates(): void {
    this.getSuggestTemplates().subscribe(

      (templates: SuggestTemplate[]) => {
        debugger;
        this.suggestInvoiceTemplates = templates;
        // Set default empty value after loading
        if(!this.template.body){
          this.selectedTemplateId = this.suggestInvoiceTemplates[0].id;
          this.onChangeInvoiceTemplate(this.selectedTemplateId)
        } else{
          this.selectedTemplateId = '';
        }
      },
      (error) => {
        console.error('Error loading suggest templates:', error);
      }
    );
  }

  /**
   * Fetch suggest templates from the service
   */
  getSuggestTemplates(): Observable<SuggestTemplate[]> {
    // For now, return fake data (without the empty option)
    return of(invoiceTemplates as SuggestTemplate[]);
  }


  onContentChanged(content: string): void {
    console.log('Content changed in dialog:', content.length);
  }

  onDataChanged(data: Partial<InvoiceData>): void {
    this.templateData = data;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Handle save action
   * This function is called when the user clicks the save button.
   * It collects the editor content, template data, and template information,
   * then closes the dialog with the result.
   */
  onSave(): void {
    const result = {
      editorContent: this.sharedEditor.getContent(),
      templateData: this.templateData,
      template: {
        ...this.data.template,
        name: this.template.name || this.templateName
      },
      action: 'save'
    };
    this.dialogRef.close(result);
  }

  /**
   * Handle delete action
   * This function is called when the user clicks the delete button.
   * It opens a confirmation dialog to confirm deletion of the template.
   * If confirmed, it closes the dialog with the delete action result.
   */
  onDelete(): void {
    if (this.isEditMode && this.templateId) {
      // Open the custom confirmation dialog
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Xác nhận xóa',
          message: `Bạn có chắc chắn muốn xóa mẫu in "${this.template.name || this.templateName}"?`,
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Bỏ qua'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          const deleteResult = {
            templateId: this.templateId,
            action: 'delete'
          };
          this.dialogRef.close(deleteResult);
        }
      });
    }
  }

  /**
   * Handle template change event
   * This function is called when the user selects a different invoice template.
   * It checks if the editor is ready before setting the new content.
   * If there is existing content, it shows a confirmation dialog before replacing it.
   * If the user confirms, it updates the editor content with the selected template.
   * If the user cancels, it reverts the selection to the previous template.
   * @param id
   */
  onChangeInvoiceTemplate(id: string): void {
    debugger;
    const selectedTemplate = this.suggestInvoiceTemplates.find(
      template => template.id === id
    );

    if (!selectedTemplate) {
      console.error('Template not found:', id);
      return;
    }

    // Function to safely set editor content when ready
    const setEditorContent = (content: string) => {
      // Use our editorReady$ BehaviorSubject to wait until editor is ready
      this.editorReady$.pipe(
        filter(ready => ready === true),
        takeUntil(this.destroy$),
        // Only take the first emission of ready=true
        take(1)
      ).subscribe(() => {
        debugger;
        console.log('Editor ready, now setting content');
        this.sharedEditor.setContent(content);
      });
    };
    // Check if there's existing content that might be lost
    const currentContent = this.sharedEditor && this.sharedEditor.editorLoaded ?
      this.sharedEditor.getContent() : '';

    if (currentContent && currentContent.trim().length > 0) {
      // Show confirmation dialog before changing template
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Thay đổi mẫu in',
          message: 'Nếu bạn chọn mẫu in khác, nội dung hiện tại sẽ bị thay thế. Bạn có muốn tiếp tục?',
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Bỏ qua'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // User confirmed, update the editor content
          setEditorContent(selectedTemplate.content);
        } else {
          // User cancelled, revert the selection
          this.selectedTemplateId = '';
        }
      });
    } else {
      // No existing content or empty content, safe to update directly
      setEditorContent(selectedTemplate.content);
    }
  }

  toggleVariablesInfo(): void {
    this.showVariablesInfo = !this.showVariablesInfo;
  }
}
