import { useState, useEffect } from "react";
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
import { Clock, Download } from "lucide-react";

const ProductivityTab = () => {
  const { toast } = useToast();
  const [teamProductivity, setTeamProductivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock team productivity data (replace with actual API fetch if needed)
    const mockTeamProductivity = [
      {
        team_name: "Frontend Development",
        members_count: 5,
        total_hours: 180,
        completed_tasks: 42,
        productivity_score: 92,
        efficiency_rating: "excellent",
        key_metrics: {
          on_time_delivery: 95,
          quality_score: 88,
          client_satisfaction: 94,
        },
      },
      {
        team_name: "Backend Development",
        members_count: 4,
        total_hours: 150,
        completed_tasks: 38,
        productivity_score: 87,
        efficiency_rating: "good",
        key_metrics: {
          on_time_delivery: 90,
          quality_score: 85,
          client_satisfaction: 89,
        },
      },
      {
        team_name: "UI/UX Design",
        members_count: 3,
        total_hours: 105,
        completed_tasks: 25,
        productivity_score: 85,
        efficiency_rating: "good",
        key_metrics: {
          on_time_delivery: 88,
          quality_score: 92,
          client_satisfaction: 91,
        },
      },
      {
        team_name: "Quality Assurance",
        members_count: 2,
        total_hours: 70,
        completed_tasks: 18,
        productivity_score: 75,
        efficiency_rating: "needs_improvement",
        key_metrics: {
          on_time_delivery: 82,
          quality_score: 78,
          client_satisfaction: 85,
        },
      },
    ];

    setTeamProductivity(mockTeamProductivity);
    setLoading(false);
  }, []);

  const getEfficiencyBadge = (rating) => {
    const variants = {
      excellent: { variant: "default", label: "🌟 Excellent" },
      good: { variant: "secondary", label: "👍 Good" },
      needs_improvement: {
        variant: "destructive",
        label: "⚠️ Needs Improvement",
      },
    };

    const config = variants[rating] || variants.needs_improvement;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportData = () => {
    let csvContent =
      "Team,Members,Hours,Tasks,Score,Rating,On-Time,Quality,Satisfaction\n";
    csvContent += teamProductivity
      .map(
        (t) =>
          `${t.team_name},${t.members_count},${t.total_hours},${t.completed_tasks},${t.productivity_score},${t.efficiency_rating},${t.key_metrics.on_time_delivery},${t.key_metrics.quality_score},${t.key_metrics.client_satisfaction}`
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_productivity_report.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Productivity report exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Team-wise Productivity Reports
        </h3>
        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamProductivity.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-600">
              No Data Available
            </h3>
            <p className="text-gray-500">
              No productivity data to display. Check back later!
            </p>
          </div>
        ) : (
          teamProductivity.map((team) => (
            <Card key={team.team_name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{team.team_name}</CardTitle>
                <CardDescription>{team.members_count} members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Productivity Score
                    </span>
                    <span className="font-bold text-lg">
                      {team.productivity_score}%
                    </span>
                  </div>
                  {getEfficiencyBadge(team.efficiency_rating)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Hours</span>
                    <span className="font-medium">{team.total_hours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Tasks</span>
                    <span className="font-medium">{team.completed_tasks}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-2">Key Metrics</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>On-time Delivery</span>
                      <span>{team.key_metrics.on_time_delivery}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Score</span>
                      <span>{team.key_metrics.quality_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Satisfaction</span>
                      <span>{team.key_metrics.client_satisfaction}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductivityTab;
