import About from './pages/About';
import Analyzer from './pages/Analyzer';
import Candidates from './pages/Candidates';
import Dashboard from './pages/Dashboard';
import JobPostings from './pages/JobPostings';
import Marketing from './pages/Marketing';
import MeetingPlanner from './pages/MeetingPlanner';
import MemberProfile from './pages/MemberProfile';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Analyzer": Analyzer,
    "Candidates": Candidates,
    "Dashboard": Dashboard,
    "JobPostings": JobPostings,
    "Marketing": Marketing,
    "MeetingPlanner": MeetingPlanner,
    "MemberProfile": MemberProfile,
    "Reports": Reports,
    "Teams": Teams,
}

export const pagesConfig = {
    mainPage: "Candidates",
    Pages: PAGES,
    Layout: __Layout,
};