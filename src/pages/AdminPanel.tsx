
import React from "react";
import { UsersDataFetcher } from "@/components/admin/UsersDataFetcher";
import { CreateAdminButton } from "@/components/admin/CreateAdminButton";

const AdminPanel = () => {
  console.log("AdminPanel - Rendering component");
  return (
    <div className="w-full overflow-hidden">
      <div className="mb-6 flex justify-end">
        <CreateAdminButton />
      </div>
      <UsersDataFetcher />
    </div>
  );
};

export default AdminPanel;
