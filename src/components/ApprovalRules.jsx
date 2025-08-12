import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rule_type: "manual",
    is_active: true,
    auto_approve_threshold: 40,
    max_hours_per_day: 8,
    max_total_hours: 40,
    requires_manager_review: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = () => {
    const mockRules = [
      {
        id: "1",
        rule_type: "auto",
        name: "Standard Auto-Approval",
        description:
          "Auto-approve timesheets with ≤40 hours and ≤8 hours per day",
        is_active: true,
        auto_approve_threshold: 40,
        conditions: {
          max_hours_per_day: 8,
          max_total_hours: 40,
          requires_manager_review: false,
        },
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        rule_type: "manual",
        name: "Manager Review Required",
        description: "All timesheets require manager approval",
        is_active: true,
        conditions: {
          requires_manager_review: true,
          department_exceptions: ["Finance", "HR"],
        },
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        rule_type: "auto",
        name: "Overtime Auto-Approval",
        description: "Auto-approve overtime up to 50 hours for senior staff",
        is_active: false,
        auto_approve_threshold: 50,
        conditions: {
          max_hours_per_day: 10,
          max_total_hours: 50,
        },
        created_at: new Date().toISOString(),
      },
    ];
    setRules(mockRules);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (editingRule) {
        setRules((prev) =>
          prev.map((rule) =>
            rule.id === editingRule.id
              ? {
                  ...rule,
                  ...formData,
                  conditions: {
                    max_hours_per_day: formData.max_hours_per_day,
                    max_total_hours: formData.max_total_hours,
                    requires_manager_review: formData.requires_manager_review,
                  },
                }
              : rule
          )
        );

        toast({
          title: "Success",
          description: "Approval rule updated successfully",
        });
      } else {
        const newRule = {
          id: Math.random().toString(36).substring(7),
          ...formData,
          conditions: {
            max_hours_per_day: formData.max_hours_per_day,
            max_total_hours: formData.max_total_hours,
            requires_manager_review: formData.requires_manager_review,
          },
          created_at: new Date().toISOString(),
        };

        setRules((prev) => [newRule, ...prev]);

        toast({
          title: "Success",
          description: "Approval rule created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving rule:", error);
      toast({
        title: "Error",
        description: "Failed to save approval rule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      is_active: rule.is_active,
      auto_approve_threshold: rule.auto_approve_threshold || 40,
      max_hours_per_day: rule.conditions.max_hours_per_day || 8,
      max_total_hours: rule.conditions.max_total_hours || 40,
      requires_manager_review: rule.conditions.requires_manager_review || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (ruleId) => {
    try {
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));

      toast({
        title: "Success",
        description: "Approval rule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete approval rule",
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = (ruleId) => {
    try {
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
        )
      );

      toast({
        title: "Success",
        description: "Rule status updated successfully",
      });
    } catch (error) {
      console.error("Error updating rule status:", error);
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      rule_type: "manual",
      is_active: true,
      auto_approve_threshold: 40,
      max_hours_per_day: 8,
      max_total_hours: 40,
      requires_manager_review: false,
    });
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
          <Settings className="h-5 w-5" />
          Approval Rules Configuration
        </CardTitle>
        <CardDescription>
          Configure automatic and manual approval rules for timesheet
          submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule
                    ? "Edit Approval Rule"
                    : "Create New Approval Rule"}
                </DialogTitle>
                <DialogDescription>
                  Configure conditions for automatic or manual timesheet
                  approval
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Standard Auto-Approval"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="rule_type">Rule Type</Label>
                    <Select
                      value={formData.rule_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, rule_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of this rule..."
                  />
                </div>

                {formData.rule_type === "auto" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="threshold">
                        Auto-Approve Threshold (hours)
                      </Label>
                      <Input
                        id="threshold"
                        type="number"
                        min="1"
                        max="80"
                        value={formData.auto_approve_threshold}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            auto_approve_threshold:
                              parseInt(e.target.value) || 40,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_daily">Max Hours/Day</Label>
                      <Input
                        id="max_daily"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.max_hours_per_day}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_hours_per_day: parseInt(e.target.value) || 8,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="max_total">Max Total Hours</Label>
                      <Input
                        id="max_total"
                        type="number"
                        min="1"
                        max="80"
                        value={formData.max_total_hours}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_total_hours: parseInt(e.target.value) || 40,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="manager_review"
                    checked={formData.requires_manager_review}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        requires_manager_review: checked,
                      }))
                    }
                  />
                  <Label htmlFor="manager_review">
                    Requires Manager Review
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor="active">Rule is Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRule ? "Update" : "Create"} Rule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        rule.rule_type === "auto" ? "default" : "secondary"
                      }
                    >
                      {rule.rule_type === "auto" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {rule.rule_type === "auto" ? "Automatic" : "Manual"}
                    </Badge>
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.description}
                  </p>

                  {rule.rule_type === "auto" && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Auto-approve up to {rule.auto_approve_threshold}h total,
                      max {rule.conditions.max_hours_per_day}h/day
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {rules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No approval rules configured yet. Start by adding your first rule.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalRules;
