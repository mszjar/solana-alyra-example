import React from "react";
import { WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import "./Navbar.css";
import menu_icon from "../../assets/menu.png";
import logo from "../../assets/logo_sm.png";
import mescena from "../../assets/mescena.png";
import search_icon from "../../assets/search.png";
import notification_icon from "../../assets/notification.png";
import profile_icon from "../../assets/jack.png";
import { Link } from "react-router-dom";

interface NavbarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  solanaBalance: number | null;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen, solanaBalance }) => {
  return (
    <nav className="flex-div">
      <div className="nav-left flex-div">
        <img
          className="menu-icon"
          src={menu_icon}
          onClick={() => setSidebarOpen((prev: boolean) => prev === false)}
          alt=""
        />
        <Link to="/">
          <img className="logo" src={logo} alt="" />
          <img className="logo_name" src={mescena} alt="" />
        </Link>
      </div>
      <div className="nav-middle flex-div">
        <div className="search-box flex-div">
          <input type="text" placeholder="Search" />
          <img src={search_icon} alt="" />
        </div>
      </div>
      <div className="nav-right flex-div">
        <img src={notification_icon} alt="" />
        <div className='wallet'>
          {
            solanaBalance !== null && 
            (
              <div>
                <p>Balance: {solanaBalance} SOL</p>
              </div>
            )
          }
          <WalletMultiButton></WalletMultiButton>
        </div>
        <img src={profile_icon} className="user-icon" alt="" />
      </div>
    </nav>
  );
}

export default Navbar;
