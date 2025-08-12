import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const BillableTagsSystem = () => {
  const [tags, setTags] = useState([
    {
      id: "1",
      name: "Development",
      description: "Software development work",
      is_billable: true,
      rate_multiplier: 1.0,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Meeting",
      description: "Client and internal meetings",
      is_billable: true,
      rate_multiplier: 0.8,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Admin",
      description: "Administrative tasks",
      is_billable: false,
      rate_multiplier: 0.0,
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Training",
      description: "Employee training sessions",
      is_billable: false,
      rate_multiplier: 0.0,
      created_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_billable: true,
    rate_multiplier: 1.0,
  });
  const { toast } = useToast();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (editingTag) {
        setTags((prev) =>
          prev.map((tag) =>
            tag.id === editingTag.id ? { ...tag, ...formData } : tag
          )
        );

        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
      } else {
        const newTag = {
          id: Math.random().toString(36).substring(7),
          ...formData,
          created_at: new Date().toISOString(),
        };

        setTags((prev) => [newTag, ...prev]);

        toast({
          title: "Success",
          description: "Tag created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving tag:", error);
      toast({
        title: "Error",
        description: "Failed to save tag",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description,
      is_billable: tag.is_billable,
      rate_multiplier: tag.rate_multiplier,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (tagId) => {
    try {
      setTags((prev) => prev.filter((tag) => tag.id !== tagId));

      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      description: "",
      is_billable: true,
      rate_multiplier: 1.0,
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
          <Tag className="h-5 w-5" />
          Billable Tags System
        </CardTitle>
        <CardDescription>
          Manage billable and non-billable tags for time entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? "Edit Tag" : "Create New Tag"}
                </DialogTitle>
                <DialogDescription>
                  Configure billing settings for this tag
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Development, Meeting, Admin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of this tag..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="billable"
                    checked={formData.is_billable}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_billable: checked }))
                    }
                  />
                  <Label htmlFor="billable">Billable</Label>
                </div>

                <div>
                  <Label htmlFor="multiplier">Rate Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rate_multiplier}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rate_multiplier: parseFloat(e.target.value) || 1.0,
                      }))
                    }
                  />
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
                    {editingTag ? "Update" : "Create"} Tag
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant={tag.is_billable ? "default" : "secondary"}>
                      {tag.is_billable ? (
                        <DollarSign className="h-3 w-3 mr-1" />
                      ) : (
                        <Tag className="h-3 w-3 mr-1" />
                      )}
                      {tag.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tag.rate_multiplier}x rate
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tag.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {tags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tags created yet. Start by adding your first billable tag.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillableTagsSystem;
