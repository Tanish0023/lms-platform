import { NavbarRoutes } from "@/components/navbar-routes"
import { MobileSidebar } from "./mobile-sidebar"

export const Navbar = () =>{
    return(
        <div className="h-full border-b flex items-center p-4 bg-white shadow-sm">
           <MobileSidebar/>
           <NavbarRoutes/>
        </div>
    )
}