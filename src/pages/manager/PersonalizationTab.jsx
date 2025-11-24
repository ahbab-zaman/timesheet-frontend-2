import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, TrendingUp, FileText, Users } from "lucide-react";

const PersonalizationTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Role Customization</h2>
      <Card>
        <CardHeader>
          <CardTitle>Role-based Dashboard Personalization</CardTitle>
          <CardDescription>
            Customize your dashboard based on your management role and team
            responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4" />
                Dashboard Widgets
              </h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Team productivity metrics
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Pending timesheet approvals
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Budget utilization alerts
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Project deadline reminders
                </label>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                Notification Preferences
              </h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  New timesheet submissions
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Leave request notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Weekly productivity reports
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Budget threshold alerts
                </label>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Team Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign New Project
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Team Meeting
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationTab;
