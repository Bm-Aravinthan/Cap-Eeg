import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  return  <div className="w-full items-center mt-14 sm:mt-16 text-black bg-[url('/src/assets/gradientBackground.png')] bg-no-repeat bg-cover min-h-screen my-12 sm:my-16">
    <div className="min-[1080px]:hidden">
      <Navbar activeMenu={activeMenu} />
    </div>

      { user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} setOpenSideMenu={()=>{}} />
          </div>

          <div className="grow mx-5">{children}</div>
        </div>
      )}
    </div>
};

export default DashboardLayout;
