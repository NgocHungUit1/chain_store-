import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditInvoiceDialogComponent } from '../edit-invoice-dialog/edit-invoice-dialog.component';
import { PreviewService, InvoiceData } from '../../shared/preview.service';
import { SharedEditorComponent, EditorConfig } from '../../shared/shared-editor/shared-editor.component';
import { InvoiceTemplateService, InvoiceTemplate } from '../../shared/invoice-template.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-setting-print-editor',
  templateUrl: './setting-print-editor.component.html',
  styleUrls: ['./setting-print-editor.component.css']
})
export class SettingPrintEditorComponent implements OnInit, OnDestroy {
  @ViewChild(SharedEditorComponent) sharedEditor!: SharedEditorComponent;

  private destroy$ = new Subject<void>();
  editorConfig: EditorConfig;
  templateData: Partial<InvoiceData> = {};
  invoiceTemplates: InvoiceTemplate[] = [];
  selectedTemplateId = '1';
  currentTemplate: InvoiceTemplate | null = null;


  constructor(
    private dialog: MatDialog,
    private invoiceTemplateService: InvoiceTemplateService // api call
  ) {
    // Configure editor for main view (no toolbar)
    this.editorConfig = {
      elementId: 'main',
      height: 400,
      readOnly: true, // Read-only in main view
      showToolbar: false,
      initialContent: '' // Will be loaded from service
    };
  }

  ngOnInit(): void {
    // Load templates from API first
    this.invoiceTemplateService.getAllTemplates().subscribe({
      next: (response) => {
        if (response.success) {
          this.invoiceTemplates = response.data;
          // Set default selected template if available
          if (this.invoiceTemplates.length > 0) {
            this.selectedTemplateId = this.invoiceTemplates[0].id;
            this.invoiceTemplateService.setSelectedTemplate(this.selectedTemplateId);
            this.currentTemplate = this.invoiceTemplates[0];
            this.updateEditorContent(this.currentTemplate.content);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load templates:', error);
      }
    });
  }




  //  fixing
  private updateEditorContent(content: string): void {
    // Update editor config with new content
    this.editorConfig = {
      ...this.editorConfig,
      initialContent: content
    };

    // If editor is already ready, update content directly
    if (this.sharedEditor && this.sharedEditor.editorLoaded) {
      this.sharedEditor.setContent(content);
    }

  }



  onChangeInvoiceTemplate(event: any): void {
    const templateId = event.value;
    console.log('Template changed to:', templateId);

    // Update selected template ID
    this.selectedTemplateId = templateId;
    this.currentTemplate = this.invoiceTemplates.find(template => template.id === templateId);
    this.updateEditorContent(this.currentTemplate?.content || '');
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(): void {
    const editInvoiceRef = this.dialog.open(EditInvoiceDialogComponent, {
      width: '90%',
      data: {
        templateId: this.selectedTemplateId,
        editorContent: this.currentTemplate?.content || '',
        templateData: this.templateData,
        template: this.currentTemplate
      }
    });

    editInvoiceRef.afterClosed().subscribe(result => {
      if (result) {
        switch (result.action) {
          case 'save':
            // Save updated template via API
            this.saveTemplate({
              id: this.selectedTemplateId,
              name: result.template.name || 'Mẫu in mới',
              content: result.editorContent,
              isDefault: this.currentTemplate?.isDefault || false,
            });
            break;
          case 'delete':
            // Delete template via API
            this.deleteTemplate(result.templateId);
            break;
        }
      }
    });
  }

  onAdd(): void {
    const newTemplate: Partial<InvoiceTemplate> = {
      name: 'Mẫu in mới',
      content: this.getDefaultTemplateContent(),
      isDefault: false,
    };

    // Open dialog to edit new template
    const editInvoiceRef = this.dialog.open(EditInvoiceDialogComponent, {
      width: '90%',
      data: {
        templateId: null, // null indicates create mode
        editorContent: newTemplate.content,
        templateData: this.templateData,
        template: newTemplate
      }
    });

    editInvoiceRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        // Create new template via API
        this.createTemplate({
          name: result.template.name,
          content: result.editorContent,
          isDefault: false,
        });
      }
    });
  }

  private createTemplate(template: Partial<InvoiceTemplate>): void {
    this.invoiceTemplateService.createTemplate(template).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Template created successfully');
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates.data;
              // Set newly created template as selected
              this.selectedTemplateId = response.data.id;
              this.invoiceTemplateService.setSelectedTemplate(this.selectedTemplateId);
              this.currentTemplate = response.data; // Update current template
              this.updateEditorContent(response.data.content); // Update editor content
            },
            error => {
              console.error('Error loading templates after creation:', error);
            }
          )
        }
      },
      error: (error) => {
        console.error('Failed to create template:', error);
      }
    });
  }

  private saveTemplate(template: InvoiceTemplate): void {
    this.invoiceTemplateService.updateTemplate(template.id, template).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Template updated successfully');
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates.data;
              // If updated template was selected, update current template
              if (this.selectedTemplateId === template.id) {
                this.currentTemplate = { ...template };
                this.updateEditorContent(template.content);
              }
            },
            error => {
              console.error('Error loading templates after update:', error);
            }
          )
        }
      },
      error: (error) => {
        console.error('Failed to update template:', error);
      }
    });
  }

  private deleteTemplate(templateId: string): void {
    this.invoiceTemplateService.deleteTemplate(templateId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Template deleted successfully');

          // Refresh templates list
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates.data;
              // If deleted template was selected, reset selection
              if (this.selectedTemplateId === templateId) {
                this.selectedTemplateId = this.invoiceTemplates.length > 0 ? this.invoiceTemplates[0].id : '';
                this.invoiceTemplateService.setSelectedTemplate(this.selectedTemplateId);
              }
            },
            error => {
              console.error('Error loading templates after deletion:', error);
            }
          );
        }
      },
      error: (error) => {
        console.error('Failed to delete template:', error);
        // Show error message to user
        alert('Không thể xóa mẫu in. Vui lòng thử lại.');
      }
    });
  }

  private getDefaultTemplateContent(): string {
    return `<div class="printBox">
      <h2>{Tieu_De_In}</h2>
      <p>Số HĐ: {Ma_Don_Hang}</p>
      <p>Ngày {Ngay} tháng {Thang} năm {Nam}</p>
      <p>Khách hàng: {Khach_Hang}</p>
      <p>SĐT: {So_Dien_Thoai}</p>
      <p>Tổng cộng: {Tong_Cong}</p>
    </div>`;
  }

}
