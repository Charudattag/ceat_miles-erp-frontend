import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles for Quill editor

const SummerNoteEditor = ({ name, value, onChange }) => {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value); // Sync the content with the value prop
  }, [value]);

  const handleChange = (content) => {
    setContent(content);
    onChange({ target: { name, value: content } }); // Pass the updated content to the parent component with name
  };

  return (
    <div className="form-group">
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={{
          toolbar: [
            // [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            // ['link', 'image', 'video'],
            [{ 'align': [] }],
            ['clean'],
          ],
        }}
        formats={[
          'header', 'font', 'list', 'bold', 'italic', 'underline', 'link', 'image', 'video', 'align',
        ]}
        theme="snow" // Use the 'snow' theme
      />
    </div>
  );
};

export default SummerNoteEditor;
