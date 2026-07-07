import { Outlet } from "react-router";
import AppLayout from "./app-layout";

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
