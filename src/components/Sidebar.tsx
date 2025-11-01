"use client";

import { useState } from "react";
import { Home, Sparkles, Presentation, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("ai-slides");

  const menuItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "ai-slides", icon: Sparkles, label: "AI Slides" },
  ];

  return (
    <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
      {/* Menu Items */}
      <div className="flex-1 flex flex-col items-center space-y-4 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                activeItem === item.id ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 text-gray-700" />
            </button>
          );
        })}
      </div>

      {/* Bottom Arrow */}
      <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors mt-4">
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
