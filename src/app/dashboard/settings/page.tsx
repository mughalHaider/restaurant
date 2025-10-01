// src/app/dashboard/settings/page.tsx
'use client';

import { withRole } from "@/lib/withRole";

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-gray-600">
        Manage your account and app preferences here.
      </p>

      <div className="mt-6 space-y-4">
        {/* Example Settings Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span>Email Notifications</span>
              <input type="checkbox" className="toggle-checkbox" defaultChecked />
            </li>
            <li className="flex justify-between items-center">
              <span>Dark Mode</span>
              <input type="checkbox" className="toggle-checkbox" />
            </li>
          </ul>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Security</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span>Two-Factor Authentication</span>
              <button className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                Enable
              </button>
            </li>
            <li className="flex justify-between items-center">
              <span>Change Password</span>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Update
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}


export default withRole(SettingsPage, ["admin"]);