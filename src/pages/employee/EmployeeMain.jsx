import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";

const EmployeeMain = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };
  return (
    <div className="flex gap-4 bg-gradient-to-r from-gray-100 to-white min-h-screen">
      <div className="w-[250px]">
        <EmployeeSidebar />
      </div>
      <div className="w-[calc(100vw-250px)] p-6">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <Avatar className="border-2 border-blue-500">
              <AvatarImage
                src="/placeholder-avatar.jpg"
                alt="Employee User"
                className="rounded-full"
              />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                EU
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Employee User</h2>
              <p className="text-md text-gray-600 font-medium">
                Software Developer
              </p>
            </div>
          </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut />
              Sign Out
            </Button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Members
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-blue-600">
              4
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-green-600">
              7
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-purple-600">
              13
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-orange-600">
              11
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-6">
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>0h yesterday</p>
              <p className="font-medium">0h 0m</p>
              <p>Active members: 4</p>
              <p>Active Projects: 7</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Yesterday
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">0h 0m</p>
              <p>Active members: 4</p>
              <p>Active Projects: 7</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                This week
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">0h 0m</p>
              <p>Active members: 4</p>
              <p>Active Projects: 7</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-semibold text-gray-700">
                Last Week
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">0h 0m</p>
              <p>Active members: 4</p>
              <p>Active Projects: 7</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-6">
          <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-md font-semibold text-gray-700">
                Today’s Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Activity content can be added here */}
            </CardContent>
          </Card>
          <div>
            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-semibold text-gray-700">
                  Productivity
                </CardTitle>
                <select className="text-sm text-gray-600 bg-white border border-gray-300 rounded p-1">
                  <option>Today</option>
                </select>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="75.36"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600">
                    70%
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mt-2">
                  Productive
                </p>
                <p className="text-sm text-gray-500">
                  Based on today’s activity
                </p>
              </CardContent>
            </Card>
            <div className="mt-4 w-full">
              <Card className="bg-gray-50 border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between p-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Non Productive
                  </CardTitle>
                  <div className="flex space-x-2">
                    <button className="text-sm text-blue-500 hover:text-blue-700">
                      Apps
                    </button>
                    <button className="text-sm text-blue-500 hover:text-blue-700">
                      Members
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="mr-2">📘</span> Facebook
                    </span>
                    <span>0.01%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="mr-2">💬</span> Telegram
                    </span>
                    <span>0.01%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMain;
