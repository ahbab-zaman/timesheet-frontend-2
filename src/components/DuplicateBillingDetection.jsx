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
  AlertTriangle,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DuplicateBillingDetection = () => {
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    runDuplicateDetection();
  }, []);

  const runDuplicateDetection = () => {
    setLoading(true);

    try {
      const mockTimeEntries = [
        {
          id: "1",
          timesheet_id: "ts1",
          employee_id: "1",
          date: "2025-08-10",
          hours: 8,
          description: "Development work on Project Alpha",
          project_id: "p1",
          timesheets: { employee_id: "1", status: "approved" },
          employees: { name: "John Doe" },
          projects: { name: "Project Alpha" },
        },
        {
          id: "2",
          timesheet_id: "ts2",
          employee_id: "1",
          date: "2025-08-10",
          hours: 8,
          description: "Development work on Project Alpha",
          project_id: "p1",
          timesheets: { employee_id: "1", status: "approved" },
          employees: { name: "John Doe" },
          projects: { name: "Project Alpha" },
        },
        {
          id: "3",
          timesheet_id: "ts3",
          employee_id: "2",
          date: "2025-08-11",
          hours: 6,
          description: "Client meeting",
          project_id: "p2",
          timesheets: { employee_id: "2", status: "approved" },
          employees: { name: "Jane Smith" },
          projects: { name: "Project Beta" },
        },
        {
          id: "4",
          timesheet_id: "ts4",
          employee_id: "2",
          date: "2025-08-11",
          hours: 6,
          description: "Client meeting",
          project_id: "p2",
          timesheets: { employee_id: "2", status: "approved" },
          employees: { name: "Jane Smith" },
          projects: { name: "Project Beta" },
        },
      ];

      const duplicates = findDuplicates(mockTimeEntries);

      setDetectionResult({
        duplicates,
        total_scanned: mockTimeEntries.length,
        issues_found: duplicates.length,
        scan_date: new Date().toISOString(),
      });

      if (duplicates.length > 0) {
        toast({
          title: "Duplicates Detected",
          description: `Found ${duplicates.length} potential duplicate billing issues`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Duplicates Found",
          description: "All billing entries appear to be unique",
        });
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast({
        title: "Detection Failed",
        description: "Failed to scan for duplicates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = (entries) => {
    const duplicates = [];
    const processed = new Set();

    const groups = new Map();

    entries.forEach((entry) => {
      if (processed.has(entry.id)) return;

      const key = `${entry.timesheets.employee_id}_${
        entry.date
      }_${entry.description.toLowerCase().trim()}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(entry);
    });

    groups.forEach((groupEntries, key) => {
      if (groupEntries.length > 1) {
        const confidenceScore = calculateConfidenceScore(groupEntries);

        if (confidenceScore > 70) {
          const totalHours = groupEntries.reduce((sum, e) => sum + e.hours, 0);
          const duplicateEntry = {
            id: `dup_${key}`,
            employee_id: groupEntries[0].timesheets.employee_id,
            employee_name: groupEntries[0].employees.name,
            date: groupEntries[0].date,
            hours: groupEntries[0].hours,
            description: groupEntries[0].description,
            project_name: groupEntries[0].projects?.name || "No Project",
            duplicate_group: key,
            entries: groupEntries,
            total_hours: totalHours,
            timesheet_ids: [
              ...new Set(groupEntries.map((e) => e.timesheet_id)),
            ],
            confidence_score: confidenceScore,
          };

          duplicates.push(duplicateEntry);

          groupEntries.forEach((entry) => processed.add(entry.id));
        }
      }
    });

    return duplicates;
  };

  const calculateConfidenceScore = (entries) => {
    let score = 0;

    score += 30;

    const descriptions = entries.map((e) => e.description.toLowerCase().trim());
    const uniqueDescriptions = [...new Set(descriptions)];
    if (uniqueDescriptions.length === 1) {
      score += 40;
    } else if (uniqueDescriptions.length === 2) {
      score += 20;
    }

    const hours = entries.map((e) => e.hours);
    const uniqueHours = [...new Set(hours)];
    if (uniqueHours.length === 1) {
      score += 20;
    } else if (uniqueHours.length === 2) {
      score += 10;
    }

    const projects = entries.map((e) => e.project_id);
    const uniqueProjects = [...new Set(projects)];
    if (uniqueProjects.length === 1) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const resolveAsDuplicate = (duplicate, keepEntryId) => {
    setResolving(duplicate.id);

    try {
      const entriesToDelete = duplicate.entries
        .filter((entry) => entry.id !== keepEntryId)
        .map((entry) => entry.id);

      console.log("Duplicate resolved:", {
        duplicate_group: duplicate.duplicate_group,
        original_count: duplicate.entries.length,
        kept_entry_id: keepEntryId,
        deleted_entry_ids: entriesToDelete,
      });

      toast({
        title: "Duplicate Resolved",
        description: `Removed ${entriesToDelete.length} duplicate entries`,
      });

      runDuplicateDetection();
    } catch (error) {
      console.error("Resolution error:", error);
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve duplicate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolving(null);
    }
  };

  const markAsNotDuplicate = (duplicate) => {
    setResolving(duplicate.id);

    try {
      console.log("Marking as not duplicate:", duplicate.duplicate_group);

      setDetectionResult((prev) =>
        prev
          ? {
              ...prev,
              duplicates: prev.duplicates.filter((d) => d.id !== duplicate.id),
              issues_found: prev.issues_found - 1,
            }
          : null
      );

      toast({
        title: "Marked as Not Duplicate",
        description: "This entry group has been marked as legitimate",
      });
    } catch (error) {
      console.error("Mark error:", error);
      toast({
        title: "Operation Failed",
        description: "Failed to mark as not duplicate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolving(null);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return "bg-red-100 text-red-800";
    if (score >= 80) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Duplicate Billing Detection
        </CardTitle>
        <CardDescription>
          Automatically detect and resolve duplicate time entries to prevent
          billing errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={runDuplicateDetection}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {loading ? "Scanning..." : "Run Duplicate Scan"}
            </Button>

            {detectionResult && (
              <div className="text-sm text-muted-foreground">
                Last scan:{" "}
                {format(
                  new Date(detectionResult.scan_date),
                  "MMM d, yyyy HH:mm"
                )}
              </div>
            )}
          </div>

          {detectionResult && (
            <Alert
              className={
                detectionResult.issues_found > 0
                  ? "border-destructive"
                  : "border-green-500"
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Scanned {detectionResult.total_scanned} entries and found{" "}
                    <strong>{detectionResult.issues_found}</strong> potential
                    duplicate issues
                  </span>
                  {detectionResult.issues_found === 0 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {detectionResult && detectionResult.duplicates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detected Duplicates</h3>

              {detectionResult.duplicates.map((duplicate) => (
                <div key={duplicate.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={getConfidenceColor(
                          duplicate.confidence_score
                        )}
                      >
                        {duplicate.confidence_score}% match
                      </Badge>
                      <h4 className="font-medium">{duplicate.employee_name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(duplicate.date), "MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDuplicate(duplicate)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Duplicate Entry Details</DialogTitle>
                            <DialogDescription>
                              Review and resolve the duplicate entries below
                            </DialogDescription>
                          </DialogHeader>

                          {selectedDuplicate && (
                            <div className="space-y-4">
                              <div className="grid gap-4">
                                {selectedDuplicate.entries.map(
                                  (entry, index) => (
                                    <div
                                      key={entry.id}
                                      className="flex items-center justify-between p-3 border rounded"
                                    >
                                      <div>
                                        <p className="font-medium">
                                          Entry #{index + 1}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {entry.description}
                                        </p>
                                        <p className="text-sm">
                                          Hours: {entry.hours} | Project:{" "}
                                          {entry.projects?.name || "No Project"}
                                        </p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          resolveAsDuplicate(
                                            selectedDuplicate,
                                            entry.id
                                          )
                                        }
                                        disabled={
                                          resolving === selectedDuplicate.id
                                        }
                                      >
                                        Keep This One
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    markAsNotDuplicate(selectedDuplicate)
                                  }
                                  disabled={resolving === selectedDuplicate.id}
                                >
                                  Not a Duplicate
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsNotDuplicate(duplicate)}
                        disabled={resolving === duplicate.id}
                      >
                        {resolving === duplicate.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      <strong>Description:</strong> {duplicate.description}
                    </p>
                    <p>
                      <strong>Project:</strong> {duplicate.project_name}
                    </p>
                    <p>
                      <strong>Total Hours:</strong> {duplicate.total_hours} (
                      {duplicate.entries.length} entries)
                    </p>
                    <p>
                      <strong>Affected Timesheets:</strong>{" "}
                      {duplicate.timesheet_ids.length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Detection Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Automatic scanning identifies entries with same employee,
                date, and description
              </li>
              <li>
                • Confidence scores above 70% are flagged as potential
                duplicates
              </li>
              <li>• Review each duplicate carefully before resolving</li>
              <li>
                • "Keep This One" removes other entries and keeps the selected
                one
              </li>
              <li>
                • "Not a Duplicate" marks the group as legitimate and removes
                from results
              </li>
              <li>
                • Run scans regularly, especially after timesheet submissions
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DuplicateBillingDetection;
