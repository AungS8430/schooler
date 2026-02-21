"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePerms } from "@/lib/perms";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const perms = usePerms();
  const [formErrors, setFormErrors] = useState<{title?: boolean; description?: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [content, setContent] = useState<string>();

  async function handleCreateAnnouncement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");

    const errors: {title?: boolean; description?: boolean} = {};
    if (!title.trim()) errors.title = true;
    if (!description.trim()) errors.description = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      content,
      thumbnail: String(formData.get("thumbnail") || ""),
      priority: Number(formData.get("priority") || 3),
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      // Redirect back to announcements page after successful creation
      router.push("/app/announcements");
    } catch (error) {
      console.error("Error creating announcement:", error);
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (perms && (perms.role !== "teacher" && perms.role !== "admin")) {
      router.replace("/app/announcements");
    }
  }, [perms]);

  return (
    perms && (perms.role === "teacher" || perms.role === "admin") && (
      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 border-border">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-2xl font-semibold truncate">
              Create Announcement
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1 overflow-y-auto mb-12 md:mb-0">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <form onSubmit={handleCreateAnnouncement} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Form Fields */}
              <div className="w-full">
                <FieldGroup className="space-y-4 sm:space-y-5">
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <FieldContent>
                      <Input
                        name="title"
                        placeholder="Announcement title"
                        id="title"
                        required
                        aria-invalid={formErrors.title}
                        className="text-base"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <FieldContent>
                      <Input
                        name="description"
                        placeholder="Announcement description"
                        id="desc"
                        required
                        aria-invalid={formErrors.description}
                        className="text-base"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Thumbnail</FieldLabel>
                    <FieldContent>
                      <Input
                        name="thumbnail"
                        placeholder="Image URL for thumbnail (optional)"
                        id="thumb"
                        className="text-base"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Priority</FieldLabel>
                    <FieldContent>
                      <Select name="priority" defaultValue="3">
                        <SelectTrigger className="w-full text-base">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="1">Important</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">Information</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="grow"
                    >
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="grow"
                    >
                      Cancel
                    </Button>
                  </div>
                </FieldGroup>
              </div>

              {/* Right Column - Rich Text Editor */}
              <div className="w-full mt-6 lg:mt-0">
                <div className="sticky top-20 lg:top-16">
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <div className="border border-border rounded-lg">
                    <RichTextEditor className="max-h-[calc(100vh-170px)]" onContentChange={setContent} />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    )
  );
}

