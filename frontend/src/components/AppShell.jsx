import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default AppShell;