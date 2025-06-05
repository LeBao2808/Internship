import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React from "react";
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    console.log('Uploading file: ', file.name); // 👈 để kiểm tra có gọi không

    const formData = new FormData();
    formData.append('upload', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return { default: data.url };
  }

  abort() {}
}
const Editor = ({
  onChange,
  value,
  setErrors, // Add this prop
  error,
  helperText
}) => {
  return (
    <div>
      <CKEditor
        data={value}
        error={error}
        helperText= {helperText}
        editor={ClassicEditor}
        config={{
          extraPlugins: [MyCustomUploadAdapterPlugin],
          simpleUpload: {
            uploadUrl: '/api/upload',
          },
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onBlur={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
     
    </div>
  );
};

export default Editor;