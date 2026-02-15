import { useRef, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Code, Quote, Heading1, Heading2, Heading3,
  Undo, Redo, Type, Palette, Eye, EyeOff
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  onImageClick,
  placeholder = 'Start writing your content...'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !showHtml && !isFocused) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    setHtmlContent(value);
  }, [value, showHtml, isFocused]);

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      try {
        document.execCommand(command, false, value);
        setTimeout(() => updateContent(), 10);
      } catch (error) {
        console.error('Command execution failed:', command, error);
      }
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      onChange(content);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    setTimeout(() => updateContent(), 10);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        execCommand('createLink', 'https://' + url);
      } else {
        execCommand('createLink', url);
      }
    }
  };

  const changeTextColor = () => {
    const color = prompt('Enter color (hex or name):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (hex or name):');
    if (color) {
      execCommand('hiliteColor', color);
    }
  };

  const formatBlock = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        try {
          document.execCommand('formatBlock', false, `<${tag}>`);
          setTimeout(() => updateContent(), 10);
        } catch (error) {
          console.error('Format block failed:', error);
        }
      }
    }
  };

  const toolbarButtons = [
    { icon: Undo, action: () => execCommand('undo'), title: 'Undo' },
    { icon: Redo, action: () => execCommand('redo'), title: 'Redo' },
    { divider: true },
    { icon: Heading1, action: () => formatBlock('h1'), title: 'Heading 1' },
    { icon: Heading2, action: () => formatBlock('h2'), title: 'Heading 2' },
    { icon: Heading3, action: () => formatBlock('h3'), title: 'Heading 3' },
    { icon: Type, action: () => formatBlock('p'), title: 'Paragraph' },
    { divider: true },
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic (Ctrl+I)' },
    { icon: Underline, action: () => execCommand('underline'), title: 'Underline (Ctrl+U)' },
    { icon: Strikethrough, action: () => execCommand('strikeThrough'), title: 'Strikethrough' },
    { divider: true },
    { icon: AlignLeft, action: () => execCommand('justifyLeft'), title: 'Align Left' },
    { icon: AlignCenter, action: () => execCommand('justifyCenter'), title: 'Align Center' },
    { icon: AlignRight, action: () => execCommand('justifyRight'), title: 'Align Right' },
    { icon: AlignJustify, action: () => execCommand('justifyFull'), title: 'Justify' },
    { divider: true },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Numbered List' },
    { divider: true },
    { icon: Link, action: insertLink, title: 'Insert Link' },
    { icon: Image, action: onImageClick, title: 'Insert Image' },
    { icon: Code, action: () => execCommand('formatBlock', 'pre'), title: 'Code Block' },
    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
    { divider: true },
    { icon: Type, action: changeTextColor, title: 'Text Color' },
    { icon: Palette, action: changeBackgroundColor, title: 'Background Color' },
    { divider: true },
    { icon: showHtml ? Eye : EyeOff, action: () => setShowHtml(!showHtml), title: 'Toggle HTML' },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) =>
          button.divider ? (
            <div key={`divider-${index}`} className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={button.action}
              title={button.title}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              {button.icon && <button.icon size={18} />}
            </button>
          )
        )}
      </div>

      {showHtml ? (
        <textarea
          value={htmlContent}
          onChange={(e) => {
            setHtmlContent(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-[400px] focus:outline-none"
          placeholder="HTML content..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateContent}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full p-4 min-h-[400px] focus:outline-none prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          data-placeholder={placeholder}
        />
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        .dark [contenteditable]:empty:before {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
