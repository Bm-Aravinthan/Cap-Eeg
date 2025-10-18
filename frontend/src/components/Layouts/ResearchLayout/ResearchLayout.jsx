import ResearchNavbar from "./ResearchNavbar"

const ResearchLayout = ({children, activeMenu}) => {
  return (
    <div>
        <ResearchNavbar activeMenu={activeMenu} />
        <div className="container mx-auto px-5 md:px-0 mt-10"> {children} </div>
    </div>
  )
}
export default ResearchLayout