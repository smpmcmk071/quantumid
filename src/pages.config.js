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
}

export const pagesConfig = {
    mainPage: "Marketing",
    Pages: PAGES,
    Layout: __Layout,
};