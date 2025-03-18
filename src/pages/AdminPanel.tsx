
import React from "react";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";

// AdminPanel is now simplified since the ProtectedRoute component handles authentication
const AdminPanel = () => {
  return <UsersDataFetcher />;
};

export default AdminPanel;
