import {
  Clock,
  Camera,
  Users,
  Settings,
  Clipboard,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";

const EmployeeSidebar = () => {
  return (
    <div className="bg-[#4A5568] p-6 h-full text-white">
      <ul className="space-y-4">
        <li>
          <Link
            to="/employee/dashboard"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/employee/timesheet"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <Clock className="mr-2 h-5 w-5" /> Realtime
          </Link>
        </li>
        <li>
          <Link
            to="/screenshots"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <Camera className="mr-2 h-5 w-5" /> Screenshots
          </Link>
        </li>
        <li>
          <Link
            to="/people"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <Users className="mr-2 h-5 w-5" /> People
          </Link>
        </li>
        <li>
          <Link
            to="/projects"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <Settings className="mr-2 h-5 w-5" /> Projects
          </Link>
        </li>
        <li>
          <Link
            to="/tasks"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <Clipboard className="mr-2 h-5 w-5" /> Tasks
          </Link>
        </li>
        <li>
          <Link
            to="/messages"
            className="flex items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-200"
          >
            <MessageCircle className="mr-2 h-5 w-5" /> Messages
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default EmployeeSidebar;
