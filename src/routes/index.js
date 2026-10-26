// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router";
// import AppLayout from "../App";
// import Home from "../pages/Home";
// import Information from "../components/Information";
// import Token from "../components/Token";
// import Counter from "../components/Counter";
// import Countdown from "../components/Countdown";
// import EditDisplay from "../components/EditDisplay";
// import AuthPage from "../components/AuthPage";
// import BrandDashboard from "../components/BrandDashboard";
// import OwnerDashboard from "../components/OwnerDashboard";
// import ShopDetail from "../components/ShopDetail";
// import BrandDashboard2 from "../components/BrandDashboard2";
// import Display from "../components/Display";

// const AppRoutes = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<AppLayout />}>
//           <Route index element={<AuthPage />} />
//           <Route path="/ownerdashboard" element={<OwnerDashboard />} />
//           <Route path="BrandDashboard" element={<BrandDashboard />} />
//           <Route path="/shop/:id" element={<ShopDetail />} />
//           <Route
//             path="/branddashboard2/:id"
//             element={<BrandDashboard2 />}
//           />
//           <Route path="/:id/counter" element={<Counter />} />
//           <Route path="/:id/editdisplay" element={<EditDisplay />} />
//           <Route path="/:id/token" element={<Token />} />
//           <Route path="/:id/countdown" element={<Countdown />} />
//           <Route path="/display" element={<Display />} />
//           <Route path="/:id/information" element={<Information />} />
//           <Route path="/:title/:id">
//             <Route index element={<Home />} />
//             {/* <Route path="BrandDashboard" element={<BrandDashboard />} /> */}
//             <Route path="information" element={<Information />} />
//           </Route>
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default AppRoutes;

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import AppLayout from "../App";
import Home from "../pages/Home";
import Information from "../components/Information";
import Token from "../components/Token";
import Counter from "../components/Counter";
import Countdown from "../components/Countdown";
import EditDisplay from "../components/EditDisplay";
import AuthPage from "../components/AuthPage";
import BrandDashboard from "../components/BrandDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import ShopDetail from "../components/ShopDetail";
import BrandDashboard2 from "../components/BrandDashboard2";
import Display from "../components/Display";
import ProtectedRoute from "../components/ProtectedRoute";
import PaymentPage from "../components/PaymentPage";
import ForgotPassword from "../components/ForgotPassword";
import QrCode from "../components/QrCode";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<AuthPage />} />

          {/* SuperAdmin Platform Routes */}
          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
            <Route path="/ownerdashboard" element={<OwnerDashboard />} />
            <Route path="BrandDashboard" element={<BrandDashboard />} />
          </Route>

          {/* Mall Admin + SuperAdmin Routes (QR Studio, Mall Management & Store Director) */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
            <Route path="/branddashboard2/:id" element={<BrandDashboard2 />} />
            <Route path="/shop/:id" element={<ShopDetail />} />
            <Route path="/qrcode" element={<QrCode />} />
          </Route>

          {/* Staff Counter & Display Editor Routes (Accessible by Shop Admin, Admin, and SuperAdmin) */}
          <Route element={<ProtectedRoute allowedRoles={["shop admin", "shopadmin", "shop", "admin", "superadmin"]} />}>
            <Route path="/:id/counter" element={<Counter />} />
            <Route path="/:id/editdisplay" element={<EditDisplay />} />
          </Route>

          {/* Client Public Routes */}
          <Route path="/:id">
            <Route index element={<Home />} />
            <Route path="information" element={<Information />} />
            <Route path="paymentpage" element={<PaymentPage />} />
          </Route>
          <Route path="/:id/token" element={<Token />} />
          <Route path="/:id/information" element={<Information />} />
          <Route path="/:id/countdown" element={<Countdown />} />
          <Route path="/countdown/:id" element={<Countdown />} />
          <Route path="/display" element={<Display />} />
          <Route path="/:id/display" element={<Display />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          {/* Version route do not change this */}
          <Route
            path="/version"
            element={<>{process.env?.REACT_APP_VERSION || "Unknown"}</>}
          />
          <Route
            path="/health"
            element={<>OK</>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
