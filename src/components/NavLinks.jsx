import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaList,
  FaPlus,
  FaCalendarAlt,
  FaChartBar,
  FaUser
} from "react-icons/fa";

const NavLinks = ({ isMobile = false, onMobileItemClick = () => {} }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const links = [
    {
      to: "/",
      icon: <FaHome className="mr-2" />,
      label: "Home"
    },
    {
      to: "/tasks",
      icon: <FaList className="mr-2" />,
      label: "Tasks"
    },
    {
      to: "/create",
      icon: <FaPlus className="mr-2" />,
      label: "New Task"
    },
    {
      to: "/calendar",
      icon: <FaCalendarAlt className="mr-2" />,
      label: "Calendar"
    },
    {
      to: "/analytics",
      icon: <FaChartBar className="mr-2" />,
      label: "Analytics"
    }
  ];
  
  // Add profile link only to mobile menu
  if (isMobile) {
    links.push({
      to: "/profile",
      icon: <FaUser className="mr-2" />,
      label: "Profile"
    });
  }
  
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`
            flex items-center px-3 py-2 rounded-md text-sm font-medium 
            ${isMobile ? 
              isActive(link.to) ? 
                'bg-white text-teal-800 font-bold' : 
                'text-white bg-teal-800 hover:bg-white hover:text-teal-800' :
              isActive(link.to) ? 
                'bg-white text-teal-800 font-bold' : 
                'bg-white bg-opacity-20 text-white hover:bg-white hover:text-teal-700'
            } transition-colors
          `}
          onClick={() => isMobile && onMobileItemClick()}
        >
          {link.icon} {link.label}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;