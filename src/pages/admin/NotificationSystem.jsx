import React, { useState, useEffect } from "react";
import { Bell, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const NotificationSystem = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Replace with your API call
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Example static data (replace with your API)
    const fakeData = [
      {
        id: "1",
        title: "Welcome!",
        message: "Thanks for joining us.",
        type: "success",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "System Update",
        message: "Maintenance scheduled for tonight.",
        type: "warning",
        is_read: true,
        created_at: new Date().toISOString(),
      },
    ];

    setNotifications(fakeData);
    setUnreadCount(fakeData.filter((n) => !n.is_read).length);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      case "warning":
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case "approval":
        return <Bell className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "approval":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.is_read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() =>
                        !notification.is_read && markAsRead(notification.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getBadgeVariant(notification.type)}
                              className="text-xs"
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
