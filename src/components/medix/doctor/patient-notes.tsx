"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function PatientNotes({ initialNotes = [] }: { initialNotes?: any[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter((note: any) => note.id !== noteId));
  };

  const handleSaveNote = () => {
    if (editingNote) {
      setNotes(
        notes.map((note: any) =>
          note.id === editingNote.id
            ? { ...note, content: newNoteContent }
            : note
        )
      );
      setEditingNote(null);
      setNewNoteContent("");
      setIsDialogOpen(false);
    }
  };

  const handleAddNote = () => {
    const newNote = {
      id: notes.length + 1,
      patient: {
        name: newPatientName || "New Patient",
        avatar: "/user-2.png",
        initials: newPatientName.split(" ").map((n) => n[0]).join("").toUpperCase() || "NP",
      },
      date: "Today, " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      content: newNoteContent,
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent("");
    setNewPatientName("");
    setIsNewNoteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setIsNewNoteDialogOpen(true)}>
              <Plus className="mr-2 h-3 w-3" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Patient Note</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient Name</label>
                <Input
                  placeholder="Enter patient name"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Enter your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddNote}>Save Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {!notes.length ? (
        <div className="text-muted-foreground">No notes found.</div>
      ) : (
        notes.map((note: any) => (
          <div key={note.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={note.patient.avatar || "/user-2.png"} alt={note.patient.name || "--"} />
                  <AvatarFallback>{note.patient.initials || "--"}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{note.patient.name || "--"}</div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-1 h-3 w-3" />
                {note.date || "--"}
              </div>
            </div>
            <div className="mt-2 text-sm">{note.content || "--"}</div>
            <div className="mt-3 flex justify-end space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => handleEditNote(note)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Note for {note.patient.name || "--"}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveNote}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteNote(note.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/20"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete Note
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
