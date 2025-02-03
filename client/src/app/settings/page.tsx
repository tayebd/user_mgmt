import React from "react";

const Settings = () => {
  const userSettings = {
    username: "johndoe",
    email: "john.doe@example.com",
    teamName: "Development Team",
    roleName: "Developer",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Setting</th>
              <th className="py-2 px-4 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4">Username</td>
              <td className="py-2 px-4">{userSettings.username}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4">Email</td>
              <td className="py-2 px-4">{userSettings.email}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4">Team</td>
              <td className="py-2 px-4">{userSettings.teamName}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4">Role</td>
              <td className="py-2 px-4">{userSettings.roleName}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
