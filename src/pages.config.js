/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AdminTools from './pages/AdminTools';
import Analyzer from './pages/Analyzer';
import BirthdayInsights from './pages/BirthdayInsights';
import Candidates from './pages/Candidates';
import CompatibilityReport from './pages/CompatibilityReport';
import Dashboard from './pages/Dashboard';
import JobPostings from './pages/JobPostings';
import Marketing from './pages/Marketing';
import MeetingPlanner from './pages/MeetingPlanner';
import MemberProfile from './pages/MemberProfile';
import MyProfile from './pages/MyProfile';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import UserMusicProfileSetup from './pages/UserMusicProfileSetup';
import MusicDiscovery from './pages/MusicDiscovery';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminTools": AdminTools,
    "Analyzer": Analyzer,
    "BirthdayInsights": BirthdayInsights,
    "Candidates": Candidates,
    "CompatibilityReport": CompatibilityReport,
    "Dashboard": Dashboard,
    "JobPostings": JobPostings,
    "Marketing": Marketing,
    "MeetingPlanner": MeetingPlanner,
    "MemberProfile": MemberProfile,
    "MyProfile": MyProfile,
    "Reports": Reports,
    "Teams": Teams,
    "UserMusicProfileSetup": UserMusicProfileSetup,
    "MusicDiscovery": MusicDiscovery,
}

export const pagesConfig = {
    mainPage: "About",
    Pages: PAGES,
    Layout: __Layout,
};