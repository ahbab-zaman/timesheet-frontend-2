/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, CheckCircle } from "lucide-react";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { verifyToken } from "@/utils/verifyToken";
import { useNavigate } from "react-router-dom";
// import { toast } from 'sonner';
import { toast } from "react-hot-toast";

// Dummy data to replace Supabase
const dummyUsers = [
  {
    id: 1,
    email: "john@example3.com",
    password: "securePassword1234",
    fullName: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "manager@test.com",
    password: "manager123",
    fullName: "Manager User",
    role: "manager",
  },
  {
    id: 3,
    email: "employee@test.com",
    password: "employee123",
    fullName: "Employee User",
    role: "employee",
  },
  {
    id: 4,
    email: "finance@test.com",
    password: "finance123",
    fullName: "Finance User",
    role: "finance",
  },
];

const dummyEmployees = [
  { id: 1, email: "employee@test.com" },
  { id: 2, email: "john@test.com" },
  { id: 3, email: "jane@test.com" },
];

// Mock useAuth hook
const useAuth = () => {
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = dummyUsers.find(
          (u) => u.email === email && u.password === password
        );
        if (foundUser) {
          setUser(foundUser);
          resolve({ error: null });
        } else {
          resolve({ error: { message: "Invalid email or password" } });
        }
      }, 1000);
    });
  };

  const signUp = async (email, password, metadata) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUser = dummyUsers.find((u) => u.email === email);
        if (existingUser) {
          resolve({ error: { message: "User already exists" } });
        } else {
          const newUser = {
            id: dummyUsers.length + 1,
            email,
            password,
            fullName: metadata.full_name,
            role: "employee",
          };
          dummyUsers.push(newUser);
          setUser(newUser);
          resolve({ error: null });
        }
      }, 1000);
    });
  };

  return { signIn, signUp, user };
};

// Mock useToast hook
// const useToast = () => {
//   const [toasts, setToasts] = useState([]);

//   const toast = ({ title, description, variant = 'default' }) => {
//     const newToast = {
//       id: Date.now(),
//       title,
//       description,
//       variant
//     };

//     setToasts(prev => [...prev, newToast]);

//     setTimeout(() => {
//       setToasts(prev => prev.filter(t => t.id !== newToast.id));
//     }, 4000);
//   };

//   const ToastContainer = () => (
//     <div className="fixed top-4 right-4 z-50 space-y-2">
//       {toasts.map(t => (
//         <div
//           key={t.id}
//           className={`p-4 rounded-lg shadow-lg max-w-sm ${
//             t.variant === 'destructive'
//               ? 'bg-red-500 text-white'
//               : 'bg-green-500 text-white'
//           }`}
//         >
//           <div className="font-semibold">{t.title}</div>
//           <div className="text-sm">{t.description}</div>
//         </div>
//       ))}
//     </div>
//   );

//   return { toast, ToastContainer };
// };

// Mock navigate function
// const useNavigate = () => {
//   return (path) => {
//     console.log(`Would navigate to: ${path}`);
//     // In a real app, this would use react-router-dom navigation
//   };
// };

// Mock Supabase client
const mockSupabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        single: () => {
          if (table === "user_roles") {
            const user = dummyUsers.find((u) => u.id === value);
            return Promise.resolve({
              data: user ? { role: user.role } : null,
              error: user ? null : new Error("No role found"),
            });
          }
          if (table === "employees") {
            const employee = dummyEmployees.find((e) => e.email === value);
            return Promise.resolve({
              data: employee || null,
              error: employee ? null : new Error("No employee found"),
            });
          }
          return Promise.resolve({
            data: null,
            error: new Error("Table not found"),
          });
        },
      }),
    }),
  }),
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  // const navigate = useNavigate();
  // const { toast, ToastContainer } = useToast();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { error }] = useLoginMutation();


  useEffect(() => {
    if (user && !loading) {
      // Only redirect if we have a user and auth is not loading
      checkUserRoleAndRedirect();
    }
  }, [user, loading, navigate]);

  const checkUserRoleAndRedirect = async () => {
    if (!user || loading) return;

    try {
      const { data: roleData } = await mockSupabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role === "admin") {
        navigate("/employee-management");
      } else if (roleData?.role === "manager") {
        navigate("/employee-manager");
      } else if (roleData?.role === "finance") {
        navigate("/finance");
      } else if (roleData?.role === "employee") {
        navigate("/timesheet2");
      } else {
        // Default to employee timesheet if no role found
        navigate("/timesheet2");
      }
    } catch (error) {
      // Check if user exists in employees table (fallback for employees without role entries)
      try {
        const { data: employeeData } = await mockSupabase
          .from("employees")
          .select("id")
          .eq("email", user.email)
          .single();

        if (employeeData) {
          // User exists as employee, redirect to timesheet2
          navigate("/timesheet2");
        } else {
          // No employee record, show error
          toast({
            title: "Access Error",
            description:
              "Your timesheet portal is currently unavailable. Please contact admin.",
            variant: "destructive",
          });
        }
      } catch {
        // Complete fallback
        toast({
          title: "Access Error",
          description:
            "Your timesheet portal is currently unavailable. Please contact admin.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials = { email, password };
      const response = await login(credentials).unwrap();

      if (response.error) {
        toast.error("Invalid email or password.");
        setLoading(false);
        return;
      } else {
        toast.success("Login successful.");
        // Save token to localStorage
        localStorage.setItem("authToken", response.token);
        // Log user credentials (excluding password for security)
        console.log("User Credentials:", {
          email: email,
          user: response.user, // Assuming response contains user data
          token: response.token,
        });
        setLoading(false);
      }

      const user = verifyToken(response.token);
      dispatch(setUser({ user: user, token: response.token }));
      navigate(`/${user.role.toLowerCase()}/dashboard`);

      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, { full_name: fullName });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created! 🎉",
        description: "Check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              AIREPRO TIMESHEET
            </h1>
            <p className="text-muted-foreground mt-2">
              Fill your timesheet to make every hour count ✨
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your timesheet dashboard
                <br />
                <div className="text-xs text-muted-foreground mt-3 space-y-1">
                  <div>
                    <strong>Admin:</strong> admin@test.com / admin123
                  </div>
                  <div>
                    <strong>Manager:</strong> manager@test.com / manager123
                  </div>
                  <div>
                    <strong>Employee:</strong> employee@test.com / employee123
                  </div>
                  <div>
                    <strong>Finance:</strong> finance@test.com / finance123
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleUserLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 gap-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team collaboration made easy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Manager review helps keep project hours aligned ✅</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
