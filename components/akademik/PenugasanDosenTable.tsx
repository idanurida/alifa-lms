"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { LecturerAssignment } from "@/types/akademik"

interface PenugasanDosenTableProps {
  assignments: LecturerAssignment[]
  onEdit: (assignment: LecturerAssignment) => void
  onDelete: (id: number) => void
}

export default function PenugasanDosenTable({ assignments, onEdit, onDelete }: PenugasanDosenTableProps) {
  const [currentAssignments, setCurrentAssignments] = useState<LecturerAssignment[]>(assignments)

  useEffect(() => {
    setCurrentAssignments(assignments)
  }, [assignments])

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus penugasan ini?")) {
      onDelete(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Penugasan Dosen</CardTitle>
        <CardDescription>
          Kelola penugasan mengajar dosen untuk setiap kelas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dosen</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Jenis Penugasan</TableHead>
              <TableHead>Beban Mengajar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAssignments.map((ass) => (
              <TableRow key={ass.id}>
                <TableCell>
                  <div className="space-y-1">
                    {ass.lecturer && (
                      <>
                        <div className="font-medium">{ass.lecturer.name}</div>
                        <div className="text-xs text-muted-foreground">NIDN: {ass.lecturer.nidn}</div>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {ass.class && (
                      <div className="font-mono">{ass.class.class_code}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {ass.class && ass.class.course && (
                      <>
                        <div className="font-mono">{ass.class.course.code}</div>
                        <div className="text-xs">{ass.class.course.name}</div>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ass.assignment_type}</Badge>
                </TableCell>
                <TableCell>{ass.teaching_load} SKS</TableCell>
                <TableCell>
                  <Badge variant={ass.is_active ? "default" : "secondary"}>
                    {ass.is_active ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ass)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ass.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentAssignments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data penugasan dosen
          </div>
        )}
      </CardContent>
    </Card>
  )
}
