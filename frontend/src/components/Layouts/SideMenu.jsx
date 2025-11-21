import React, { useContext } from "react";
import { RESEARCH_NAVBAR_DATA, SIDE_MENU_DATA } from "../../utils/data";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";
import { UserContext } from "../../context/userContext";

const SideMenu = ({ activeMenu, isResearchMenu, setOpenSideMenu }) => {
  const { user, clerkUserRole } = useContext(UserContext);
  const navigate = useNavigate();
  const handleClick = (route) => {
    if (route === "logout") {
      handelLogout();
      return;
    }

    setOpenSideMenu((prevState) => !prevState);
    navigate(route);
  };

  // const handelLogout = () => {
  //   localStorage.clear();
  //   setUser(null);
  //   setOpenSideMenu((prevState) => !prevState);
  //   navigate("/");
  // };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      {user && (
        <div className="flex flex-col items-center justify-center gap-1 mt-3 mb-7">
          {user?.imageUrl ? (
            <img
              src={user?.imageUrl || ""}
              alt="Profile Image"
              className="w-20 h-20 bg-slate-400 rounded-full"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName || ""}
              width="w-20"
              height="h-20"
              style="text-xl"
            />
          )}

          <div>
            <h5 className="text-gray-950 font-semibold text-center leading-6 mt-1">
              {user.fullName || ""}
            </h5>

            <p className="text-[13px] font-medium text-gray-800 text-center">
              {user?.primaryEmailAddress.emailAddress || ""}
            </p>
          </div>
        </div>
      )}

      {/* {(isResearchMenu ? RESEARCH_NAVBAR_DATA : SIDE_MENU_DATA).map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu == item.label
              ? "text-white bg-black"
              : ""
          } py-3 px-6 rounded-lg mb-3 cursor-pointer`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))} */}

      {(isResearchMenu ? RESEARCH_NAVBAR_DATA : SIDE_MENU_DATA)
  // 🔹 Filter out "Students" if user is not superadmin
  .filter(item => !(item.label === "Students" && clerkUserRole !== "superadmin"))
  .map((item, index) => (
    <button
      key={`menu_${index}`}
      className={`w-full flex items-center gap-4 text-[15px] ${
        activeMenu === item.label ? "text-white bg-black" : ""
      } py-3 px-6 rounded-lg mb-3 cursor-pointer`}
      onClick={() => handleClick(item.path)}
    >
      <item.icon className="text-xl" />
      {item.label}
    </button>
  ))}


      {/* {user && (
        <button
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 cursor-pointer`}
          onClick={() => handelLogout()}
        >
          <LuLogOut className="text-xl" />
          Logout
        </button>
      )} */}
    </div>
  );
};

export default SideMenu;
