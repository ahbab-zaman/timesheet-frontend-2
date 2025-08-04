import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ManagerTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hours: "",
    startDate: "",
    dueDate: "",
    status: "pending",
    project: "",
    assignee: "",
  });

  const projects = ["Project Alpha", "Project Beta", "Project Gamma"];
  const employees = ["John Doe", "Jane Smith", "Alice Johnson"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.title.trim() &&
      formData.hours &&
      formData.startDate &&
      formData.dueDate &&
      formData.project &&
      formData.assignee
    ) {
      setTasks((prev) => [...prev, { ...formData, id: Date.now() }]);
      setFormData({
        title: "",
        description: "",
        hours: "",
        startDate: "",
        dueDate: "",
        status: "pending",
        project: "",
        assignee: "",
      });
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AIREPRO Task Management</h2>
          <p className="text-[#64748B]">
            Create and manage tasks for your team
          </p>
        </div>
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new task for your team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-1/2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) =>
                        handleSelectChange("project", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="assignee">Assign to Employee</Label>
                    <Select
                      value={formData.assignee}
                      onValueChange={(value) =>
                        handleSelectChange("assignee", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee} value={employee}>
                            {employee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter task description"
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-between items-center gap-3">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="hours">Estimated Hours</Label>
                    <Input
                      id="hours"
                      name="hours"
                      type="number"
                      value={formData.hours}
                      onChange={handleInputChange}
                      placeholder="Enter hours"
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <div>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                  <div>
                    <Button type="submit">Create Task</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="mt-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-gray-500">Create a task to get started.</p>
        </div>
      ) : (
        <div className="mt-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition mb-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-gray-700">
                      <Users size={16} />
                    </span>
                    {task.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Project:{" "}
                    <span className="text-gray-700">{task.project}</span> •
                    Assigned to:{" "}
                    <span className="text-gray-700">{task.assignee}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    Assigned
                  </p>
                  <p className="text-xs text-gray-500">Est. {task.hours}h</p>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{task.description}</p>

              <div className="flex gap-6 mt-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Start:</span> {task.startDate}
                </p>
                <p>
                  <span className="font-semibold">Due:</span> {task.dueDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ManagerTaskManagement;
