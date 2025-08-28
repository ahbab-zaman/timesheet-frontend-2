// import { useState, useEffect } from "react";
// import { differenceInDays, format } from "date-fns";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Filter,
//   MessageSquare,
//   User,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import axiosInstance from "../../services/axiosInstance";

// const ManagerLeave = () => {
//   const [filter, setFilter] = useState("pending");
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch leave requests on component mount
//   useEffect(() => {
//     const fetchLeaveRequests = async () => {
//       setLoading(true);
//       try {
//         const response = await axiosInstance.get("/api/v1/leave", {
//           params: { page: 1, limit: 100 },
//         });
//         const leaves = Array.isArray(response.data.leaves)
//           ? response.data.leaves
//           : [];
//         const mappedRequests = leaves.map((leave) => ({
//           id: leave.id,
//           name: leave.employeeName,
//           email: leave.employeeEmail,
//           dept: leave.employeeDepartment,
//           type: leave.leaveType,
//           fromDate: leave.fromDate,
//           toDate: leave.toDate,
//           days:
//             differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) +
//             1,
//           status: leave.status.toLowerCase(),
//         }));
//         setLeaveRequests(mappedRequests);
//       } catch (error) {
//         toast.error("Failed to fetch leave requests. Please try again.");
//         console.error("Error fetching leave requests:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaveRequests();
//   }, []);

//   const filteredRequests =
//     filter === "all"
//       ? leaveRequests
//       : leaveRequests.filter((req) => req.status === filter);

//   const approveLeave = async (id) => {
//     try {
//       await axiosInstance.patch(`/api/v1/leave/${id}`, { status: "Approved" });
//       setLeaveRequests((prev) =>
//         prev.map((req) =>
//           req.id === id ? { ...req, status: "approved" } : req
//         )
//       );
//       toast.success("Leave request approved successfully.");
//     } catch (error) {
//       toast.error("Failed to approve leave request. Please try again.");
//       console.error("Error approving leave request:", error);
//     }
//   };

//   const rejectLeave = async (id) => {
//     try {
//       await axiosInstance.delete(`/api/v1/leave/${id}`);
//       setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
//       toast.success("Leave request rejected and removed successfully.");
//     } catch (error) {
//       toast.error("Failed to reject leave request. Please try again.");
//       console.error("Error rejecting leave request:", error);
//     }
//   };

//   const getInitials = (name) => {
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
//             Leave Approvals
//           </h2>
//           <p className="text-muted-foreground mt-1">
//             Manage and review employee leave requests with ease
//           </p>
//         </div>
//         <Select value={filter} onValueChange={setFilter}>
//           <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 shadow-sm">
//             <Filter className="h-4 w-4 mr-2" />
//             <SelectValue placeholder="Filter requests" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="pending">
//               Pending (
//               {leaveRequests.filter((r) => r.status === "pending").length})
//             </SelectItem>
//             <SelectItem value="approved">Approved</SelectItem>
//             <SelectItem value="rejected">Rejected</SelectItem>
//             <SelectItem value="all">All</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {loading ? (
//         <Card className="border-none shadow-lg">
//           <CardContent className="flex justify-center items-center py-12">
//             <svg
//               className="animate-spin h-8 w-8 text-primary"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//           </CardContent>
//         </Card>
//       ) : filteredRequests.length === 0 ? (
//         <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
//           <CardContent className="text-center py-12">
//             <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
//             <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
//               No Leave Requests Found
//             </h3>
//             <p className="text-muted-foreground">
//               No {filter} leave requests to review at this time.
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {filteredRequests.map((req) => (
//             <Card
//               key={req.id}
//               className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800"
//             >
//               <CardHeader className="pb-2">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
//                       {getInitials(req.name)}
//                     </div>
//                     <div>
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         {req.name}
//                         <Badge
//                           variant={
//                             req.status === "pending"
//                               ? "secondary"
//                               : req.status === "approved"
//                               ? "default"
//                               : "destructive"
//                           }
//                           className="text-xs"
//                         >
//                           {req.status.charAt(0).toUpperCase() +
//                             req.status.slice(1)}
//                         </Badge>
//                       </CardTitle>
//                       <CardDescription className="text-sm">
//                         {req.email} • {req.dept}
//                       </CardDescription>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-md font-semibold text-gray-900 dark:text-white">
//                       {req.type}
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       {req.days} days
//                     </div>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="text-sm text-muted-foreground">
//                     <span className="font-medium">From:</span>{" "}
//                     {format(new Date(req.fromDate), "MMM dd, yyyy")}
//                     <br />
//                     <span className="font-medium">To:</span>{" "}
//                     {format(new Date(req.toDate), "MMM dd, yyyy")}
//                   </div>
//                   <div className="flex gap-2 pt-2">
//                     <Button
//                       onClick={() => approveLeave(req.id)}
//                       className="flex-1 bg-green-600 hover:bg-green-700"
//                     >
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       Approve
//                     </Button>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="destructive"
//                           className="flex-1 bg-red-600 hover:bg-red-700"
//                         >
//                           <XCircle className="h-4 w-4 mr-2" />
//                           Reject
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
//                         <DialogHeader>
//                           <DialogTitle className="text-xl">
//                             Reject Leave Request
//                           </DialogTitle>
//                           <DialogDescription>
//                             Confirm rejection of {req.name}'s leave request.
//                             Provide remarks to explain the decision.
//                           </DialogDescription>
//                         </DialogHeader>
//                         <div className="space-y-4">
//                           <div>
//                             <Label
//                               htmlFor="rejection-remarks"
//                               className="text-sm font-medium"
//                             >
//                               Remarks
//                             </Label>
//                             <Textarea
//                               id="rejection-remarks"
//                               placeholder="Explain why this leave request is being rejected..."
//                               className="mt-1"
//                             />
//                           </div>
//                           <div className="flex gap-2">
//                             <Button
//                               variant="destructive"
//                               onClick={() => rejectLeave(req.id)}
//                               className="flex-1"
//                             >
//                               <MessageSquare className="h-4 w-4 mr-2" />
//                               Send Rejection
//                             </Button>
//                           </div>
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManagerLeave;

import { useState, useEffect } from "react";
import { differenceInDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  MessageSquare,
  User,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axiosInstance from "../../services/axiosInstance";

const ManagerLeave = () => {
  const [filter, setFilter] = useState("pending");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Fetch leave requests on component mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/v1/leave", {
          params: { page: 1, limit: 100 },
        });
        const leaves = Array.isArray(response.data.leaves)
          ? response.data.leaves
          : [];
        const mappedRequests = leaves.map((leave) => ({
          id: leave.id,
          name: leave.employeeName,
          email: leave.employeeEmail,
          dept: leave.employeeDepartment,
          type: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          days:
            differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) +
            1,
          status: leave.status.toLowerCase(),
          remarks: leave.remarks || "",
        }));
        setLeaveRequests(mappedRequests);
      } catch (error) {
        toast.error("Failed to fetch leave requests. Please try again.");
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  const filteredRequests =
    filter === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filter);

  const approveLeave = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, { status: "Approved" });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
      toast.success("Leave request approved successfully.");
    } catch (error) {
      toast.error("Failed to approve leave request. Please try again.");
      console.error("Error approving leave request:", error);
    }
  };

  const rejectLeave = async (id, remarks) => {
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, {
        status: "Rejected",
        remarks: remarks || "No remarks provided",
      });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected", remarks } : req
        )
      );
      toast.success("Leave request rejected successfully.");
    } catch (error) {
      toast.error("Failed to reject leave request. Please try again.");
      console.error("Error rejecting leave request:", error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leave Approvals
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and review employee leave requests with ease
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              Pending (
              {leaveRequests.filter((r) => r.status === "pending").length})
            </SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="border-none shadow-lg">
          <CardContent className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Leave Requests Found
            </h3>
            <p className="text-muted-foreground">
              No {filter} leave requests to review at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <Card
              key={req.id}
              className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {getInitials(req.name)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {req.name}
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "secondary"
                              : req.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {req.email} • {req.dept}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-md font-semibold text-gray-900 dark:text-white">
                      {req.type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {req.days} days
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">From:</span>{" "}
                    {format(new Date(req.fromDate), "MMM dd, yyyy")}
                    <br />
                    <span className="font-medium">To:</span>{" "}
                    {format(new Date(req.toDate), "MMM dd, yyyy")}
                  </div>
                  {req.remarks && req.status === "rejected" && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Remarks:</span>{" "}
                      {req.remarks}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => approveLeave(req.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={req.status !== "pending"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          disabled={req.status !== "pending"}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-xl">
                            Reject Leave Request
                          </DialogTitle>
                          <DialogDescription>
                            Confirm rejection of {req.name}'s leave request.
                            Provide remarks to explain the decision.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="rejection-remarks"
                              className="text-sm font-medium"
                            >
                              Remarks
                            </Label>
                            <Textarea
                              id="rejection-remarks"
                              placeholder="Explain why this leave request is being rejected..."
                              className="mt-1"
                              onChange={(e) => setRemarks(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => rejectLeave(req.id, remarks)}
                              className="flex-1"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Rejection
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerLeave;
