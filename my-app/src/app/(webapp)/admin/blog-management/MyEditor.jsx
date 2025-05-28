import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React from "react";

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
        onBlur={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
     
    </div>
  );
};

export default Editor;