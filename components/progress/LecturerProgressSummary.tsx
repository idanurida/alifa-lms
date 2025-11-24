// components/progress/LecturerProgressSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { LecturerAssignmentProgress } from '@/types/progress';

interface LecturerProgressSummaryProps {
  progress: LecturerAssignmentProgress;
}

export default function LecturerProgressSummary({ progress }: LecturerProgressSummaryProps) {
  // Hitung rata-rata progres untuk semua kelas
  const calculateAverageProgress = (key: keyof LecturerAssignmentProgress['classes'][0]['completion_status']) => {
    if (progress.classes.length === 0) return 0;
    const total = progress.classes.reduce((sum, cls) => sum + cls.completion_status[key], 0);
    return total / progress.classes.length;
  };

  const avgSyllabus = calculateAverageProgress('syllabus');
  const avgMaterials = calculateAverageProgress('materials');
  const avgEvaluation = calculateAverageProgress('evaluation');
  const avgAttendance = calculateAverageProgress('attendance');
  const avgGrades = calculateAverageProgress('grades');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Kelas Diajar</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.classes.length}</div>
          <p className="text-xs text-muted-foreground">Aktif</p>
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Beban SKS</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.teaching_load.assigned}</div>
          <p className="text-xs text-muted-foreground">Ditugaskan</p>
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Silabus</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgSyllabus.toFixed(1)}%</div>
          <Progress value={avgSyllabus} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Materi</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgMaterials.toFixed(1)}%</div>
          <Progress value={avgMaterials} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Nilai</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgGrades.toFixed(1)}%</div>
          <Progress value={avgGrades} className="mt-2" />
        </CardContent>
      </Card>

      {/* Class Progress List */}
      <div className="md:col-span-2 lg:col-span-5">
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle>Progres Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.classes.map((cls, index) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{cls.course_name} ({cls.class_code})</h4>
                    <span className="text-sm">{cls.students_count} mahasiswa</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Silabus</p>
                      <Progress value={cls.completion_status.syllabus} className="h-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Materi</p>
                      <Progress value={cls.completion_status.materials} className="h-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Penilaian</p>
                      <Progress value={cls.completion_status.evaluation} className="h-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Presensi</p>
                      <Progress value={cls.completion_status.attendance} className="h-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nilai</p>
                      <Progress value={cls.completion_status.grades} className="h-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}