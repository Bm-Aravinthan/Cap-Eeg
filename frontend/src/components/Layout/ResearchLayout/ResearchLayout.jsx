import ResearchNavbar from "./ResearchNavbar"

const ResearchLayout = ({children, activeMenu}) => {
  return (
    <div className="w-full items-center mt-16 sm:mt-20 text-black bg-cover min-h-screen my-12 sm:my-16">
    {/* <div className=""> */}
        {/* <ResearchNavbar activeMenu={activeMenu} /> */}
        <div className="container mx-auto px-5 md:px-0 mt-0"> {children} </div>
    </div>
  )
}
export default ResearchLayout