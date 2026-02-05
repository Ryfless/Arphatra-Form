import { Link, Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const location = useLocation();
  
  // Custom background for specific routes (Reset Password)
  const isResetPass = location.pathname === "/resetpass";
  const containerStyle = isResetPass 
    ? { backgroundImage: "url('/assets/images/background-collected.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : {};

  return (
    <div 
      className="font-poppins bg-rice min-h-screen flex flex-col transition-colors duration-500"
      style={containerStyle}
    >
      <header className="flex items-center justify-between px-6 md:px-16 pt-4 pb-2 shrink-0 z-[100]">
        <Link to="/" className="flex items-center cursor-pointer shrink-0">
          <img
            src="/assets/icons/arphatra-form-1.svg"
            alt="Logo Arphatra"
            className="w-24 md:w-32 h-auto"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-8 md:py-12 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
