import Candidates from './pages/Candidates';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Analyzer from './pages/Analyzer';
import JobPostings from './pages/JobPostings';
import Reports from './pages/Reports';
import Marketing from './pages/Marketing';
import MeetingPlanner from './pages/MeetingPlanner';
import About from './pages/About';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Candidates": Candidates,
    "Dashboard": Dashboard,
    "Teams": Teams,
    "Analyzer": Analyzer,
    "JobPostings": JobPostings,
    "Reports": Reports,
    "Marketing": Marketing,
    "MeetingPlanner": MeetingPlanner,
    "About": About,
}

export const pagesConfig = {
    mainPage: "Candidates",
    Pages: PAGES,
    Layout: __Layout,
};