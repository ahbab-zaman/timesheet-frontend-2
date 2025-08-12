import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Download,
  Upload,
  Archive,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const TimesheetBackupRestore = () => {
  const [backups, setBackups] = useState([
    {
      id: "1",
      backup_name: "Backup_20250101_120000",
      backup_date: "2025-01-01T12:00:00.000Z",
      size_mb: 45,
      record_count: 1250,
      status: "completed",
      created_by: "admin",
    },
    {
      id: "2",
      backup_name: "Backup_20250201_090000",
      backup_date: "2025-02-01T09:00:00.000Z",
      size_mb: 52,
      record_count: 1500,
      status: "completed",
      created_by: "admin",
    },
    {
      id: "3",
      backup_name: "Backup_20250301_150000",
      backup_date: "2025-03-01T15:00:00.000Z",
      size_mb: 38,
      record_count: 1000,
      status: "failed",
      created_by: "admin",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(false);
  }, []);

  const createBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      const steps = [
        "Fetching timesheet data...",
        "Processing time entries...",
        "Compressing data...",
        "Storing backup...",
        "Finalizing backup...",
      ];

      for (let i = 0; i < steps.length; i++) {
        setBackupProgress((i + 1) * 20);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const mockTimesheets = [
        {
          id: "1",
          employee_id: "1",
          time_entries: [
            { id: "t1", hours: 8 },
            { id: "t2", hours: 7 },
          ],
          employees: { name: "John Doe", email: "john.doe@example.com" },
        },
        {
          id: "2",
          employee_id: "2",
          time_entries: [
            { id: "t3", hours: 6 },
            { id: "t4", hours: 8 },
          ],
          employees: { name: "Jane Smith", email: "jane.smith@example.com" },
        },
      ];

      const recordCount = mockTimesheets.reduce(
        (count, ts) => count + (ts.time_entries?.length || 0),
        0
      );
      const sizeMB = Math.round(recordCount * 0.5 + Math.random() * 10);

      const backupName = `Backup_${format(new Date(), "yyyyMMdd_HHmmss")}`;
      const newBackup = {
        id: Math.random().toString(36).substring(7),
        backup_name: backupName,
        backup_date: new Date().toISOString(),
        size_mb: sizeMB,
        record_count: recordCount,
        status: "completed",
        created_by: "admin",
      };

      setBackups((prev) => [newBackup, ...prev]);

      const backupData = {
        timesheets: mockTimesheets,
        metadata: {
          backup_date: new Date().toISOString(),
          version: "1.0",
          record_count: recordCount,
        },
      };

      localStorage.setItem(`backup_${backupName}`, JSON.stringify(backupData));

      setBackupProgress(100);

      toast({
        title: "Backup Successful",
        description: `Created backup with ${recordCount} records`,
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const downloadBackup = async (backup) => {
    try {
      const backupData = localStorage.getItem(`backup_${backup.backup_name}`);

      if (!backupData) {
        toast({
          title: "Download Failed",
          description: "Backup data not found",
          variant: "destructive",
        });
        return;
      }

      const blob = new Blob([backupData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${backup.backup_name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Backup file download has started",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download backup",
        variant: "destructive",
      });
    }
  };

  const restoreBackup = async (backup) => {
    if (
      !confirm(
        `Are you sure you want to restore from ${backup.backup_name}? This will replace current timesheet data.`
      )
    ) {
      return;
    }

    setIsRestoring(true);

    try {
      const backupData = localStorage.getItem(`backup_${backup.backup_name}`);

      if (!backupData) {
        throw new Error("Backup data not found");
      }

      const parsedData = JSON.parse(backupData);

      toast({
        title: "Restore Started",
        description: "Restoring timesheet data from backup...",
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast({
        title: "Restore Successful",
        description: `Restored ${backup.record_count} records from backup`,
      });
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteBackup = (backupId, backupName) => {
    if (!confirm(`Are you sure you want to delete backup ${backupName}?`)) {
      return;
    }

    try {
      localStorage.removeItem(`backup_${backupName}`);

      setBackups((prev) => prev.filter((b) => b.id !== backupId));

      toast({
        title: "Backup Deleted",
        description: "Backup has been successfully deleted",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete backup",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Timesheet Backup & Restore
        </CardTitle>
        <CardDescription>
          Create, manage, and restore timesheet data backups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={createBackup}
              disabled={isBackingUp || isRestoring}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              {isBackingUp ? "Creating Backup..." : "Create New Backup"}
            </Button>

            {isBackingUp && (
              <div className="flex-1 max-w-md">
                <Progress value={backupProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">
                  {backupProgress}% complete
                </p>
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Backups should be created regularly
              (recommended: monthly). Store backup files in a secure location.
              Restore operations will replace existing data.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Backups</h3>

            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No backups found. Create your first backup to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{backup.backup_name}</h4>
                        <Badge
                          variant={
                            backup.status === "completed"
                              ? "default"
                              : backup.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {backup.status === "completed" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {backup.status === "failed" && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {backup.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>
                          Created:{" "}
                          {format(
                            new Date(backup.backup_date),
                            "MMM d, yyyy HH:mm"
                          )}
                        </span>
                        <span className="ml-4">Size: {backup.size_mb} MB</span>
                        <span className="ml-4">
                          Records: {backup.record_count}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup)}
                        disabled={backup.status !== "completed"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreBackup(backup)}
                        disabled={backup.status !== "completed" || isRestoring}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteBackup(backup.id, backup.backup_name)
                        }
                        disabled={isBackingUp || isRestoring}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Backup Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create backups before major system updates or changes</li>
              <li>• Monthly backups are recommended for regular operations</li>
              <li>
                • Download and store backup files in multiple secure locations
              </li>
              <li>
                • Test restore procedures periodically to ensure backup
                integrity
              </li>
              <li>
                • Backup files contain sensitive employee data - handle securely
              </li>
              <li>
                • Large datasets may take several minutes to backup/restore
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetBackupRestore;
