
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

type AuthDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Login" : "Create Account"}</DialogTitle>
        </DialogHeader>
        {mode === "login" ? (
          <LoginForm onSignUpClick={() => setMode("signup")} />
        ) : (
          <SignUpForm onLoginClick={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
