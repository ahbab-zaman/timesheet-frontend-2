// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/hooks/use-toast";
// import {
//   CheckCircle,
//   XCircle,
//   Clock,
//   User,
//   Calendar,
//   Lock,
// } from "lucide-react";
// import { format, startOfWeek, endOfWeek } from "date-fns";
// import axiosInstance from "../services/axiosInstance";

// const TimesheetApproval = ({ userRole }) => {
//   const [timesheets, setTimesheets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("pending");
//   const [selectedTimesheet, setSelectedTimesheet] = useState(null);
//   const [rejectionComment, setRejectionComment] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dateRange, setDateRange] = useState(() => {
//     const today = new Date();
//     return {
//       start: startOfWeek(today, { weekStartsOn: 1 }), // Monday
//       end: endOfWeek(today, { weekStartsOn: 1 }), // Sunday
//     };
//   });
//   const [user, setUser] = useState(null);
//   const [employees, setEmployees] = useState([]);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchCurrentUser = async () => {
//       try {
//         const response = await axiosInstance.get("/api/v1/employee");
//         const user = response.data.employees[0];
//         if (isMounted) {
//           setUser(user.id);
//         }
//       } catch (error) {
//         if (isMounted) {
//           toast({
//             title: "Failed to fetch user data",
//             description: error.response?.data?.error || "Please try again.",
//             variant: "destructive",
//           });
//           console.error("Error fetching user data:", error);
//         }
//       }
//     };

//     const fetchEmployees = async () => {
//       try {
//         const response = await axiosInstance.get("/api/v1/employee");
//         if (isMounted) {
//           setEmployees(response.data.employees || []);
//         }
//       } catch (error) {
//         if (isMounted) {
//           toast({
//             title: "Failed to fetch employees",
//             description: error.response?.data?.error || "Please try again.",
//             variant: "destructive",
//           });
//           console.error("Error fetching employees:", error);
//         }
//       }
//     };

//     const fetchTimesheets = async () => {
//       setLoading(true);
//       try {
//         const response = await axiosInstance.get(
//           "/api/v1/time/timesheets/all",
//           {
//             params: {
//               week_start: format(dateRange.start, "yyyy-MM-dd"),
//               week_end: format(dateRange.end, "yyyy-MM-dd"),
//               status: filter === "all" ? undefined : filter,
//             },
//           }
//         );
//         console.log("API Response:", response.data); // Log raw response

//         let allTimesheets = [];
//         if (Array.isArray(response.data)) {
//           allTimesheets = response.data.map((timesheet) => ({
//             id: timesheet.id || "unknown",
//             employee: {
//               id: timesheet.employee?.id || timesheet.employee_id || "unknown",
//               name: timesheet.employee?.name || "Unknown Employee",
//               email: timesheet.employee?.email || "unknown@example.com",
//             },
//             week_start_date:
//               timesheet.week_start_date ||
//               format(dateRange.start, "yyyy-MM-dd"),
//             week_end_date:
//               timesheet.week_end_date || format(dateRange.end, "yyyy-MM-dd"),
//             total_hours: timesheet.total_hours || 0,
//             status: timesheet.status || "draft",
//             approved_at: timesheet.approved_at || null,
//             locked_at: timesheet.locked_at || null,
//             comments: timesheet.comments || "",
//             entries: timesheet.entries || [],
//           }));
//         } else if (response.data.timesheets) {
//           allTimesheets = response.data.timesheets.map((timesheet) => ({
//             id: timesheet.id || "unknown",
//             employee: {
//               id: timesheet.employee?.id || timesheet.employee_id || "unknown",
//               name: timesheet.employee?.name || "Unknown Employee",
//               email: timesheet.employee?.email || "unknown@example.com",
//             },
//             week_start_date:
//               timesheet.week_start_date ||
//               format(dateRange.start, "yyyy-MM-dd"),
//             week_end_date:
//               timesheet.week_end_date || format(dateRange.end, "yyyy-MM-dd"),
//             total_hours: timesheet.total_hours || 0,
//             status: timesheet.status || "draft",
//             approved_at: timesheet.approved_at || null,
//             locked_at: timesheet.locked_at || null,
//             comments: timesheet.comments || "",
//             entries: timesheet.entries || [],
//           }));
//         } else {
//           console.warn("Unexpected response format:", response.data);
//           toast({
//             title: "Unexpected Response",
//             description: "The server returned an unexpected data format.",
//             variant: "destructive",
//           });
//         }

//         console.log("Mapped Timesheets:", allTimesheets); // Log mapped data
//         if (isMounted) {
//           setTimesheets(allTimesheets);
//           if (allTimesheets.length === 0) {
//             toast({
//               title: "No Timesheets",
//               description: `No timesheets found for week of ${format(
//                 dateRange.start,
//                 "MMM dd, yyyy"
//               )}.`,
//               variant: "info",
//             });
//           }
//         }
//       } catch (error) {
//         if (isMounted) {
//           console.error("Error fetching timesheets:", error);
//           toast({
//             title: "Failed to fetch timesheets",
//             description: error.response?.data?.error || "Please try again.",
//             variant: "destructive",
//           });
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     const initializeData = async () => {
//       await fetchCurrentUser();
//       await fetchEmployees();
//       await fetchTimesheets();
//     };

//     initializeData();

//     return () => {
//       isMounted = false;
//     };
//   }, [filter, dateRange]);

//   const handleApprove = async (timesheetId) => {
//     try {
//       await axiosInstance.patch(
//         `/api/v1/time/timesheets/${timesheetId}/approve`
//       );
//       setTimesheets((prev) =>
//         prev.map((t) =>
//           t.id === timesheetId
//             ? {
//                 ...t,
//                 status: "approved",
//                 approved_at: new Date().toISOString(),
//               }
//             : t
//         )
//       );
//       toast({
//         title: "Timesheet approved",
//         description: "Timesheet has been approved successfully",
//       });
//     } catch (error) {
//       console.error("Error approving timesheet:", error);
//       toast({
//         title: "Error approving timesheet",
//         description: error.response?.data?.error || error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   const handleReject = async (timesheetId) => {
//     try {
//       await axiosInstance.patch(
//         `/api/v1/time/timesheets/${timesheetId}/reject`,
//         {
//           remarks: rejectionComment,
//         }
//       );
//       setTimesheets((prev) =>
//         prev.map((t) =>
//           t.id === timesheetId
//             ? { ...t, status: "rejected", comments: rejectionComment }
//             : t
//         )
//       );
//       toast({
//         title: "Timesheet rejected",
//         description: "Timesheet has been rejected successfully",
//       });
//       setRejectionComment("");
//       setSelectedTimesheet(null);
//     } catch (error) {
//       console.error("Error rejecting timesheet:", error);
//       toast({
//         title: "Error rejecting timesheet",
//         description: error.response?.data?.error || error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   const getStatusBadge = (status, isLocked) => {
//     if (isLocked) {
//       return (
//         <Badge variant="outline" className="bg-gray-100">
//           <Lock className="h-3 w-3 mr-1" />
//           Locked
//         </Badge>
//       );
//     }

//     const variants = {
//       pending: { variant: "secondary", label: "🟡 Pending", icon: Clock },
//       approved: { variant: "default", label: "✅ Approved", icon: CheckCircle },
//       rejected: { variant: "destructive", label: "🔴 Rejected", icon: XCircle },
//       draft: { variant: "outline", label: "Draft", icon: Clock },
//     };

//     const config = variants[status] || variants.draft;
//     const IconComponent = config.icon;

//     return (
//       <Badge variant={config.variant}>
//         <IconComponent className="h-3 w-3 mr-1" />
//         {config.label}
//       </Badge>
//     );
//   };

//   const filteredTimesheets = timesheets.filter(
//     (timesheet) =>
//       timesheet.employee.name
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       timesheet.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleDateRangeChange = (direction) => {
//     setDateRange((prev) => {
//       const newStart = new Date(prev.start);
//       newStart.setDate(prev.start.getDate() + direction * 7);
//       return {
//         start: startOfWeek(newStart, { weekStartsOn: 1 }),
//         end: endOfWeek(newStart, { weekStartsOn: 1 }),
//       };
//     });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header Controls */}
//       <div className="flex flex-wrap gap-4 items-center justify-between">
//         <div className="flex gap-2">
//           <Button
//             variant={filter === "pending" ? "default" : "outline"}
//             onClick={() => setFilter("pending")}
//             size="sm"
//           >
//             Pending ({timesheets.filter((t) => t.status === "pending").length})
//           </Button>
//           <Button
//             variant={filter === "approved" ? "default" : "outline"}
//             onClick={() => setFilter("approved")}
//             size="sm"
//           >
//             Approved
//           </Button>
//           <Button
//             variant={filter === "rejected" ? "default" : "outline"}
//             onClick={() => setFilter("rejected")}
//             size="sm"
//           >
//             Rejected
//           </Button>
//           <Button
//             variant={filter === "all" ? "default" : "outline"}
//             onClick={() => setFilter("all")}
//             size="sm"
//           >
//             All
//           </Button>
//         </div>
//         <div className="flex gap-2 items-center">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handleDateRangeChange(-1)}
//           >
//             Previous Week
//           </Button>
//           <span className="text-sm">
//             {format(dateRange.start, "MMM dd, yyyy")} -{" "}
//             {format(dateRange.end, "MMM dd, yyyy")}
//           </span>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handleDateRangeChange(1)}
//           >
//             Next Week
//           </Button>
//           <Input
//             placeholder="Search employee..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-48"
//           />
//         </div>
//       </div>

//       {/* Timesheets List */}
//       <div className="space-y-4">
//         {loading ? (
//           <Card>
//             <CardContent className="p-8 text-center">
//               <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
//               <p>Loading timesheets...</p>
//             </CardContent>
//           </Card>
//         ) : filteredTimesheets.length === 0 ? (
//           <Card>
//             <CardContent className="p-8 text-center">
//               <Calendar className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
//               <p className="text-muted-foreground">
//                 No timesheets found for the selected week and filter.
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           filteredTimesheets.map((timesheet) => (
//             <Card key={timesheet.id} className="relative">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div>
//                       <CardTitle className="text-lg flex items-center gap-2">
//                         <User className="h-5 w-5" />
//                         {timesheet.employee.name}
//                       </CardTitle>
//                       <p className="text-sm text-muted-foreground">
//                         {timesheet.employee.email} • Week of{" "}
//                         {format(
//                           new Date(timesheet.week_start_date),
//                           "MMM dd, yyyy"
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {getStatusBadge(timesheet.status, !!timesheet.locked_at)}
//                     <Badge variant="outline">
//                       {timesheet.total_hours}h total
//                     </Badge>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {/* Time Entries */}
//                   <div className="space-y-2">
//                     <h4 className="font-medium">Time Entries</h4>
//                     {timesheet.entries.length === 0 ? (
//                       <p className="text-sm text-muted-foreground">
//                         No time entries for this timesheet.
//                       </p>
//                     ) : (
//                       timesheet.entries.map((entry) => (
//                         <div
//                           key={entry.id}
//                           className="flex items-center justify-between p-2 bg-muted rounded"
//                         >
//                           <div>
//                             <span className="font-medium">
//                               {format(new Date(entry.date), "MMM dd")}
//                             </span>
//                             <span className="mx-2">•</span>
//                             <span>{entry.hours}h</span>
//                             {entry.description && (
//                               <>
//                                 <span className="mx-2">•</span>
//                                 <span className="text-muted-foreground">
//                                   {entry.description}
//                                 </span>
//                               </>
//                             )}
//                             {entry.task && (
//                               <>
//                                 <span className="mx-2">•</span>
//                                 <span className="text-muted-foreground">
//                                   Task: {entry.task.name} (Project:{" "}
//                                   {entry.task.project?.name || "Unknown"})
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>

//                   {/* Action Buttons */}
//                   {timesheet.status === "pending" && userRole === "admin" && (
//                     <div className="flex gap-2 pt-4 border-t">
//                       <Button
//                         onClick={() => handleApprove(timesheet.id)}
//                         size="sm"
//                       >
//                         <CheckCircle className="h-4 w-4 mr-2" />
//                         Approve
//                       </Button>
//                       <Dialog
//                         open={selectedTimesheet === timesheet.id}
//                         onOpenChange={(open) => {
//                           setSelectedTimesheet(open ? timesheet.id : null);
//                         }}
//                       >
//                         <DialogTrigger asChild>
//                           <Button variant="outline" size="sm">
//                             <XCircle className="h-4 w-4 mr-2" />
//                             Reject
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Reject Timesheet</DialogTitle>
//                           </DialogHeader>
//                           <Textarea
//                             placeholder="Reason for rejection..."
//                             value={rejectionComment}
//                             onChange={(e) =>
//                               setRejectionComment(e.target.value)
//                             }
//                           />
//                           <div className="flex gap-2 pt-4">
//                             <Button
//                               variant="outline"
//                               onClick={() => setSelectedTimesheet(null)}
//                             >
//                               Cancel
//                             </Button>
//                             <Button
//                               variant="destructive"
//                               onClick={() => handleReject(timesheet.id)}
//                               disabled={!rejectionComment.trim()}
//                             >
//                               Reject
//                             </Button>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     </div>
//                   )}
//                   {timesheet.status === "rejected" && timesheet.comments && (
//                     <div className="pt-4">
//                       <h4 className="font-medium">Rejection Reason</h4>
//                       <p className="text-sm text-muted-foreground">
//                         {timesheet.comments}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default TimesheetApproval;

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "../services/axiosInstance";

const TimesheetApproval = ({ userRole }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee");
        const user = response.data.employees[0];
        if (isMounted) {
          setUser(user.id);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.code === "ECONNABORTED"
              ? "Request to fetch user data timed out. Please check if the server is running at http://localhost:3000."
              : error.response?.data?.error || "Failed to fetch user data.";
          toast({
            title: "Error fetching user data",
            description: errorMessage,
            variant: "destructive",
          });
          console.error("Error fetching user data:", error);
        }
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee");
        if (isMounted) {
          setEmployees(response.data.employees || []);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.code === "ECONNABORTED"
              ? "Request to fetch employees timed out. Please check if the server is running at http://localhost:3000."
              : error.response?.data?.error || "Failed to fetch employees.";
          toast({
            title: "Error fetching employees",
            description: errorMessage,
            variant: "destructive",
          });
          console.error("Error fetching employees:", error);
        }
      }
    };

    const fetchTimesheets = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          "/api/v1/time/timesheets/all",
          {
            params: {
              status: filter === "all" ? undefined : filter,
            },
          }
        );
        console.log("API Response:", response.data); // Log raw response

        let allTimesheets = [];
        if (Array.isArray(response.data)) {
          allTimesheets = response.data.map((timesheet) => ({
            id: timesheet.id || "unknown",
            employee: {
              id: timesheet.employee?.id || timesheet.employee_id || "unknown",
              name: timesheet.employee?.name || "Unknown Employee",
              email: timesheet.employee?.email || "unknown@example.com",
            },
            week_start_date: timesheet.week_start_date || "unknown",
            week_end_date: timesheet.week_end_date || "unknown",
            total_hours: timesheet.total_hours || 0,
            status: timesheet.status || "draft",
            approved_at: timesheet.approved_at || null,
            locked_at: timesheet.locked_at || null,
            comments: timesheet.comments || "",
            entries: timesheet.entries || [],
          }));
        } else if (response.data.timesheets) {
          allTimesheets = response.data.timesheets.map((timesheet) => ({
            id: timesheet.id || "unknown",
            employee: {
              id: timesheet.employee?.id || timesheet.employee_id || "unknown",
              name: timesheet.employee?.name || "Unknown Employee",
              email: timesheet.employee?.email || "unknown@example.com",
            },
            week_start_date: timesheet.week_start_date || "unknown",
            week_end_date: timesheet.week_end_date || "unknown",
            total_hours: timesheet.total_hours || 0,
            status: timesheet.status || "draft",
            approved_at: timesheet.approved_at || null,
            locked_at: timesheet.locked_at || null,
            comments: timesheet.comments || "",
            entries: timesheet.entries || [],
          }));
        } else {
          console.warn("Unexpected response format:", response.data);
          toast({
            title: "Unexpected Response",
            description: "The server returned an unexpected data format.",
            variant: "destructive",
          });
        }

        console.log("Mapped Timesheets:", allTimesheets); // Log mapped data
        if (isMounted) {
          setTimesheets(allTimesheets);
          if (allTimesheets.length === 0) {
            toast({
              title: "No Timesheets",
              description: "No timesheets found for the selected filter.",
              variant: "info",
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.code === "ECONNABORTED"
              ? "Request to fetch timesheets timed out. Please check if the server is running at http://localhost:3000."
              : error.response?.data?.error || "Failed to fetch timesheets.";
          toast({
            title: "Error fetching timesheets",
            description: errorMessage,
            variant: "destructive",
          });
          console.error("Error fetching timesheets:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const initializeData = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.warn("fetchCurrentUser failed, continuing with other fetches");
      }
      try {
        await fetchEmployees();
      } catch (error) {
        console.warn("fetchEmployees failed, continuing with timesheets");
      }
      await fetchTimesheets();
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const handleApprove = async (timesheetId) => {
    try {
      await axiosInstance.patch(
        `/api/v1/time/timesheets/${timesheetId}/approve`
      );
      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === timesheetId
            ? {
                ...t,
                status: "approved",
                approved_at: new Date().toISOString(),
              }
            : t
        )
      );
      toast({
        title: "Timesheet approved",
        description: "Timesheet has been approved successfully",
      });
    } catch (error) {
      console.error("Error approving timesheet:", error);
      toast({
        title: "Error approving timesheet",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (timesheetId) => {
    try {
      await axiosInstance.patch(
        `/api/v1/time/timesheets/${timesheetId}/reject`,
        {
          remarks: rejectionComment,
        }
      );
      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === timesheetId
            ? { ...t, status: "rejected", comments: rejectionComment }
            : t
        )
      );
      toast({
        title: "Timesheet rejected",
        description: "Timesheet has been rejected successfully",
      });
      setRejectionComment("");
      setSelectedTimesheet(null);
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      toast({
        title: "Error rejecting timesheet",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status, isLocked) => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      );
    }

    const variants = {
      pending: { variant: "secondary", label: "🟡 Pending", icon: Clock },
      approved: { variant: "default", label: "✅ Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "🔴 Rejected", icon: XCircle },
      draft: { variant: "outline", label: "Draft", icon: Clock },
    };

    const config = variants[status] || variants.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const groupedTimesheets = useMemo(() => {
    const groups = {};
    timesheets.forEach((timesheet) => {
      const weekKey = `${timesheet.week_start_date} - ${timesheet.week_end_date}`;
      if (!groups[weekKey]) {
        groups[weekKey] = {
          weekStart: timesheet.week_start_date,
          timesheets: [],
        };
      }
      groups[weekKey].timesheets.push(timesheet);
    });
    return Object.entries(groups).sort(
      ([weekA], [weekB]) =>
        new Date(weekB.split(" - ")[0]) - new Date(weekA.split(" - ")[0])
    );
  }, [timesheets]);

  const filteredTimesheets = timesheets.filter(
    (timesheet) =>
      timesheet.employee.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      timesheet.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending ({timesheets.filter((t) => t.status === "pending").length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            onClick={() => setFilter("rejected")}
            size="sm"
          >
            Rejected
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Timesheets List */}
      <div className="space-y-8">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading timesheets...</p>
            </CardContent>
          </Card>
        ) : filteredTimesheets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No timesheets found for the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          groupedTimesheets.map(([weekKey, { timesheets: weekTimesheets }]) => (
            <div key={weekKey} className="space-y-4">
              <h2 className="text-xl font-semibold">
                Week of{" "}
                {format(
                  new Date(weekTimesheets[0].week_start_date),
                  "MMM dd, yyyy"
                )}{" "}
                -{" "}
                {format(
                  new Date(weekTimesheets[0].week_end_date),
                  "MMM dd, yyyy"
                )}
              </h2>
              {weekTimesheets
                .filter(
                  (timesheet) =>
                    timesheet.employee.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    timesheet.employee.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((timesheet) => (
                  <Card key={timesheet.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {timesheet.employee.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {timesheet.employee.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(
                            timesheet.status,
                            !!timesheet.locked_at
                          )}
                          <Badge variant="outline">
                            {timesheet.total_hours}h total
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Time Entries */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Time Entries</h4>
                          {timesheet.entries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No time entries for this timesheet.
                            </p>
                          ) : (
                            timesheet.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <div>
                                  <span className="font-medium">
                                    {format(new Date(entry.date), "MMM dd")}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>{entry.hours}h</span>
                                  {entry.description && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="text-muted-foreground">
                                        {entry.description}
                                      </span>
                                    </>
                                  )}
                                  {entry.task && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="text-muted-foreground">
                                        Task: {entry.task.name} (Project:{" "}
                                        {entry.task.project?.name || "Unknown"})
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Action Buttons */}
                        {timesheet.status === "pending" &&
                          userRole === "admin" && (
                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                onClick={() => handleApprove(timesheet.id)}
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Dialog
                                open={selectedTimesheet === timesheet.id}
                                onOpenChange={(open) => {
                                  setSelectedTimesheet(
                                    open ? timesheet.id : null
                                  );
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Timesheet</DialogTitle>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Reason for rejection..."
                                    value={rejectionComment}
                                    onChange={(e) =>
                                      setRejectionComment(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedTimesheet(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(timesheet.id)}
                                      disabled={!rejectionComment.trim()}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        {timesheet.status === "rejected" &&
                          timesheet.comments && (
                            <div className="pt-4">
                              <h4 className="font-medium">Rejection Reason</h4>
                              <p className="text-sm text-muted-foreground">
                                {timesheet.comments}
                              </p>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimesheetApproval;
