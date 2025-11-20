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
import { Clock, Users, CheckCircle, Eye, EyeOff, Mail } from "lucide-react";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useForgetPasswordMutation } from "@/redux/features/auth/authApi"; // Assume this RTK Query hook is added similarly to useLoginMutation
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { verifyToken } from "@/utils/verifyToken";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [forgetLoading, setForgetLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [forgetPassword] = useForgetPasswordMutation(); // Assume this mutation is defined in authApi

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email) => {
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!email.trim()) {
      toast.error("Email is required.");
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter the correct email ID");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Please enter the correct password");
      setLoading(false);
      return;
    }

    try {
      const credentials = { email, password };
      const response = await login(credentials).unwrap();

      if (response.error) {
        if (response.error === "invalid_email") {
          toast.error("Please enter the correct email ID");
        } else if (response.error === "invalid_password") {
          toast.error("Please enter the correct password");
        } else if (response.error === "user_not_found") {
          toast.error(
            "Please connect to Admin or Manager for more information"
          );
        } else {
          toast.error("Invalid email or password.");
        }
        setLoading(false);
        return;
      }

      toast.success("Login successful ✅");

      // Save token & update Redux (unchanged)
      localStorage.setItem("authToken", response.token);
      const user = verifyToken(response.token);
      dispatch(setUser({ user, token: response.token }));

      // Redirect based on role
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (error) {
      if (error?.data?.error === "invalid_email") {
        toast.error("Please enter the correct email ID");
      } else if (error?.data?.error === "invalid_password") {
        toast.error("Please enter the correct password");
      } else if (error?.data?.error === "user_not_found") {
        toast.error("Please connect to Admin or Manager for more information");
      } else {
        toast.error("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setForgetLoading(true);

    if (!forgetEmail.trim()) {
      toast.error("Email is required.");
      setForgetLoading(false);
      return;
    }
    if (!validateEmail(forgetEmail)) {
      toast.error("Please enter a valid email.");
      setForgetLoading(false);
      return;
    }

    try {
      await forgetPassword({ email: forgetEmail }).unwrap();
      toast.success("Password reset email sent! Check your inbox.");
      setIsForgetPassword(false);
      setForgetEmail("");
    } catch (error) {
      if (error?.data?.error === "user_not_found") {
        toast.error("No user found with this email.");
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    } finally {
      setForgetLoading(false);
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
            AIREPRO EMPLOYEE MANAGEMENT SERVICE
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isForgetPassword
                ? "Forgot Password?"
                : "Welcome To Airepro Pvt Ltd"}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgetPassword
                ? "Enter your email to receive a password reset link."
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgetPassword ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgetEmail">Email</Label>
                  <div className="relative">
                    <Input
                      id="forgetEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={forgetEmail}
                      onChange={(e) => setForgetEmail(e.target.value)}
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgetLoading}
                >
                  {forgetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-center"
                  onClick={() => setIsForgetPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              /* Only Login Form - No Tabs */
              <>
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-center text-sm"
                    onClick={() => setIsForgetPassword(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
