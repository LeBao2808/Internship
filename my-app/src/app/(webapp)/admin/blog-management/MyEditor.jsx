import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React from "react";

const Editor = ({
  onChange,
  value
}) => {
  return (
    <CKEditor
      data = {value}
      editor={ClassicEditor}
      onBlur={(_event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default Editor;