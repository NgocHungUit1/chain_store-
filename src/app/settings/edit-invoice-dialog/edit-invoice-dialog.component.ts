import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedEditorComponent, EditorConfig } from '../../shared/shared-editor/shared-editor.component';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class EditInvoiceDialogComponent implements OnInit {
  @ViewChild(SharedEditorComponent) sharedEditor!: SharedEditorComponent;

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

  ngOnInit(): void {
    // Load suggest templates
    this.loadSuggestTemplates();
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

  // Load suggest templates from API (with fake data for now)
  loadSuggestTemplates(): void {
    this.getSuggestTemplates().subscribe(
      (templates: SuggestTemplate[]) => {
        this.suggestInvoiceTemplates = templates;
        // Set default empty value after loading
        this.selectedTemplateId = '';
      },
      (error) => {
        console.error('Error loading suggest templates:', error);
        // Fallback to fake data on error
        this.suggestInvoiceTemplates = this.getFakeSuggestTemplates();
        this.selectedTemplateId = '';
      }
    );
  }

  // API call method (currently returns fake data)
  getSuggestTemplates(): Observable<SuggestTemplate[]> {
    // TODO: Replace with actual API endpoint
    // return this.http.get<SuggestTemplate[]>('/api/suggest-templates');

    // For now, return fake data (without the empty option)
    return of(this.getFakeSuggestTemplates());
  }

  // Fake data for suggest templates (removed empty option)
  getFakeSuggestTemplates(): SuggestTemplate[] {
    return invoiceTemplates as SuggestTemplate[];
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

  // Handle suggest template selection
  onChangeInvoiceTemplate(event: any): void {
    const selectedTemplate = this.suggestInvoiceTemplates.find(
      template => template.id === event.value
    );

    if (selectedTemplate && this.sharedEditor) {
      // Check if there's existing content that might be lost
      const currentContent = this.sharedEditor.getContent();

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
            this.sharedEditor.setContent(selectedTemplate.content);
          } else {
            // User cancelled, revert the selection
            this.selectedTemplateId = '';
          }
        });
      } else {
        // No existing content or empty content, safe to update directly
        this.sharedEditor.setContent(selectedTemplate.content);
      }
    }
  }

  toggleVariablesInfo(): void {
    this.showVariablesInfo = !this.showVariablesInfo;
  }
}
