import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditInvoiceDialogComponent } from '../edit-invoice-dialog/edit-invoice-dialog.component';
import { PreviewService, InvoiceData } from '../../shared/invoice-handle/preview.service';
import { SharedEditorComponent, EditorConfig } from '../../shared/shared-editor/shared-editor.component';
import { InvoiceTemplateService, InvoiceTemplate } from '../../shared/invoice-handle/invoice-template.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-setting-print-editor',
  templateUrl: './setting-print-editor.component.html',
  styleUrls: ['./setting-print-editor.component.css']
})
export class SettingPrintEditorComponent implements OnInit {
  @ViewChild(SharedEditorComponent) sharedEditor!: SharedEditorComponent;

  editorConfig: EditorConfig;
  templateData: Partial<InvoiceData> = {};
  invoiceTemplates: InvoiceTemplate[] = [];
  selectedTemplateId: number = 1;
  currentTemplate: Partial<InvoiceTemplate> | null = null;
  isLoading = true;


  constructor(
    private dialog: MatDialog,
    private invoiceTemplateService: InvoiceTemplateService,
    private previewService: PreviewService
  ) {
    // Configure editor for main view (no toolbar)
    this.editorConfig = {
      elementId: 'main',
      height: 700,
      readOnly: true, // Read-only in main view
      showToolbar: false,
      initialContent: '' // Will be loaded from service
    };
  }

  ngOnInit(): void {
    // Load templates from API first
    this.invoiceTemplateService.getAllTemplates().pipe(
      finalize(() => this.isLoading = false) // Set loading to false after fetching templates
    ).subscribe({
      next: (response) => {
        debugger;
        if (response) {
          this.invoiceTemplates = response;
          // Set default selected template if available or first template
          if (this.invoiceTemplates.length > 0) {
            // Check if there's a default template
            const defaultTemplate = this.invoiceTemplates.find(template => template.status === 10);
            if (defaultTemplate) {
              this.currentTemplate = defaultTemplate;
              this.selectedTemplateId = defaultTemplate.id; // Set initial selected template ID
            } else {
              // If no default, select the first template
              this.currentTemplate = this.invoiceTemplates[0];
              this.selectedTemplateId = this.currentTemplate.id ; // Set initial selected template ID
            }
            this.updateEditorContent(this.currentTemplate.body);
            this.previewService.updateTemplateContent('main', this.currentTemplate.body);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load templates:', error);
      }
    });
  }

  /**
   * Updates the editor content with the provided string.
   * This method updates the editor configuration and sets the content in the editor if it is already loaded.
   * @param content
   * @private
   */
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


  /**
   * Handles the change event for the invoice template selection.
   * This method updates the selected template ID, retrieves the corresponding template,
   * @param event
   */
  onChangeInvoiceTemplate(event: any): void {
    const templateId = event.value;
    this.selectedTemplateId = Number(templateId);
    //todo: check id is valid or not
    this.currentTemplate = this.invoiceTemplates.find(template => template.id === this.selectedTemplateId);
    this.updateEditorContent(this.currentTemplate?.body || '');
  }

  /**
   * Handles the edit action for the selected invoice template.
   * This method opens a dialog to edit the template and handles the result.
   * If the user saves changes, it updates the template via API.
   * If the user deletes the template, it removes it via API.
   * @returns void
   */
  onEdit(): void {
    const editInvoiceRef = this.dialog.open(EditInvoiceDialogComponent, {
      width: '90%',
      height: '85%',
      data: {
        templateId: this.selectedTemplateId,
        editorContent: this.currentTemplate?.body || '',
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
              body: result.editorContent,
              status: this.currentTemplate?.status || 0,
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

  /**
   * Handles the add action to create a new invoice template.
   * This method opens a dialog to create a new template with default content.
   * The new template is initialized with a default body and status.
   * After the dialog is closed, it creates the new template via API if the user saves it.
   * @returns void
   */
  onAdd(): void {
    const newTemplate: Partial<InvoiceTemplate> = {
      name: 'Mẫu in mới',
      body: this.currentTemplate?.body,
      status: 1,
    };
    // Open dialog to edit new template
    const editInvoiceRef = this.dialog.open(EditInvoiceDialogComponent, {
      width: '90%',
      data: {
        templateId: null, // null indicates create mode
        editorContent: newTemplate.body,
        templateData: this.templateData,
        template: newTemplate
      }
    });

    editInvoiceRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        this.createTemplate({
          name: result.template.name,
          body: result.editorContent,
          status: 0 // Default status for new templates,
        });
      }
    });
  }

  /**
   * Creates a new invoice template using the provided template data.
   * This method calls the invoice template service to create the template and updates the list of templates upon success.
   * If the creation is successful, it sets the newly created template as the current template and updates the editor content.
   * @param template
   * @private
   */
  private createTemplate(template: Partial<InvoiceTemplate>): void {
    this.invoiceTemplateService.createTemplate(template).subscribe({
      next: (response) => {
        debugger;
        if (response) {
          console.log('Template created successfully');
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates;
              // Set newly created template as selected
              this.selectedTemplateId = response.id;
              this.currentTemplate = response; // Update current template
              this.updateEditorContent(response.body); // Update editor content
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

  /**
   * Saves the updated invoice template.
   * This method calls the invoice template service to update the template and refreshes the list of templates upon success.
   * If the update is successful, it updates the current template and editor content.
   * @param template
   * @private
   */
  private saveTemplate(template: InvoiceTemplate): void {
    this.invoiceTemplateService.updateTemplate(template.id, template).subscribe({
      next: (response) => {
        if (response) {
          debugger;
          console.log('Template updated successfully: ', response);
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates;
              // If updated template was selected, update current template
              if (this.selectedTemplateId === template.id) {
                this.currentTemplate = { ...template };
                this.updateEditorContent(template.body);
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

  /**
   * Deletes the selected invoice template.
   * This method calls the invoice template service to delete the template and refreshes the list of templates upon success.
   * If the deletion is successful, it resets the selected template ID if necessary.
   * @param templateId
   * @private
   */
  private deleteTemplate(templateId: number): void {
    this.invoiceTemplateService.deleteTemplate(templateId).subscribe({
      next: (response) => {
        if (response.success) {
          // Refresh templates list
          this.invoiceTemplateService.getAllTemplates().subscribe(
            (templates) => {
              this.invoiceTemplates = templates;
              // If deleted template was selected, reset selection
              if (this.selectedTemplateId === templateId) {
                this.selectedTemplateId = this.invoiceTemplates.length > 0 ? this.invoiceTemplates[0].id : 1; // Reset to first template or default ID
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

}
