import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { useMemo } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { ImageExtension } from "@/components/tiptap/extensions/image";
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder";
import SearchAndReplace from "@/components/tiptap/extensions/search-and-replace";
import Typography from "@tiptap/extension-typography";
import "./tiptap.css";

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: "is-editor-empty",
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case "heading":
          return `Heading ${node.attrs.level}`;
        case "detailsSummary":
          return "Section title";
        case "codeBlock":
          // never show the placeholder when editing code
          return "";
        default:
          return "Write, type '/' for commands";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
];

export default function StaticDisplay({ content }: { content: string }) {
  try {
    const parsedContent = JSON.parse(content);
    const out = useMemo(() => {
      return renderToReactElement({
        content: parsedContent,
        extensions: extensions,
      })
    }, [])

    return <div className="tiptap-static">{out}</div>
  } catch (error) {
    console.error('Failed to render content:', error, 'Raw content:', content);
    return <div>Failed to display content</div>
  }
}