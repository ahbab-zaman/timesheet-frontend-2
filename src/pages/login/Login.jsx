import { useState } from "react";
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
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { verifyToken } from "@/utils/verifyToken";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [contactNumber, setContactNumber] = useState(""); // Added contact number state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();

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
      }

      toast.success("Login successful ✅");

      // Save token
      localStorage.setItem("authToken", response.token);

      // Decode token & update Redux
      const user = verifyToken(response.token);
      dispatch(setUser({ user, token: response.token }));

      // Redirect based on role
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        fullName,
        email,
        password,
        employeeId: employeeId || null,
        department: department || null,
        position: position || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        contactNumber: contactNumber || null, // Added contact number to userData
      };
      const response = await register(userData).unwrap();

      if (response.error) {
        toast.error(response.error || "Registration failed.");
        setLoading(false);
        return;
      }

      toast.success(
        "Registration successful! You have been registered as an Employee. You can now log in."
      );

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setEmployeeId("");
      setDepartment("");
      setPosition("");
      setHourlyRate("");
      setContactNumber(""); // Clear contact number
    } catch (error) {
      toast.error(
        error?.data?.error || "Something went wrong during registration!"
      );
    } finally {
      setLoading(false);
    }
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
              {/* ✅ Sample credentials for testing */}
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <div>
                  <strong>Client:</strong> client@test.com / client123
                </div>
                <div>
                  <strong>Freelancer:</strong> freelancer@test.com /
                  freelancer123
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

              {/* Sign In */}
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

              {/* Sign Up */}
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

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">
                      Contact Number (optional)
                    </Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="Enter your contact number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Freelancer ID (optional)</Label>
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Enter your freelancer ID"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department (optional)</Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="Enter your department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position (optional)</Label>
                    <Input
                      id="position"
                      type="text"
                      placeholder="Enter your position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      placeholder="Enter your hourly rate"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
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
            <span>Manager review keeps project hours aligned ✅</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
