
import React from "react";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";

const AdminPanel = () => {
  console.log("AdminPanel - Rendering component");
  return (
    <div className="w-full overflow-hidden">
      <UsersDataFetcher />
    </div>
  );
};

export default AdminPanel;
