import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuSearch } from "react-icons/lu";
import { assets } from '../assets/assets'; 
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';
import SearchBarPopup from './SearchBarPopup';
import { UserContext } from '../context/userContext';
import JoinModal from './JoinModal';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { API_PATHS } from "../utils/apiPaths";

const Dashboard = ()=>(
    <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
</svg>
)

const NavBar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Research', path: '/research' },
        { name: 'Members', path: '/members' },
        { name: 'News', path: '/news' },
        { name: 'Publications', path: '/publications' },
        { name: 'Prospective Students', path: '/students' },
        { name: 'Media', path: '/media' },
        { name: 'Join The Lab', path: '/join' },
        { name: 'Contact', path: '/contact' },
    ];

    const { clerkUserRole } = useContext(UserContext);
    const { getToken } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSearchBar, setOpenSearchBar] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const { openSignIn } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [joinStatus, setJoinStatus] = useState({
        loading: true,
        hasRequested: false,
        status: null,
    });

    const searchFunction = () => {
        setOpenSearchBar(true);
        setIsMenuOpen(false);
    }

    const dashboardFunction = () => {
        // () => navigate('/admin/dashboard')
        navigate('/admin/dashboard')
        setIsMenuOpen(false);
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch join request status for the logged-in student
    const fetchJoinRequestStatus = async () => {
        try {
        const token = await getToken();
        const res = await axios.get(API_PATHS.AUTH.JOIN_REQUESTS_STATUS, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setJoinStatus({
            loading: false,
            hasRequested: res.data?.hasRequested,
            status: res.data?.status,
        });
        
        } catch (err) {
        console.log("Status fetch error:", err);
        setJoinStatus({ loading: false, hasRequested: false, status: null });
        }
    };

    useEffect(() => {
        if (user) fetchJoinRequestStatus();
    }, [user]);

    return (
        <>
            <nav className={`fixed top-0 left-0 bg-indigo-500 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-2 md:py-3" : "py-3 md:py-4"}`}>

                {/* Logo */}
                <Link to='/'>
                    <img src={assets.logo} alt="logo" className={`h-9 invert ${isScrolled && "invert-0 opacity-80"}`} />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8 text-[12px]">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                            {link.name}
                            <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                        </a>
                    ))}

                    {/* {joinStatus.loading && (
                    <button className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`} disabled>
                        Checking...
                    </button>
                    )} */}

                    {clerkUserRole === "member" && !joinStatus.hasRequested && (
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`}
                    >
                        Join
                    </button>
                    )}

                    {clerkUserRole === "member" && joinStatus.hasRequested && joinStatus.status === "pending" && (
                        <button
                        // className="px-5 py-2 bg-yellow-500 text-white rounded-lg "
                        className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-default ${isScrolled ? 'text-black' : 'text-white'} transition-all`}
                        disabled
                        >
                        Requested
                        </button>
                    )}


                    {["admin", "superadmin"].includes(clerkUserRole) && <button onClick={() => navigate('/admin/dashboard')} className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`}>
                        Dashboard
                    </button>}
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center gap-4">
                    {/* <img src={assets.searchIcon} alt="" className={`h-7 transition-all duration-500 ${isScrolled ? "invert" : ""}`} /> */}
                    {/* <button className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}>
                        Login
                    </button> */}

                    <button className={`cursor-pointer ${isScrolled ? "text-gray-700" : "text-white"}`} onClick={() => setOpenSearchBar(true)}>
                        <LuSearch className="text-[22px]" />
                    </button>

                    {user ? 
                    (<UserButton>
                        <UserButton.MenuItems>
                            {
                                ["admin", "superadmin"].includes(clerkUserRole) && <UserButton.Action label='Dashboard' labelIcon={<Dashboard />} onClick={() => navigate('/admin/dashboard')}/>
                            }
                            {/* <UserButton.Action label='Dashboard' labelIcon={<Dashboard />} onClick={() => navigate('/admin/dashboard')}/> */}
                        </UserButton.MenuItems>
                    </UserButton>) 
                    : 
                    (<button onClick={openSignIn} className={`text-[12px] px-3 py-2 rounded-full transition-all duration-500 cursor-pointer ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}>
                        Login
                    </button>)}
                    
                </div>

                {/* Mobile Menu Button */}

                <div className="flex items-center gap-3 md:hidden">
                    {clerkUserRole === "member" && !joinStatus.hasRequested && (
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-pointer ${isScrolled ? 'text-black' : 'text-white'} transition-all`}
                    >
                        Join
                    </button>
                    )}

                    {clerkUserRole === "member" && joinStatus.hasRequested && joinStatus.status === "pending" && (
                        <button
                        // className="px-5 py-2 bg-yellow-500 text-white rounded-lg "
                        className={`border px-3 py-1 text-[12px] font-light rounded-full cursor-default ${isScrolled ? 'text-black' : 'text-white'} transition-all`}
                        disabled
                        >
                        Requested
                        </button>
                    )}


                    { user && <UserButton>
                        <UserButton.MenuItems>
                            {
                                ["admin", "superadmin"].includes(clerkUserRole) && <UserButton.Action label='Dashboard' labelIcon={<Dashboard />} onClick={() => navigate('/admin/dashboard')}/>
                            }
                            {/* <UserButton.Action label='Dashboard' labelIcon={<Dashboard />} onClick={() => navigate('/admin/dashboard')}/> */}
                        </UserButton.MenuItems>
                    </UserButton>}

                    {/* <svg onClick={() => setIsMenuOpen(!isMenuOpen)} className={`h-6 w-6 cursor-pointer ${isScrolled ? "invert" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                    </svg> */}
                    <img src={assets.menuIcon} alt="open-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className={`h-4 cursor-pointer ${isScrolled ? "invert" : ""}`}/>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                        {/* <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg> */}
                        <img src={assets.closeMenu} alt="close-menu" className="h-6.5 cursor-pointer"/>
                    </button>

                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
                            {link.name}
                        </a>
                    ))}

                    {["admin", "superadmin"].includes(clerkUserRole) && <button onClick={() => dashboardFunction()} className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all">
                        Dashboard
                    </button>}

                    {/* <button className="cursor-pointer flex items-center justify-center gap-1.5" onClick={() => setOpenSearchBar(true)}> */}
                    <button className="cursor-pointer flex items-center justify-center gap-1.5" onClick={() => searchFunction()}>
                        <LuSearch className="text-[20px]" />
                        Search
                    </button>

                    {!user && <button onClick={openSignIn} className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
                        Login
                    </button>}
                </div>
                <SearchBarPopup isOpen={openSearchBar} setIsOpen={setOpenSearchBar} />
            </nav>
            
            {/* {showJoinModal && (
                    <JoinModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={() => setShowJoinModal(false)}
                    />
            )} */}

            <JoinModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />

        </>
    );
}
export default NavBar