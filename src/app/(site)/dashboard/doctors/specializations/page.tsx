"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const PRESET_SPECIALIZATIONS = [
  { name: "Orthodontics", description: "Braces and alignment treatments", department: "Orthodontic Care" },
  { name: "Periodontics", description: "Gum-related diseases and treatments", department: "Periodontal Therapy" },
  { name: "Endodontics", description: "Root canal and pulp therapy", department: "Endodontic Services" },
  { name: "Prosthodontics", description: "Crowns, bridges and dentures", department: "Restorative Dentistry" },
  { name: "Oral Surgery", description: "Surgical tooth extractions, implants", department: "Oral Surgery Unit" },
  { name: "Pediatric Dentistry", description: "Dental care for children", department: "Pediatric Dental Care" },
  { name: "Preventive Dentistry", description: "Scaling, polishing, fluoride therapy", department: "Preventive Services" },
  { name: "Cosmetic Dentistry", description: "Teeth whitening, veneers, esthetic works", department: "Aesthetic Unit" },
  { name: "Diagnostics", description: "X-ray and imaging services", department: "Radiology & Imaging" },
];

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/specializations")
      .then((r) => r.json())
      .then((data) => setSpecializations(data));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return specializations;
    return specializations.filter(
      (spec) =>
        spec.name?.toLowerCase().includes(search.toLowerCase()) ||
        spec.description?.toLowerCase().includes(search.toLowerCase()) ||
        spec.department?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, specializations]);

  // Modal add function
  const handleAdd = async () => {
    const toAdd = PRESET_SPECIALIZATIONS.filter((s) => selected.includes(s.name));
    if (!toAdd.length) return;
    await fetch("/api/specializations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specializations: toAdd }),
    });
    // Refresh list
    fetch("/api/specializations")
      .then((r) => r.json())
      .then((data) => setSpecializations(data));
    setModalOpen(false);
    setSelected([]);
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Specializations</h1>
          <p className="text-muted-foreground">Manage all medical specializations in your clinic.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/doctors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Specializations List</CardTitle>
            <CardDescription>All medical specializations</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="search"
              placeholder="Search specializations..."
              className="md:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="button" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Doctors</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No specializations found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell className="font-medium">{spec.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{spec.description}</TableCell>
                    <TableCell>{spec.doctorsCount ?? 0}</TableCell>
                    <TableCell>{spec.department}</TableCell>
                    <TableCell>
                      <Badge variant={spec.status === "Active" ? "default" : "secondary"} className={spec.status === "Active" ? "bg-green-500 text-neutral-800" : "bg-yellow-400 text-neutral-800"}>
                        {spec.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specialization Statistics</CardTitle>
          <CardDescription>Overview of specializations and associated doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filtered.slice(0, 8).map((spec) => (
              <Card key={spec.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{spec.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spec.doctorsCount ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Doctors</p>
                  <div className="mt-2 h-1 w-full bg-muted">
                    <div className="h-1 bg-primary" style={{ width: `${((spec.doctorsCount ?? 0) / 10) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Specializations to Add</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[350px] overflow-y-auto px-1">
            {PRESET_SPECIALIZATIONS.map((item) => (
              <div key={item.name} className="flex items-center gap-3 py-2">
                <Checkbox
                  id={item.name}
                  checked={selected.includes(item.name)}
                  onCheckedChange={(checked) => {
                    if (checked) setSelected((s) => [...s, item.name]);
                    else setSelected((s) => s.filter((n) => n !== item.name));
                  }}
                />
                <label htmlFor={item.name} className="text-base">{item.name}</label>
                <span className="text-muted-foreground text-xs">{item.department}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={selected.length === 0}>
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
