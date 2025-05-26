import React, { useState, useEffect } from 'react';
import Handlebars from 'handlebars';

export default function TemplateParserUI() {
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [placeholders, setPlaceholders] = useState([]);
  const [formData, setFormData] = useState({});
  const [renderedHtml, setRenderedHtml] = useState('');
  const [output, setOutput] = useState('');

  const extractPlaceholders = (html) => {
    const regex = /{{(\w+)}}/g;
    const variables = new Set();
    let match;
    while ((match = regex.exec(html))) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setHtmlTemplate(content);
      const extracted = extractPlaceholders(content);
      setPlaceholders(extracted);
      const defaultData = extracted.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {});
      setFormData(defaultData);
      setRenderedHtml('');
      setOutput('');
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e, key) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  const renderTemplate = () => {
    try {
      const template = Handlebars.compile(htmlTemplate);
      const output = template(formData);

      const beautified = window.prettier.format(output, {
        parser: "html",
        plugins: [window.prettierPlugins.html],
      });
      console.log({ beautified })
      setRenderedHtml(beautified);
      setOutput(output);
    } catch (err) {
      console.error("Prettier formatting failed:", err);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([output], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.html';
    link.click();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans" style={{ paddingLeft: '10rem' }}>
      <h1 className="text-2xl font-bold mb-6">🧩 HTML Template Parser UI</h1>

      <div className="mb-4">
        <label className="block font-medium mb-2">Upload HTML Template:</label>
        <input type="file" accept=".html" onChange={handleFileUpload} className="file-input file-input-bordered w-full" />
      </div>

      {placeholders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Fill Placeholder Values:</h2>
          <div className="space-y-4">
            {placeholders.map((key) => (
              <div key={key} className="flex flex-col">
                <label className="mb-1 font-medium">{key}:</label>
                <input
                  type="text"
                  value={formData[key] || ''}
                  onChange={(e) => handleInputChange(e, key)}
                  className="input input-bordered"
                />
              </div>
            ))}
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={renderTemplate}
            style={{ background: '#1348E5', marginTop: '1rem', outline: 'none' }}
          >
            Render Template
          </button>
        </div>
      )}

      {renderedHtml && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">📄 Rendered HTML (Preview)</h2>

          <pre className="border p-4 rounded bg-gray-100 text-sm overflow-auto whitespace-pre-wrap">
            <code>{renderedHtml}</code>
          </pre>

          <div className="flex gap-4 mt-4">
            <button onClick={downloadHtml} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" style={{ background: '#1348E5', outline: 'none' }}>
              Download HTML
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
