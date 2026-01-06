import About from './pages/About';
import Analyzer from './pages/Analyzer';
import Candidates from './pages/Candidates';
import Dashboard from './pages/Dashboard';
import JobPostings from './pages/JobPostings';
import Marketing from './pages/Marketing';
import MeetingPlanner from './pages/MeetingPlanner';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import MemberProfile from './pages/MemberProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Analyzer": Analyzer,
    "Candidates": Candidates,
    "Dashboard": Dashboard,
    "JobPostings": JobPostings,
    "Marketing": Marketing,
    "MeetingPlanner": MeetingPlanner,
    "Reports": Reports,
    "Teams": Teams,
    "MemberProfile": MemberProfile,
}

export const pagesConfig = {
    mainPage: "Candidates",
    Pages: PAGES,
    Layout: __Layout,
};