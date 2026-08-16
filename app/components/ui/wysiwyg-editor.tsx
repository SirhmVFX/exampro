"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function WysiwygEditor({
  content,
  onChange,
  placeholder = "Start writing…",
  minHeight = 160,
  className = "",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: { class: "tiptap-content" },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = content || "";
    if (editor.getHTML() === incoming) return;
    if (editor.isFocused) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, "exampro/editor");
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={active ? "is-active" : ""}
    >
      {children}
    </button>
  );

  return (
    <div
      className={`tiptap-editor ${className}`}
      style={{ ["--tiptap-min-height" as string]: `${minHeight}px` }}
    >
      <div className="tiptap-toolbar">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolBtn>
        <span className="tiptap-sep" />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolBtn>
        <span className="tiptap-sep" />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          UL
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          OL
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          {`"`}
        </ToolBtn>
        <span className="tiptap-sep" />
        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Add link">
          Link
        </ToolBtn>
        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
          active={uploading}
        >
          {uploading ? "…" : "Img"}
        </ToolBtn>
        <span className="tiptap-sep" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↩
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↪
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
