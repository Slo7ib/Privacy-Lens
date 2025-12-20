import React from "react";

interface IconCircleProps {
  icon: React.ReactNode;
  label?: string;
}

export const IconCircle = React.memo<IconCircleProps>(({ icon, label }) => {
  return (
    <div className="group mb-3 flex flex-col items-center justify-center">
      <div className="flex transform items-center justify-center rounded-full bg-linear-to-br from-yellow-500/20 to-yellow-600/10 p-3 shadow-lg transition duration-300 group-hover:scale-110 group-hover:from-yellow-500/30 group-hover:to-yellow-600/20 group-hover:shadow-xl">
        {icon}
      </div>

      {label ? (
        <span className="mt-2 h-4 -translate-y-1 transform text-xs text-gray-100 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          {label}
        </span>
      ) : null}
    </div>
  );
});

