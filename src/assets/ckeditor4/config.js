CKEDITOR.editorConfig = function( config ) {
  config.toolbar = [
    { name: 'document', items: [ 'Source', '-', 'NewPage', 'Print' ] },
    { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText','PasteFromWord', '-', 'Undo', 'Redo', '-','SelectAll', '-',  'Image', 'Table','HorizontalRule', 'SpecialChar'] },
    '/',
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Subscript', 'Superscript' ] },
    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock','-', 'BidiLtr', 'BidiRtl' ] },
    '/',
    { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor' ] }
  ];
};

