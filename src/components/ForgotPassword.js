import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const handleCheckUser = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        // Handle 404 error
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      alert(data.message);
      setStep(2);
      
    } catch (error) {
      console.error("Error:", error.message);
      alert("User not found or server issue!");
    }
  };
  

  const handleResetPassword = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, newPassword, confirmPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Password updated successfully");
      setStep(1);
      setEmail("");
      setRole("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{height: "100vh", background: "white", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center"}}>
      {step === 1 ? (
        <div style={{width: "300px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "10px"}}>
          <h2>Forgot Password</h2>
          <input style={{padding: "10px", width: "100%"}} type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={{padding: "10px", width: "100%"}} type="text" placeholder="Enter Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <button style={{color: "white", padding: "10px", width: "100%", background: "rgb(98, 203, 211)", cursor: "pointer"}} onClick={handleCheckUser}>Next</button>
        </div>
      ) : (     
        <div style={{width: "300px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "10px"}}>
          <h2>Reset Password</h2>
          <input style={{padding: "10px", width: "100%"}} type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input style={{padding: "10px", width: "100%"}} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button style={{padding: "10px", width: "100%", background: "rgb(98, 203, 211)", cursor: "pointer"}} onClick={handleResetPassword}>Update Password</button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
